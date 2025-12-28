---
title: 'PythonでKindleを全ページ自動スクショしてPDF化する技術のすべて'
description: 'Kindleで買った技術書をPDFで検索したい…そんな悩みを解決する自作ツールの開発秘話。Python + Win32APIで実現'
pubDate: '2025-10-28'
categories: ['Python', 'FastAPI', 'Automation']
heroImage: '../../assets/kindle.png'
---

Kindleで買った技術書をGoodnotesを用いて書き込んだり、検索したい...
そう思ったことはありませんか？
今回は、**Pythonを使ってKindle for PCの全ページをキャプチャしてPDF化する全自動ツール** を自作しました。
以下のリポジトリからダウンロードできるので、ぜひ参考にしてみてください。

## 1. 自動化の全体戦略

Kindle本をPDF化するプロセスは、以下のステップに分解できます。

1.  **ターゲット特定**: 起動している「Kindle for PC」のウィンドウを見つける。
2.  **アクティブ化**: ウィンドウを最前面に持ってくる（これが意外と難しい）。
3.  **撮影ループ**:
    *   ページの内容をスクリーンショットとして保存。
    *   次のページへめくる（右矢印キー）。
    *   ページが変わったか確認する（重複検知）。
4.  **製本**: 集めた画像を1つのPDFファイルに結合する。

これを実現するために、以下のPythonライブラリを使用します。

### 必要なライブラリ

```bash
pip install pywin32 pyautogui img2pdf
```

-   **pywin32 (win32gui, win32con, win32api)**: Windowsの深層（Win32 API）を操作するために必要不可欠です。ウィンドウの座標取得やフォーカス制御に使います。
-   **pyautogui**: マウス操作やキーボード入力、スクリーンショット撮影を行う自動化ライブラリの定番です。
-   **img2pdf**: 画像をPDFに変換するライブラリ。画質の劣化（再圧縮）なしで高速に結合できるのが特徴です。

---

## 2. ターゲットウィンドウを特定する (Win32APIの活用)

スクリーンショットを撮るには、まず「Kindleが画面のどこにあるか（座標）」を正確に知る必要があります。これには `EnumWindows` というAPIを使います。

### `EnumWindows` でウィンドウを探す

Pythonの標準ライブラリ `ctypes` または `pywin32` を使って、現在起動しているすべてのウィンドウを走査（列挙）します。

```python
import ctypes
from ctypes import windll

user32 = windll.user32

def get_kindle_window():
    found_window = None

    def callback(hwnd, extra):
        # 1. ウィンドウのタイトルを取得
        length = user32.GetWindowTextLengthW(hwnd)
        buff = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buff, length + 1)
        title = buff.value

        # 2. タイトルに "Kindle" が含まれているかチェック
        if "Kindle" in title:
            # 3. クライアント領域（枠を除いた中身）の座標を取得
            rect = wintypes.RECT()
            user32.GetClientRect(hwnd, ctypes.byref(rect))
            
            # 座標変換: ウィンドウ内の相対座標 -> スクリーン全体の絶対座標
            pt = wintypes.POINT()
            pt.x = rect.left
            pt.y = rect.top
            user32.ClientToScreen(hwnd, ctypes.byref(pt))
            
            # 結果を保存
            left, top = pt.x, pt.y
            width = rect.right - rect.left
            height = rect.bottom - rect.top
            
            print(f"発見: {title} @ ({left}, {top}, {width}x{height})")
            return False # 見つかったら探索終了
        return True

    # コールバック関数を登録して実行
    callback_func = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)(callback)
    user32.EnumWindows(callback_func, 0)
```

**技術的なポイント:**
*   **`GetWindowRect` vs `GetClientRect`**: 単なる `GetWindowRect` だと、ウィンドウの「タイトルバー」や「枠」まで座標に含まれてしまいます。綺麗なPDFを作るために、中身だけを取得できる `GetClientRect` を使い、その後に `ClientToScreen` でスクリーン座標に変換するという一手間を加えています。

---

## 3. ウィンドウを強制的に「最前面」へ (Focus Stealing)

ここが自動化の最大の難所です。スクショを撮るにはKindleを最前面にする必要がありますが、Windows 10/11には**フォアグラウンドロック**という機能があり、プログラムが勝手に最前面に来ることを防いでいます（作業中に突然別のウィンドウが出てくると邪魔だからです）。

これを正攻法で突破するには、**「入力スレッドのアタッチ (`AttachThreadInput`)」** というハックを使います。

