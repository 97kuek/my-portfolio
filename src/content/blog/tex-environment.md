---
title: 'VSCodeとTeXでレポート作成環境を作る'
description: 'TeX（LaTeX）の導入からVSCodeでの執筆環境構築まで、レポート作成を効率化する方法を解説します。'
pubDate: '2025-12-26'
heroImage: '../../assets/TeX.png'
tags: ['TeX', 'VSCode', '環境構築', 'レポート']
---

## はじめに

理系大学生のみなさん、レポート作成は順調ですか？
Wordで数式を書いているとき、「レイアウトが勝手に崩れる」「数式の入力が面倒」とイライラした経験はありませんか？

そんな悩みから解放されるツールが **TeX** です。
今回は、現代的なTeX環境のスタンダードである「**VSCode + TeX Live**」によるレポート作成環境の構築方法を紹介します。

## 1. TeXを使うメリット

なぜWordではなくTeXを使うのでしょうか？

*   **数式が圧倒的に美しい**: 複雑な数式も、コマンドで論理的に記述でき、出版レベルの美しさで出力されます。
*   **レイアウト調整が自動**: 図表の配置や章立ての番号振りなどを自動で行ってくれるため、「見た目」ではなく「中身」に集中できます。
*   **Gitで管理できる**: テキストファイルなので、プログラムのソースコードと同じようにバージョン管理が可能です。

学部レベルの実験レポートの作成では、Wordで十分なことが多いですが、研究室に配属したり、卒業論文を書くなどする場合には、TeX環境を整えることが推奨されます。また、TeXの記法はMarkdownにも似ているため、学習コストは比較的低いです。

## 2. TeX Liveのインストール

まずはTeXのディストリビューション（必要なソフト一式）である **TeX Live** をインストールします。

