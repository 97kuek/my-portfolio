---
title: '【完全解説】PythonでKindleを全ページ自動スクショしてPDF化する技術のすべて'
description: 'Kindleで買った技術書をPDFで検索したい…そんな悩みを解決する自作ツールの開発秘話。Python + Win32API + FastAPIで実現する、泥臭くも強力な自動化のロジックを徹底解説します。'
pubDate: '2025-12-28'
categories: ['Python']
heroImage: '../../assets/kindle.png'
---

「Kindleで買った技術書、PDFで検索したい…」
そう思ったことはありませんか？
市販のツールは使いにくかったり、有料だったり。
そこで今回は、**Pythonを使ってKindle for PCを完全自動制御し、全ページをキャプチャしてPDF化するツール** を自作しました。

表面上はモダンなWebブラウザUIですが、裏側では泥臭くも強力なWindows制御技術が詰まっています。
この記事では、具体的なコードを交えながら、その「自動化のロジック」を徹底解説します。

---

## 1. 自動化の全体フロー

Kindle本をPDF化する手順は、人間がやる場合もプログラムがやる場合も同じです。

1.  Kindleのウィンドウを見つける。
2.  スクショを撮る。
3.  次のページへめくる。
4.  最後まで繰り返す。
5.  集めた画像をPDFに結合する。

これをPythonでどう実装するか、順に見ていきます。

---

## 2. ターゲットウィンドウの特定 (Win32API)

スクリーンショットを撮るには、まず「Kindleが画面のどこにあるか（座標）」を知る必要があります。
これには Windows API (Win32API) を使用します。

### `EnumWindows` でウィンドウを探す

Pythonの標準ライブラリ `ctypes` を使い、起動しているすべてのウィンドウを走査します。

```python
# src/window_utils.py (抜粋・簡略化)

def get_kindle_window():
    found_window = None

    def callback(hwnd, extra):
        # 1. ウィンドウタイトルを取得
        length = user32.GetWindowTextLengthW(hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value

        # 2. タイトルに "Kindle" が含まれているか判定
        if "Kindle" in title:
            # 3. クライアント領域（枠を除く中身）の座標を取得
            rect = _get_client_rect_screen(hwnd)
            found_window = WindowInfo(hwnd, title, rect)
            return False # 見つかったらループ終了
        return True

    user32.EnumWindows(callback_func, 0)
    return found_window
```

ポイントは `GetWindowRect` ではなく `GetClientRect` を使う点です。
OS標準の枠（タイトルバーなど）を含めてスクショしてしまうと、後でPDFにした時に見栄えが悪いからです。
`ClientToScreen` を使って、ウィンドウ内のローカル座標をスクリーン全体の絶対座標に変換しています。

---

## 3. ウィンドウを強制的に「最前面」へ

スクショを撮る瞬間、ウィンドウは隠れていてはいけません。
しかし、Windows 10/11には**フォアグラウンドロック**という機能があり、バックグラウンドのプログラムが勝手に最前面に来ることを防いでいます。

これを突破するために、**「入力スレッドのアタッチ (`AttachThreadInput`)」** というテクニックを使います。

```python
# src/window_utils.py

def activate_window(hwnd: int):
    # 現在アクティブなウィンドウのスレッドIDを取得
    current_tid = kernel32.GetCurrentThreadId()
    target_tid = user32.GetWindowThreadProcessId(hwnd, None)
    
    # 自分のスレッドと相手のスレッドを「接続」する
    # これにより、OSは「ユーザーが操作している一連の流れ」と認識する
    user32.AttachThreadInput(current_tid, target_tid, True)
    
    # ここなら SetForegroundWindow が通る！
    user32.SetForegroundWindow(hwnd)
    
    # 切断
    user32.AttachThreadInput(current_tid, target_tid, False)
```

この処理を入れることで、ボタン一つで確実にKindleが手前に来る「プロの挙動」を実現しています。

---

## 4. スクリーンショットとページめくり (Automation Loop)

座標が分かれば、あとはループ処理です。
画像処理ライブラリ `pyautogui` を使います。

```python
# src/automation.py (ロジック解説)

def run_loop(self):
    previous_image_bytes = None

    for i in range(self.pages):
        # 1. 指定座標をキャプチャ
        screenshot = pyautogui.screenshot(region=self.region)
        
        # 2. 【重要】自動停止の仕組み (重複検出)
        # 画像データをバイト列として比較し、前回と全く同じなら「最終ページ」と判断
        current_bytes = screenshot.tobytes()
        if previous_image_bytes and current_bytes == previous_image_bytes:
            print("ページが変化していません。終了します。")
            break
        previous_image_bytes = current_bytes

        # 3. 保存
        filename = f"page_{i:04d}.png"
        screenshot.save(os.path.join(self.output_dir, filename))

        # 4. ページめくり
        # Kindle for PC は右矢印キーで次ページへ行ける
        pyautogui.press('right')
        
        # 5. 描画待ち (環境によるが0.5秒程度あれば十分)
        time.sleep(self.delay)
```

### こだわりポイント：重複検出による自動停止
ページ数を事前に「200ページ」などと正確に入れなくてもいいように、**「画面が変わらなくなったら終了」** というロジックを入れています。
これは `screenshot.tobytes()` で画像の生データを比較するだけで実装でき、非常に実用的です。

---

## 5. 画像を束ねてPDF化

最後に、フォルダに溜まった大量のPNG画像を1つのPDFにします。
ここでは `input2pdf` というライブラリが優秀です。

```python
# src/pdf_maker.py

def create_pdf(image_list, output_path):
    # img2pdfは無劣化かつ高速にPDFコンテナに画像を格納してくれる
    with open(output_path, "wb") as f:
        f.write(img2pdf.convert(image_list))
```

`Pillow` (PIL) でもPDF化は可能ですが、再圧縮がかかって画質が落ちたり、処理が重かったりします。
`img2pdf` は画像のバイナリデータをそのままPDFの規格に埋め込むだけなので、**爆速かつオリジナル画質のまま** PDF化できます。漫画や技術書には必須の選択です。

---

## 6. まとめ

このように、KindleのPDF化ツールは、実は以下の基本的な技術の組み合わせでできています。

1.  **Win32API**: ウィンドウを見つけ、制御する。
2.  **PyAutoGUI**: 画面を見て、キーを叩く。
3.  **バイナリ比較**: 終了判定を行う。
4.  **img2pdf**: 高速にまとめる。

今回はこれに **FastAPI + WebSocket** を被せることで、「ブラウザから操作できるモダンなアプリ」に仕立て上げました。
Pythonはこうした「低レイヤーのOS操作」と「高レベルなWeb技術」をシームレスに繋げるのが本当に得意ですね。

ソースコードはGitHubで公開していますので、ぜひ自分好みに改造してみてください！

[GitHub: Kindle-To-PDF-Web-Automation](https://github.com/97kuek/Kindle-PDF-Converter)

https://github.com/97kuek/Kindle-PDF-Converter