```python
import win32process
import win32gui
import win32api
import win32con

def activate_window(hwnd):
    # 現在アクティブなウィンドウのスレッドIDを取得
    current_tid = win32api.GetCurrentThreadId()
    # KindleウィンドウのスレッドIDを取得
    _, pid = win32process.GetWindowThreadProcessId(hwnd)
    target_tid = win32process.GetWindowThreadProcessId(hwnd)[0] # 修正: 上記行はプロセスID取得、ここではスレッドIDが必要

    # 自分のスレッドとKindleのスレッドを「接続」する
    win32process.AttachThreadInput(current_tid, target_tid, True)
    
    # 接続することで、OSは「ユーザーが操作している一連の流れ」と認識し、
    # 権限が共有されるため、前面に出せるようになる
    win32gui.SetForegroundWindow(hwnd)
    win32gui.SetFocus(hwnd)
    
    # 処理が終わったら切断（後始末）
    win32process.AttachThreadInput(current_tid, target_tid, False)
```

この処理を入れることで、Pythonスクリプトから確実にKindleをたたき起こして最前面に持ってくることができます。

---

## 4. 撮影とページめくりのループ (Automation)

準備が整ったら、あとはひたすら「撮る→めくる」を繰り返します。

```python
import pyautogui
import time
import os

def capture_loop(region, output_dir, max_pages=500):
    previous_image_bytes = None
    
    for i in range(max_pages):
        # 1. 指定座標をキャプチャ (pyautoguiは内部でPillowを使用)
        screenshot = pyautogui.screenshot(region=region)
        
        # 2. 【重要】自動停止ロジック (重複検出)
        # 画像データをバイト列に変換して比較。前回と全く同じなら「最終ページ」と判断。
        current_bytes = screenshot.tobytes()
        if previous_image_bytes and current_bytes == previous_image_bytes:
            print("ページの変化がありません。終了します。")
            break
        previous_image_bytes = current_bytes

        # 3. 保存 (連番ファイル名)
        filename = f"page_{i:03d}.png"
        save_path = os.path.join(output_dir, filename)
        screenshot.save(save_path)

        # 4. ページめくり (右矢印キー)
        pyautogui.press('right')
        
        # 5. 待機 (ページ遷移アニメーションや読み込み待ち)
        time.sleep(0.5) 
```

### 工夫した点: ページ数の自動判定
最初、「全ページ数を入力させる」仕様にしていましたが、面倒なので**「画面が変わらなくなったら終了」**というロジックに変更しました。`screenshot.tobytes()` で画像の生データを比較するだけなので、計算コストも低く、非常に確実に動作します。

---

## 5. 画像を劣化なしでPDF化 (img2pdf)

最後に、保存した大量のPNG画像を1つのPDFファイルにまとめます。
ここでは `Pillow` ではなく、**`img2pdf`** を使うのが正解です。

```python
import img2pdf

def make_pdf(image_folder, output_pdf_name):
    # 画像リストを作成 (ファイル名順にソート)
    images = sorted([
        os.path.join(image_folder, f) 
        for f in os.listdir(image_folder) 
        if f.endswith(".png")
    ])

    print("PDFを作成中...")
    with open(output_pdf_name, "wb") as f:
        # 画像データを再エンコードせず、そのままPDFコンテナに格納
        f.write(img2pdf.convert(images))
    print("完了！")
```

`Pillow` などを使ってPDF化すると、画像がいったんデコードされ、再度JPEG圧縮などがかかって画質が落ちたり、ファイルサイズが巨大化したりすることがあります。
`img2pdf` は画像のバイナリデータをそのままPDFの規格に合わせて埋め込むだけなので、**オリジナル画質を完全に維持したまま、爆速で**PDF化できます。

---

## 6. まとめと今後の展望

このように、デスクトップアプリの自動操作は、Webスクレイピングとはまた違った「OSレベルの制御」が必要になり、泥臭い工夫が求められます。しかし、一度作ってしまえば「どんな電子書籍リーダーでも（ブラウザ版でもアプリ版でも）」応用が効く強力な武器になります。

今後の展望としては、以下のような改良を考えています。

1.  **GUI化**: コマンドラインではなく、ボタン一つで操作できるようにする（完了：FastAPI + ReactでWeb UIを作りました）。
2.  **範囲選択の自動化**: 現在は座標を自動取得していますが、手動で微調整できるモードも追加したい。
3.  **OCR連携**: PDF化した後にOCRをかけて、テキスト検索可能にする。

ソースコード全体はGitHubで公開しています。もし興味があれば、Starをつけてもらえると嬉しいです！

[GitHub: Kindle-To-PDF-Web-Automation](https://github.com/97kuek/Kindle-PDF-Converter)