1.  [TeX Liveの公式サイト](https://www.tug.org/texlive/) にアクセスし、インストーラー（`install-tl-windows.exe` など）をダウンロードします。
2.  インストーラーを実行し、指示に従ってインストールを進めます。
    *   **注意**: 非常にサイズが大きいため（数GB）、インストールには時間がかかります。通信環境の良い場所で行いましょう。
    *   基本的には「標準インストール」で問題ありません。とても時間がかかるので、電源がある環境でインストールすることをおすすめします。

## 3. VSCodeのセットアップ

TeX Liveが入ったら、次はエディタの設定です。色々なエディタがありますが、今回は高機能で動作も軽い **VS Code (Visual Studio Code)** を使いましょう。

### 拡張機能「LaTeX Workshop」の導入

VSCodeにはTeX用の神拡張機能 **LaTeX Workshop** があります。これをそのまま入れれば、ビルドからPDFプレビューまでVSCodeの中だけで完結します。

1.  VSCodeを開き、左側の拡張機能アイコンをクリックします。
2.  検索バーに「**LaTeX Workshop**」と入力します。
3.  一番上に出てくる拡張機能をインストールします。

これだけで、基本的な設定は完了です！昔のように難しいコマンド設定を自分で書く必要はほとんどありません。LaTeX Workshopが自動でTeX Liveを認識してくれます。

## 4. 執筆とビルドのテスト

環境が整ったら、実際にレポートを書いてみましょう。
適当なフォルダを作り、`report.tex` というファイルを作成して、以下のコードをコピペしてみてください。

```latex
\documentclass[uplatex, dvipdfmx]{jsarticle}

\title{初めてのTeXレポート}
\author{早稲田 太郎}
\date{\today}

\begin{document}

\maketitle

\section{はじめに}
これはVSCodeとTeXで作成した初めてのレポートです。
数式も以下のように美しく書けます。

\begin{equation}
  e^{i\pi} + 1 = 0
\end{equation}

実際にレンダリングすると以下のようになります。

$$
e^{i\pi} + 1 = 0
$$

\section{まとめ}
TeX環境の構築は意外と簡単でした。
これからはレポート作成が捗りそうです。

\end{document}
```

### PDFを作成（ビルド）する

1.  ファイルを保存します（`Ctrl + S`）。
2.  LaTeX Workshopのデフォルト設定では、**保存するだけで自動的にビルドが走ります**。
3.  画面左下のステータスバーにチェックマーク✔ がつけば成功です。
4.  VSCode右上の「View LaTeX PDF」ボタン（虫眼鏡のようなアイコン）をクリックすると、作成されたPDFが右側に表示されます。

「保存するだけ」でプレビューが更新されるこの体験は、一度味わうと戻れません！

## 5. レポート執筆の基本文法
環境が整えば、あとは書くだけです。覚えるのが大変かもしれませんが、まずは基本的な5つのコマンドを見ていきましょう！

### 見出し(セクション)
Wordでフォントサイズをいちいち変更していた作業は不要です。論理構造を指定するだけで、TeXが勝手に文字の大きさや太さを調整してくれます。

```latex
\section{実験目的}
\subsection{背景}
\subsubsection{原理}
```

### 箇条書き
実験器具のリストアップなどに便利です。
- `itemize` : 中黒のリスト
- `enumerate` : 番号付きのリスト

```latex
\begin{itemize}
  \item ディジタルマルチメータ
  \item ファンクションジェネレータ
\end{itemize}
```

### 数式
ここがTeXを使う最大の理由です。文中に埋め込む場合は`$`で囲みます。別行で強調したい場合は`equation`環境を使います。

```latex
運動方程式は $ma=F$ で表される。

\begin{equation}
e^{i\pi} + 1 = 0
\end{equation}
```

### 画像の挿入
実験のデータやグラフ・写真を貼るときに使います。

```latex
\begin{figure}[h]
    \centering
    \includegraphics[width=0.5\textwidth]{image.png}
    \caption{画像の説明}
    \label{fig:image}
\end{figure}
```

### 表の作成
表は少し複雑ですが、基本は`tabular`環境を使います。

```latex
\begin{table}[h]
    \centering
    \begin{tabular}{|c|c|c|}
        \hline
        \textbf{列1} & \textbf{列2} & \textbf{列3} \\
        \hline
        内容1 & 内容2 & 内容3 \\
        \hline
    \end{tabular}
    \caption{表の説明}
    \label{tab:table}
\end{table}
```

## 6. 実験レポートテンプレート
文法を覚えるより、まずはテンプレートを改造する方が早いです。これを`report.tex`というファイルに保存し、画像を同じフォルダに入れれば、立派なレポートの完成です！

```latex title="report.tex"
\documentclass[uplatex, dvipdfmx]{jsarticle}

% --- 必要なパッケージ（機能）の読み込み ---
\usepackage[dvipdfmx]{graphicx} % 画像を貼るため
\usepackage{url}                % URLを表示するため
\usepackage{amsmath, amssymb}   % 高度な数式用

% --- 表紙情報 ---
\title{物理学実験I レポート \\ テーマ：単振り子の等時性}
\author{理工学部 1年 \\ 学籍番号: 1W234567 \\ 氏名: 早稲田 太郎}
\date{実験日：2025年5月10日 \\ 提出日：\today}

\begin{document}

% 表紙を出力
\maketitle

\section{実験目的}
本実験では、単振り子の周期を測定し、振れ幅が小さい場合に周期が振れ幅に依存しないこと（等時性）を確認する。また、重力加速度 $g$ の値を算出する。

\section{実験原理}
単振り子の運動方程式は、糸の長さを $l$、重力加速度を $g$、鉛直方向とのなす角を $\theta$ とすると、以下のように記述される。

\begin{equation}
  \frac{d^2\theta}{dt^2} + \frac{g}{l}\sin\theta = 0
  \label{eq:motion}
\end{equation}

ここで、振れ幅が十分に小さい（$\theta \ll 1$）と仮定すると、$\sin\theta \approx \theta$ と近似できるため、周期 $T$ は次式となる。

\begin{equation}
  T = 2\pi \sqrt{\frac{l}{g}}
\end{equation}

\section{実験方法}
\begin{enumerate}
  \item 長さ $l$ の糸に質量 $m$ のおもりを取り付ける。
  \item ストップウォッチを用いて、10往復する時間を5回測定し、平均値を求める。
  \item 糸の長さを変えて同様の測定を行う。
\end{enumerate}

\section{実験結果}
糸の長さ $l = 1.0 \, \mathrm{m}$ における測定結果を Table \ref{tab:result} に示す。

\begin{table}[htbp]
  \centering
  \caption{周期の測定結果 ($l=1.0\,\mathrm{m}$)}
  \label{tab:result}
  \begin{tabular}{|c|c|} \hline
    回数 & 10往復の時間 [s] \\ \hline \hline
    1 & 20.1 \\ \hline
    2 & 20.0 \\ \hline
    3 & 20.2 \\ \hline
    平均 & 20.1 \\ \hline
  \end{tabular}
\end{table}

\section{考察}
式(\ref{eq:motion})の近似が成立する範囲について検討する。
（ここに考察を書く。グラフ画像などを挿入しても良い）

\section{結論}
本実験により、単振り子の等時性が確認された。算出された重力加速度は $g = 9.78 \, \mathrm{m/s^2}$ であり、理論値とよく一致した。

\begin{thebibliography}{9}
  \item 物理学実験指導書編集委員会 編, 『基礎物理学実験』, 学術図書出版社, 2024.
\end{thebibliography}

\end{document}
```

## 7. まとめ

今回は**VSCode + TeX Live**によるレポート作成環境の構築と基本的な文法を紹介しました。

最初はコマンドを覚えるのが少し大変かもしれませんが、慣れてしまえばWordの何倍もの速さで美しいレポートが書けるようになります。
ぜひこの環境を整えて、快適なレポート生活を送ってください！
