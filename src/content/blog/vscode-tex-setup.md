---
title: 'VSCodeとTeXで最強のレポート作成環境を作る'
description: 'インストールするだけじゃ動かない！？VSCodeのsettings.json設定まで完全網羅。Ctrl+Sで自動ビルドされる快適なTeX環境を構築します。'
pubDate: '2025-06-26'
heroImage: '../../assets/TeX.png'
categories: ['VS Code', 'LaTeX']
---

## はじめに

理系大学生の皆さん、レポート作成でWordにイライラしていませんか？
私が実験レポートを書いていてイライラしたのは、

- 数式を書くのに非常に時間がかかる
- 図表や数式の番号管理が面倒
- 参考文献のリストを作るのが大変

そんな悩みを **TeX** で解決しましょう！TeXの環境として、Overleafのようなクラウドサービスは共同作業をするときは便利ですが、個人でレポート作成するときはVSCodeとTeXを組み合わせた方が便利です。そこで、今回はVSCodeとTeXを組み合わせた環境を構築する手順を解説します。

## 1. なぜ VSCode + TeX なのか？

*   **自動ビルド**: ファイルを保存するだけで、横に開いたPDFが勝手に更新されます。リアルタイムプレビューに近い感覚です。
*   **強力な補完**: コマンドを全部覚えていなくても、VSCodeが予測変換してくれます。
*   **Git管理**: テキストファイルなので、変更履歴をGitで管理できます。

## 2. インストール手順

### 2.1 TeX Live のインストール
まずはTeXの本体である **TeX Live** を入れます。これが一番時間がかかります。

