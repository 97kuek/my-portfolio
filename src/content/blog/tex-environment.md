---
title: 'VSCodeとTeXで最強のレポート作成環境を作る（2025年版）'
description: 'インストールするだけじゃ動かない！？VSCodeのsettings.json設定まで完全網羅。Ctrl+Sで自動ビルドされる快適なTeX環境を構築します。'
pubDate: '2025-08-26'
heroImage: '../../assets/TeX.png'
tags: ['TeX', 'VSCode', '環境構築', 'レポート']
---

## はじめに

理系大学生の皆さん、レポート作成でWordのレイアウト崩れにイライラしていませんか？
「数式がきれいに書けない」「図表の番号管理が面倒」「参考文献のリストを作るのが大変」...

そんな悩みは **VSCode + TeX** で全て解決できます！

ネット上には多くの情報がありますが、「インストールしたのに動かない」「日本語が出ない」「ビルドがいちいち手動で面倒」という声もよく聞きます。
実は、VSCodeの拡張機能を入れただけでは、**日本語環境では快適に動きません**。

この記事では、**初心者でも絶対に迷わない**、全自動ビルド（Ctrl+Sを押すだけ）まで含めた完璧な環境構築手順を解説します。

## 1. なぜ VSCode + TeX なのか？

*   **自動ビルド**: ファイルを保存するだけで、横に開いたPDFが勝手に更新されます。リアルタイムプレビューに近い感覚です。
*   **強力な補完**: コマンドを全部覚えていなくても、VSCodeが予測変換してくれます。
*   **Git管理**: テキストファイルなので、変更履歴をGitで管理できます。

## 2. インストール手順

### Step 1: TeX Live のインストール
まずはTeXの本体である **TeX Live** を入れます。これが一番時間がかかります。

1.  [TeX Live公式サイト](https://www.tug.org/texlive/) から `install-tl-windows.exe` をダウンロード。
2.  実行して「標準インストール」を選びます。
    *   **注意**: 完了まで数時間かかることもあります。寝る前などに仕掛けるのがおすすめです。

### Step 2: VSCode と拡張機能のインストール
1.  **VSCode** をインストール（まだの人）。
2.  VSCodeを開き、拡張機能タブ（左側の■が4つのアイコン）から「**LaTeX Workshop**」を検索してインストールします。

---

## 3. VSCodeの設定 (settings.json)
LaTeX Workshopを入れただけだと、設定が不十分だったり、英語用の設定になっていて日本語のコンパイルが失敗することがあります。
また、「保存時に自動ビルド」を確実にするためにも、以下の設定を必ず行ってください。

### 設定ファイルの開き方
1.  キーボードの `F1` キー（または `Ctrl + Shift + P`）を押す。
2.  出てきた入力欄に `user json` と入力。
3.  「**Preferences: Open User Settings (JSON)**」を選択します。

### コピペ用設定コード
これを開いた `settings.json` の `{ }` の中にコピペしてください。
（すでに何か書いてある場合は、末尾にカンマ `,` をつけてから続けて貼ってください）

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

### 何をしているのか解説
*   **tools**: `latexmk` という強力なビルドツールを使えるようにしています。これ一つで「tex → pdf」の変換を全自動でやってくれます。特に `uplatex` と `dvipdfmx` を使う設定にしているので、日本語もバッチリです。
*   **recipes**: 定義したツールを実行する「レシピ」を作っています。
*   **autoBuild.run**: ここを `"onFileChange"` にすることで、**Ctrl + S で保存した瞬間に勝手にビルドが走る**ようになります。これが超快適！

---

## 4. 動作確認

設定お疲れ様でした！実際に動くかテストしてみましょう。

1.  パソコン上の好きな場所に「report_test」などのフォルダを作ります。
2.  VSCodeでそのフォルダを開きます（`ファイル` -> `フォルダーを開く`）。
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

これで、TeXの実行環境が整いました。快適なTeXライフを！