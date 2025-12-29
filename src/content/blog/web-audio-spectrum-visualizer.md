---
title: Web Audio APIで最強のスペクトラム・アナライザを作る（基本から応用まで）
description: 'Web Audio APIとCanvasを使って、プロ仕様のオーディオビジュアライザーを一から実装する方法を解説します。対数スケール表示、ウォーターフォール（スペクトログラム）、チューナー機能の実装まで詳解。'
pubDate: '2025-12-29'
heroImage: '../../assets/audio.png'
categories: ['JavaScript', 'Web Audio API', 'Canvas']
---

## はじめに

音楽を目で見て楽しむ「オーディオビジュアライザー」。
iTunesやWinampの全盛期には当たり前のように搭載されていましたが、Web技術の進化により、ブラウザ上でも驚くほど高性能なビジュアライザーが作れるようになりました。

今回は、GitHubで公開されている [Web-Audio-Visualizer](https://github.com/97kuek/Web-Audio-Visualizer) の実装をベースに、**「ただ動く」レベルを超えた、実用的な解析ツールとしても使えるビジュアライザー**の作り方を一から解説します。

この記事で実装するのは以下の3つの機能です。

1.  **Spectrum (スペクトル)**: 音の周波数成分を棒グラフや線グラフで表示。人間が聴きやすい「対数スケール」を採用します。
2.  **Spectrogram (スペクトログラム)**: 音の履歴を時間軸で可視化する「ウォーターフォール」表示。
3.  **Tuner (チューナー)**: 現在鳴っている支配的な音の高さ（ピッチ）を判定して表示。

## 1. Web Audio API の基本構成

まず、音を扱うための心臓部である `AudioContext` を準備します。
Web Audio APIのフローは「ノード（Node）」をつなぎ合わせるグラフ構造になっています。

```
[音源(Source)] -> [解析(Analyser)] -> [出力(Destination = Speaker)]
```

主要なコードは `AudioController` クラスとして管理すると見通しが良くなります。

```javascript
class AudioController {
    constructor() {
        // クロスブラウザ対応のAudioContext初期化
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        // 解析用ノードの作成
        this.analyser = this.ctx.createAnalyser();
        
        // FFTサイズの設定（2の累乗であること）
        // 2048の場合、周波数データは1024個(bin)得られます
        this.analyser.fftSize = 2048; 
        
        // スムージング（0.0～1.0）
        // 値が大きいほど動きが滑らかになります
        this.analyser.smoothingTimeConstant = 0.8; 
        
        // データ格納用の配列を準備（TypedArrayを使うのがパフォーマンスの肝）
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
}
```

### マイク入力を接続する

「マイクの音をリアルタイムで解析したい」という場合は、`navigator.mediaDevices.getUserMedia` を使います。

```javascript
async setupMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // 既存の接続があれば切断
        if (this.source) this.source.disconnect();
        
        // メディアストリームからソースを作成
        this.source = this.ctx.createMediaStreamSource(stream);
        
        // ソース -> アナライザー
        this.source.connect(this.analyser);
        
        // ※マイク使用時はハウリング防止のため、analyser -> destination(スピーカー)には接続しません
    } catch (error) {
        console.error('マイクへのアクセスが拒否されました:', error);
    }
}
```

### オーディオファイルを接続する

ファイル選択で読み込んだ音楽ファイルを解析する場合は、`<audio>` 要素を経由するのが簡単です。

```javascript
setupFile(file) {
    if (this.source) this.source.disconnect();

    const audioEl = new Audio(URL.createObjectURL(file));
    this.source = this.ctx.createMediaElementSource(audioEl);
    
    // ソース -> アナライザー -> スピーカー
    // 音楽ファイルの場合は音を聴きたいので、destinationにも繋ぎます
    this.source.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    
    audioEl.play();
}
```

これで、`this.analyser.getByteFrequencyData(this.dataArray)` を呼び出せば、いつでも現在の周波数データ（0～255の配列）が取得できるようになりました。

---

## 2. Canvasによる描画の最適化

次に、取得したデータを可視化する `Visualizer` クラスを作成します。
描画は `requestAnimationFrame` を使って、ブラウザのリフレッシュレート（通常60fps）に合わせて行います。

### Spectrum: 周波数の可視化

単純に配列データを左から右へ描画すると、低音域（左側）がスカスカで、高音域（右側）に情報が密集してしまいます。これは、人間の耳が音の高さを「対数」で感じ取っているためです（ド・レ・ミの音階も対数的な周波数比率です）。

そこで、**対数スケール (Log Scale)** で描画します。

```javascript
drawSpectrum() {
    // 画面クリア
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);
    
    const minFreq = 20;    // 表示したい最小周波数 (Hz)
    const maxFreq = 20000; // 表示したい最大周波数 (Hz)
    const sampleRate = this.audioController.ctx.sampleRate; // 通常44100Hzや48000Hz
    
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#00ff00';

    for (let i = 0; i < this.dataArray.length; i++) {
        const amplitude = this.dataArray[i]; // 振幅 (0-255)
        
        // 現在のインデックスに対応する周波数を計算
        // index * (サンプリングレート / FFTサイズ)
        const frequency = i * sampleRate / this.audioController.analyser.fftSize;
        
        // 表示範囲外はスキップ
        if (frequency < minFreq || frequency > maxFreq) continue;
        
        // 対数スケール変換: X座標の計算
        // Math.log10(curr / min) / Math.log10(max / min) で 0.0～1.0 に正規化
        const x = (Math.log10(frequency / minFreq) / Math.log10(maxFreq / minFreq)) * width;
        
        // 振幅に応じたY座標
        const y = height - (amplitude / 255) * height;

        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
}
```

これで、市販のイコライザーのような「音楽的な」見た目になります。

### Spectrogram: ウォーターフォール表示のテクニック

スペクトログラム（時間の経過とともに流れていくヒートマップ）の実装には、パフォーマンス上の工夫が必要です。
毎回すべての履歴を描画し直すと非常に重くなるため、**オフスクリーンキャンバス**を活用し、「コピーしてずらす」テクニックを使います。

1.  オフスクリーンキャンバス（履歴保存用）を用意する。
2.  今のフレームのデータを、オフスクリーンキャンバスの**一番上の1行**に描画する。
3.  メインキャンバスに、オフスクリーンキャンバスの内容を描画するが、**1ピクセル下にずらして**描画する（これで流れているように見える）。
4.  オフスクリーンキャンバス自体も、自分の内容を1ピクセル下にずらして保存し直す。

```javascript
// 毎フレーム実行する処理の一部
drawSpectrogram(dataArray) {
    // 1. 現在の周波数データを1ラインの画像として生成
    // (ここではデータ配列からImageDataを作成する処理などは省略)
    // 振幅値(0-255)を色(青->緑->赤など)に変換して tempCanvas の (0, 0) に描画します
    
    // 2. 履歴キャンバスの内容を1ピクセル下にずらしてコピー
    // drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh)
    this.historyCtx.drawImage(
        this.historyCanvas, 
        0, 0, width, height - 1, // コピー元: 上端から下端-1pxまで
        0, 1, width, height - 1  // コピー先: 1px下げて描画
    );
    
    // 3. 一番上の行に新しいデータを描画
    this.historyCtx.drawImage(tempCanvas, 0, 0);
    
    // 4. メインキャンバスに履歴全体を表示
    this.mainCtx.drawImage(this.historyCanvas, 0, height * 0.6); // 画面下部に配置
}
```

この方法なら、過去のデータを配列で何千件も保持して毎回走査する必要がなく、`drawImage` というブラウザネイティブの高速な画像処理だけで実現できます。

---

## 3. Tuner: ピッチ検出アルゴリズム

最後に、「今鳴っている音の高さ」を当てるチューナー機能です。
簡易的な実装として、FFTデータの中で**最も振幅が大きい周波数**を探す方法（ピーク検出）があります。

```javascript
getDominantFrequency() {
    let maxVal = -1;
    let maxIndex = -1;
    
    // 最大値を探す
    for (let i = 0; i < this.dataArray.length; i++) {
        if (this.dataArray[i] > maxVal) {
            maxVal = this.dataArray[i];
            maxIndex = i;
        }
    }
    
    // ノイズ除去: 音量が小さすぎる場合は無視
    if (maxVal < 100) return null;
    
    // インデックスを周波数に変換
    const sampleRate = this.audioController.ctx.sampleRate;
    const frequency = maxIndex * sampleRate / this.audioController.analyser.fftSize;
    
    return frequency;
}
```

得られた周波数を音名（C4, A4など）に変換するには、以下の式を使います。A4（ラ）を440Hz基準とします。

```javascript
const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function getNote(frequency) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const midi = Math.round(noteNum) + 69;
    
    const note = noteStrings[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    
    return `${note}${octave}`; // 例: "A4"
}
```

※精度を上げるためには、単なる最大値ではなく、周囲のビンの値を加味して補間（Quadratic Interpolation等）を行ったり、自己相関関数（Autocorrelation）を用いたりするのが一般的ですが、シンプルな楽器チューナーとしてはこれでも十分動作します。

---

## まとめ

Web Audio APIとCanvasを組み合わせることで、専用ソフト顔負けのオーディオ解析ツールがブラウザだけで作れるようになりました。

- `AudioContext` と `AnalyserNode` で周波数データを取得
- 対数スケール変換で「聴感に近い」グラフを描画
- `drawImage` による画像のずらし処理で高速なウォーターフォール表示

今回のコードをベースに、3D表示に挑戦してみたり、エフェクトをかけてみたりと、ぜひ自分だけのビジュアライザーを作ってみてください。

完全なソースコードはこちらで公開しています
https://github.com/97kuek/Web-Audio-Visualizer