---
title: Web Audio APIでスペクトラム・アナライザを作る
description: 'Web Audio APIとCanvasを使って、スペクトラム・アナライザを一から実装する方法を解説します。対数スケール表示、ウォーターフォール（スペクトログラム）、チューナー機能の実装まで詳解。'
pubDate: '2025-12-29'
heroImage: '../../assets/audio.png'
categories: ['JavaScript', 'Web Audio API', 'Canvas']
---

音楽を目で見て楽しむ「オーディオビジュアライザー」。
iTunesやWinampの全盛期には当たり前のように搭載されていましたが、Web技術の進化により、ブラウザ上でも驚くほど高性能なビジュアライザーが作れるようになりました。

この記事では、私がGitHubで公開している [Web-Audio-Visualizer](https://github.com/97kuek/Web-Audio-Visualizer) の核心部分を解説し、**ある程度プログラミングを知っている方が、自力でこのレベルのアプリケーションを作れるようになる**ことを目指します。

「ただ動く」レベルを超えた、実用的な解析ツールとしても使えるビジュアライザーを一緒に作ってみましょう。

## 作るもの

今回実装するのは、以下の3つの機能を持つ本格的なビジュアライザーです。

1.  **Spectrum Analyzer (スペクトル)**: 音の周波数成分を棒グラフで表示します。人間が聴きやすい「対数スケール」を採用します。
2.  **Spectrogram (スペクトログラム)**: 音の履歴を時間軸で可視化する、いわゆる「ウォーターフォール」表示です。
3.  **Tuner (チューナー)**: 現在鳴っている支配的な音の高さ（ピッチ）を判定して表示します。

## 目次

1.  Web Audio API の基本概念
2.  プロジェクトの準備（HTML/CSS）
3.  オーディオエンジンの実装
4.  ビジュアライザーの実装：スペクトラム編
5.  ビジュアライザーの実装：スペクトログラム編
6.  おまけ：チューナー（音高検出）の実装

---

## 1. Web Audio API の基本概念

実装に入る前に、これから使う道具の整理をしましょう。
Web Audio APIは、**「ノード（Node）」と呼ばれる部品をケーブルで繋いでいく**ようなイメージで音を扱います。ギターのエフェクターをつなぐ感覚に近いです。

*   **AudioContext**: すべてを取り仕切る司令塔。こいつがいないと始まりません。
*   **SourceNode**: 音の発生源。マイク、MP3ファイル、発振器など。
*   **AnalyserNode**: 音をリアルタイムで解析する装置。今回の主役です。
*   **DestinationNode**: 最終的な出力先（スピーカー）。

```text
[マイク(Source)] ──> [解析機(Analyser)] ──> [スピーカー(Destination)]
```

基本はこの流れです。今回はこの間に「解析機」を挟んで、そこからデータを取り出してCanvasに描画します。

---

## 2. プロジェクトの準備（HTML/CSS）

まずは土台作りです。HTMLはシンプルに、描画用の `canvas` と、操作用のボタンを置くだけにしておきましょう。CSSでCanvasを全画面に広げます。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>My Audio Visualizer</title>
    <style>
        body { margin: 0; background: #000; overflow: hidden; }
        canvas { display: block; width: 100vw; height: 100vh; }
        #controls {
            position: absolute; top: 20px; left: 20px; z-index: 10;
        }
        button {
            background: rgba(255, 255, 255, 0.1);
            color: #fff; border: 1px solid #fff;
            padding: 10px 20px; cursor: pointer;
            backdrop-filter: blur(5px);
        }
        button:hover { background: rgba(255, 255, 255, 0.3); }
    </style>
</head>
<body>
    <div id="controls">
        <button id="btn-mic">マイク入力で開始</button>
    </div>
    <!-- 描画領域 -->
    <canvas id="visualizer"></canvas>

    <script type="module" src="./main.js"></script>
</body>
</html>
```

---

## 3. オーディオエンジンの実装

ここからが本番です。`AudioController` というクラスを作って、音響周りの処理をまとめて管理しましょう。

### AudioContext の作成

ブラウザのセキュリティポリシーにより、**「ユーザーが何か操作（クリックなど）をするまで音を出してはいけない（AudioContextを再開してはいけない）」**というルールがあります。なので、初期化処理はボタンクリック時などに呼ぶように設計します。

```javascript
// audioController.js
export class AudioController {
    constructor() {
        this.ctx = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null; // 解析データを格納する配列
    }

    init() {
        // クロスブラウザ対応のAudioContext初期化
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        // アナライザー（解析機）を作成
        this.analyser = this.ctx.createAnalyser();
        
        // ■ FFTサイズの設定（重要）
        // 2の累乗である必要があります（例: 2048, 4096, 8192...）
        // 数字が大きいほど周波数分解能が上がります（細かい音の違いがわかる）。
        // ただし、反応速度（時間分解能）は落ちます。
        // 今回はバランスの良い 2048 を採用します。
        this.analyser.fftSize = 2048;

        // ノイズを減らしてグラフの動きを滑らかにする係数 (0.0 ~ 1.0)
        this.analyser.smoothingTimeConstant = 0.85;

        // データの入れ物を用意
        // frequencyBinCount は fftSize の半分になります（この場合 1024個のデータが得られる）
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
    }
}
```

### マイク入力の接続

`navigator.mediaDevices.getUserMedia` を使ってマイクのストリームを取得し、それをSourceNodeとしてWeb Audio APIの世界に引き込みます。

```javascript
    async setupMicrophone() {
        try {
            // マイクの使用許可を求める
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 既に接続がある場合は切断してメモリリークを防ぐ
            if (this.source) this.source.disconnect();

            // マイクストリームからソースノードを作成
            this.source = this.ctx.createMediaStreamSource(stream);
            
            // ソースをアナライザーに接続
            this.source.connect(this.analyser);
            
            // ※重要: マイク入力の場合は、destination（スピーカー）には接続しません。
            // 接続すると自分の声が遅れて聞こえて、ひどいハウリングの原因になります。
            
        } catch (err) {
            console.error('マイクの取得に失敗しました:', err);
            alert('マイクへのアクセスが拒否されました');
        }
    }
```

### データの取得

これで準備完了です。あとは描画ループの中で以下のメソッドを呼べば、その一瞬の「音の成分」が `this.dataArray` に `0`〜`255` の数値として格納されます。

```javascript
    update() {
        if (!this.analyser) return;
        // 時間領域データではなく、周波数データを取得
        this.analyser.getByteFrequencyData(this.dataArray);
    }
```

---

## 4. ビジュアライザーの実装：スペクトラム編

取得したデータ（`dataArray`）をCanvasに描画していきましょう。
単純に左から右へ棒グラフを描くだけなら簡単ですが、**「音楽的」に自然な見た目にするためには一工夫必要です。**

### 対数スケールの重要性

`dataArray` のデータはリニア（等間隔）な周波数で並んでいます。
しかし、人間の耳は**低い音ほど細かく、高い音ほど大雑把に**音程を感じ取ります（対数感覚）。ドレミの音階も周波数は対数的に増えています。
これをそのままリニアに描画してしまうと、画面の左端10%くらいに重要な情報が全部詰まってしまい、右側はずっとペタンコ...という残念な見た目になります。

これを解消するために、X軸を**対数スケール(Log Scale)**に変換して描画します。

```javascript
// visualizer.js
export class Visualizer {
    constructor(canvas, audioController) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = audioController;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // 解像度対応（Retinaディスプレイなどでぼやけないように）
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.ctx.scale(dpr, dpr);
        
        // CSS上の見た目のサイズ
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    draw() {
        requestAnimationFrame(() => this.draw());
        
        // データの更新
        this.audio.update();
        const data = this.audio.dataArray;
        if (!data) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        // 画面を黒でクリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, w, h);

        this.drawSpectrum(data, w, h);
    }

    drawSpectrum(data, w, h) {
        const ctx = this.ctx;
        const sampleRate = this.audio.ctx.sampleRate; // 通常44100Hzなど
        const fftSize = this.audio.analyser.fftSize;
        
        // 表示したい周波数レンジを設定（人間の可聴域に合わせて）
        const minFreq = 20;
        const maxFreq = 20000;
        
        ctx.beginPath();
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

        for (let i = 0; i < data.length; i++) {
            const amplitude = data[i]; // 振幅 (0~255)
            
            // このインデックスの周波数を計算
            const frequency = i * sampleRate / fftSize;
            
            // 表示範囲外ならスキップ
            if (frequency < minFreq || frequency > maxFreq) continue;

            // ■ここが最大のポイント：対数スケール変換
            // Math.log10を使って、周波数を0.0〜1.0の位置に正規化します
            const logX = Math.log10(frequency / minFreq) / Math.log10(maxFreq / minFreq);
            const x = logX * w;
            
            // 振幅が大きいほど上に描画
            const y = h - (amplitude / 255) * h;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
```

この「対数変換係数 `logX`」を使うだけで、低音から高音までバランスよく踊るプロっぽいグラフになります。

---

## 5. ビジュアライザーの実装：スペクトログラム編

スペクトログラム（ウォーターフォール）は、音の履歴を時間経過とともに流していく表示です。
「過去数千フレーム分のデータを配列で持っておいて毎回全部描画する」のは重すぎるので、**「Canvas自体を画像としてコピーして、1ピクセルずらす」**という古くからの高速化テクニックを使います。

```javascript
    // クラスのプロパティに追加
    // this.offCanvas = document.createElement('canvas'); // 履歴保持用の裏キャンバス
    // this.offCtx = this.offCanvas.getContext('2d');
    
    drawSpectrogram(data, w, h) {
        // オフスクリーンCanvasのサイズ調整（初期化時やリサイズ時）
        if (this.offCanvas.width !== w || this.offCanvas.height !== h) {
            this.offCanvas.width = w;
            this.offCanvas.height = h;
        }

        // 1. 今のCanvasの状態を、1ピクセル下にずらして自分自身にコピーする
        // drawImage(source, sx, sy, sw, sh, dx, dy, dw, dh)
        this.offCtx.drawImage(
            this.offCanvas, 
            0, 0, w, h - 1,   // コピー元: 上端から下端-1pxまで
            0, 1, w, h - 1    // コピー先: 1px下げて描画
        );

        // 2. 空いた一番上の1行に、現在のデータを描画する
        // （実際にはImageDataを使って1ピクセルずつ打つのが高速ですが、ここでは概念として矩形で描きます）
        const barWidth = w / data.length; // 本当は対数スケールで計算すべき場所です

        for (let i = 0; i < data.length; i++) {
            const amplitude = data[i];
            // 音量に応じた色を作成（HSLが便利）
            // 音量が大きい(255)ほど赤く、小さい(0)ほど青く
            const hue = 240 - (amplitude / 255) * 240; 
            
            this.offCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            // 本来はここも「対数スケールのX座標」に書き込む必要があります
            // 簡略化してリニアに描画しています
            this.offCtx.fillRect(i * barWidth, 0, barWidth, 1);
        }

        // 3. 最後にメインCanvasの下半分などに合成して表示
        this.ctx.drawImage(this.offCanvas, 0, h / 2, w, h / 2);
    }
```

この方法なら、毎フレーム「1行分の描画」と「画像コピー」しか行わないため、非常に高速に動作します。

---

## 6. おまけ：チューナー（音高検出）の実装

「今鳴っている音はドレミのどれ？」を知るための簡易的なチューナー機能を実装します。
基本戦略は **「一番エネルギーが大きい周波数（ピーク）を探す」** です。

```javascript
    getDominantNote() {
        const data = this.audio.dataArray;
        let maxVal = -1;
        let maxIndex = -1;

        // 一番大きい値を持つインデックス（ビン）を探す
        for(let i=0; i<data.length; i++) {
            if(data[i] > maxVal) {
                maxVal = data[i];
                maxIndex = i;
            }
        }

        // ノイズ対策：音が小さすぎる場合は「検出不能」とする
        if (maxVal < 50) return null;

        const sampleRate = this.audio.ctx.sampleRate;
        const fftSize = this.audio.analyser.fftSize;
        
        // インデックス → 周波数(Hz)
        const frequency = maxIndex * sampleRate / fftSize;

        // 周波数 → 音名（A4=440Hz基準）
        // 公式: 12 * log2(freq / 440) でA4からの半音のズレ数が求まる
        const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        
        let noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
        let midiNote = Math.round(noteNum) + 69; // MIDIノート番号
        
        const note = noteNames[midiNote % 12];
        const octave = Math.floor(midiNote / 12) - 1;

        return `${note}${octave}`; // 例: "A4"
    }
```

これで「A4」や「C#5」といった文字列が取得できます。これを `ctx.fillText` で画面中央に大きく表示すれば、簡易的な楽器チューナーとしても機能します。

※本格的なチューナーをつくろうとすると、倍音（Fundamental以外）を誤検知する問題に対処するために、「自己相関関数 (Autocorrelation)」などのより高度なアルゴリズムが必要になりますが、第一歩としてはこのピーク検出でも十分に楽しめます。

## 最後に

Web Audio APIとCanvasの組み合わせは、アイデア次第で無限の表現が可能です。
今回のコードをベースに、3Dライブラリ（Three.js）と組み合わせて音に合わせて3Dオブジェクトを動かしたり、パーティクルを飛ばしてみたりと、ぜひ自分だけのビジュアライザーを作ってみてください。

完成したソースコード全体や、より高度な設定項目を含んだ実装は以下のリポジトリで公開しています。もし参考になったらスターをもらえるととても嬉しいです！

https://github.com/97kuek/Web-Audio-Visualizer