1.  [TeX Live公式サイト](https://www.tug.org/texlive/) から `install-tl-windows.exe` をダウンロード。
2.  実行して「標準インストール」を選びます。
    *   **注意**: 完了まで数時間かかることもあります。

### 2.2 VSCode と拡張機能のインストール
1.  まだの人は**VSCode** をインストールしてください。

https://azure.microsoft.com/ja-jp/products/visual-studio-code

2.  VSCodeを開き、拡張機能タブから**LaTeX Workshop**を検索してインストールしてください。

---

## 3. VSCodeの設定 (settings.json)
LaTeX Workshopを入れただけだと、設定が不十分だったり、英語用の設定になっていて日本語のコンパイルが失敗することがあります。また、「保存時に自動ビルド」を確実にするためにも、以下の設定を必ず行ってください。

### 3.1 設定ファイルの開き方
1.  キーボードの `F1` キー（または `Ctrl + Shift + P`）を押す。
2.  出てきた入力欄に `user json` と入力。
3.  「**Preferences: Open User Settings (JSON)**」を選択します。

### 3.2 コピペ用設定コード
これを開いた `settings.json` の `{ }` の中にコピペしてください。（すでに何か書いてある場合は、末尾にカンマ `,` をつけてから続けて貼ってください）

```json
  // --------------- TeXの設定ここから ---------------

  // コンパイルの道具（ツール）を定義
  "latex-workshop.latex.tools": [
    {
      "name": "latexmk",
      "command": "latexmk",
      "args": [
        "-e",
        "$latex=q/uplatex %O -kanji=utf8 -no-guess-input-enc -synctex=1 -interaction=nonstopmode -file-line-error %S/",
        "-e",
        "$bibtex=q/pbibtex %O %B/",
        "-e",
        "$biber=q/biber %O --bblencoding=utf8 -u -U --output_safechars %B/",
        "-e",
        "$makeindex=q/upmendex %O -o %D %S/",
        "-e",
        "$dvipdf=q/dvipdfmx %O -o %D %S/",
        "-norc",
        "-gg",
        "-pdfdvi",
        "%DOC%"
      ]
    }
  ],

  // ツールを組み合わせたレシピ（手順）を定
  "latex-workshop.latex.recipes": [
    {
      "name": "latexmk (日本語)",
      "tools": [
        "latexmk"
      ]
    }
  ],

  // デフォルトで使うレシピを指定
  "latex-workshop.latex.recipe.default": "latexmk (日本語)",

  // 保存時に自動でビルドするか ("onFileChange"推奨)
  "latex-workshop.latex.autoBuild.run": "onFileChange",

  // ビルドなどの一時ファイルを出力先フォルダにまとめるか
  // すっきりさせたい場合は true にしますが、最初は false でもOK
  "latex-workshop.latex.outDir": "%DIR%",

  // 生成されたPDFをどのビューワーで見るか（"tab"ならVSCode内のタブ）
  "latex-workshop.view.pdf.viewer": "tab",

  // --------------- TeXの設定ここまで ---------------
```

settings.jsonとはVSCodeの設定ファイルになります。これでCtrl+Sで保存した瞬間に勝手にビルドが走るようになります！

---

## 4. 動作確認

ここまでくれば設定は完了です。実際に動くかテストしてみましょう。

1.  パソコン上の好きな場所に「report_test」などのフォルダを作ります。
2.  VSCodeでそのフォルダを開きます。
3.  `test.tex` というファイルを作成し、以下のコードを貼り付けます。

```latex
\documentclass[uplatex, dvipdfmx]{jsarticle}

\title{TeX環境構築のテスト}
\author{あなたの名前}
\date{\today}

\begin{document}
\maketitle

\section{はじめに}
これはVSCodeで作成したPDFです。
保存するだけで自動的にビルドされているはずです！

\section{数式のテスト}
美しい数式が書けます。
\begin{equation}
    \int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
\end{equation}

\end{document}
```

4.  **保存（Ctrl + S）します。**
5.  左下のステータスバーを見てください。「Build」という文字がくるくる回って、最後にチェックマーク✔ がつけば成功です！
6.  右上の虫眼鏡アイコン（View LaTeX PDF）を押すと、右側にPDFが表示されます。

もしエラーが出る場合は、settings.jsonのコピペミスがないか（カンマ忘れなど）、TeX Liveが正しくインストールされているかを確認してください。

## 5. まとめ

これで、TeXの実行環境が整いました。TeXを使いこなすには最初は沢山文法を覚えなくてはならないかもしれませんが、徐々に慣れていくと思います。TeXを学ぶにあたっておすすめの参考書やWebサイトを下に掲載しておきます！

https://www.amazon.co.jp/%EF%BC%BB%E6%94%B9%E8%A8%82%E7%AC%AC9%E7%89%88%EF%BC%BDLaTeX%E7%BE%8E%E6%96%87%E6%9B%B8%E4%BD%9C%E6%88%90%E5%85%A5%E9%96%80-%E5%A5%A5%E6%9D%91-%E6%99%B4%E5%BD%A6/dp/4297138891/ref=sr_1_1?adgrpid=85472593817&dib=eyJ2IjoiMSJ9.rDOGqFYsl1e5LDwoQjEEDLwRwko2dK_IIpoNYa1RGWaoYNWwa99XbNLwaNfdeXXrsiSPSGiC4oxHtW0mHpZBNZdib53I7eaOXbhk6L9BykZseER26Tpi7ahTi2Q8imVMq8CUV7b4e9QsPel51bbj3Db2Eo1oMBhU5_d8cd3wbrc1TsJjUdeuSyIMHXCXyPEZLE8aPbfx7TCh7lQd18W_2u6l0bqGm9EaI7TnHIoykAf23LvZZM5-d96_mwObPoAZiWBG3oDkUwwTVsj5lBlHh_pnZtM_4QR2X1YKjnwvvZA.AsX7CZxGJV-fVtXWsH28PXs_gJqqtLPYaLf1nb9p64c&dib_tag=se&hvadid=665617099801&hvdev=c&hvexpln=0&hvlocphy=9198914&hvnetw=g&hvocijid=18003673759757946401--&hvqmt=e&hvrand=18003673759757946401&hvtargid=kwd-854622297295&hydadcr=27487_14701027&jp-ad-ap=0&keywords=latex+%E7%BE%8E%E6%96%87%E6%9B%B8%E4%BD%9C%E6%88%90%E5%85%A5%E9%96%80&mcid=218d499d4aec3c27ac8ed3bec76cfbdf&qid=1766917067&sr=8-1

https://ja.wikibooks.org/wiki/TeX/LaTeX%E5%85%A5%E9%96%80