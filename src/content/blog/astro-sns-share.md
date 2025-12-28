---
title: '静的サイトにSNSシェアボタンを導入する方法'
description: '静的サイトにSNSシェアボタンを導入する方法を解説します。'
pubDate: '2025-12-27'
heroImage: '../../assets/astro.png'
categories: ['Astro', 'JavaScript']
---

## はじめに
Webサイトやブログを作っていると、記事を拡散してもらうための「シェアボタン」が欲しくなりますよね。
WordPressなどのプラグインを使えば一発ですが、**「動作が重くなる」「デザインが浮く」「余計な機能までついてくる」**といった悩みもつきものです。

実は、シェアボタンの実装は驚くほど簡単です。
今回は、**プラグインを使わず、軽量で自由なデザインのシェアボタンを自作する方法**を解説します。HTMLと少しのJavaScriptだけで実装できます！

## 1. シェアボタンの「仕組み」を理解しよう

コードを書く前に、仕組みをサクッと理解しておきましょう。ここを知っておくと応用が利きます。

シェアボタンの正体は、**ただのリンク（aタグ）**です。
特定のURLに対して、**「どの記事をシェアするか」という情報（パラメータ）**をくっつけてリンクさせているだけなのです。

### URLパラメータのイメージ

例えば、X（旧Twitter）でシェアする場合、以下のようなURLを作ります。

```text
https://twitter.com/share?url={記事のURL}&text={記事のタイトル}

```

* **宛先:** `https://twitter.com/share`（Xの投稿画面を開いてね）
* **? (クエスチョンマーク):** ここから細かい情報を送るよ、という合図
* **url=:** このURLをシェアしたい！
* **text=:** ツイート本文にはこのタイトルを入れて！

この「URL」と「タイトル」の部分を、記事ごとに自動で書き換えるのが今回の実装のゴールです。

## 2. 実装手順

では、実際に作ってみましょう。今回は管理しやすいように、**HTMLでボタンの枠を作り、JavaScriptでURLを自動セットする**というモダンな方法で行います。

この方法なら、どのページに貼り付けても自動でそのページのURLを取得してくれるので、**テンプレートとして使い回せます。**

### 2.1 HTMLを用意する

まずはボタンの置き場所を作ります。
（※アイコンを表示させたい場合は、FontAwesomeなどを使ってください。ここではわかりやすく文字にしています）

```html
<div class="share-area">
  <p>この記事をシェアする</p>
  <div class="share-buttons">
    <a id="share-x" class="btn-share btn-x" target="_blank" rel="nofollow noopener">
      Xでポスト
    </a>
    
    <a id="share-fb" class="btn-share btn-fb" target="_blank" rel="nofollow noopener">
      Facebook
    </a>
    
    <a id="share-line" class="btn-share btn-line" target="_blank" rel="nofollow noopener">
      LINE
    </a>
  </div>
</div>

```

### 2.2 JavaScriptでURLを自動生成

ここが肝です。`href=""` の中身を、ページが読み込まれた瞬間に自動で作ります。
以下のコードをHTMLの最後（`</body>`の直前など）に追加してください。

```javascript
<script>
  // ページ読み込み完了時に実行
  window.addEventListener('DOMContentLoaded', function() {
    
    // 1. 現在のページのURLとタイトルを取得
    // 日本語が含まれる場合におかしくならないよう「エンコード」します
    const currentUrl = encodeURIComponent(window.location.href);
    const currentTitle = encodeURIComponent(document.title);

    // 2. 各SNS用のリンク先を作成
    const xUrl = `https://twitter.com/share?url=${currentUrl}&text=${currentTitle}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${currentUrl}`;

    // 3. HTMLのaタグにリンクをセット
    document.getElementById('share-x').href = xUrl;
    document.getElementById('share-fb').href = fbUrl;
    document.getElementById('share-line').href = lineUrl;
  });
</script>

```

#### `encodeURIComponent` とは？

URLには日本語やスペースを直接入れられません。これらを「%E3%81...」のような機械が読める文字に変換する処理を**URLエンコード**と言います。これを忘れるとリンクが動かないことがあるので必須です！

### 2.3 CSSでデザインを整える

最後に見た目を整えます。各SNSのブランドカラーに合わせるとわかりやすいです。

```css
<style>
  .share-area {
    margin: 40px 0;
    text-align: center;
  }
  .share-buttons {
    display: flex;
    justify-content: center;
    gap: 10px; /* ボタン同士の間隔 */
  }
  .btn-share {
    display: inline-block;
    padding: 10px 20px;
    text-decoration: none;
    color: white;
    border-radius: 5px;
    font-weight: bold;
    transition: opacity 0.3s;
  }
  .btn-share:hover {
    opacity: 0.8;
  }
  
  /* 各SNSの色設定 */
  .btn-x { background-color: #000000; } /* Xは黒 */
  .btn-fb { background-color: #1877F2; } /* Facebookの青 */
  .btn-line { background-color: #06C755; } /* LINEの緑 */
</style>

```

## 3. Gitで管理している人へ

静的サイトジェネレーターや、Gitを使って開発している場合、この「シェアボタン部分」を**1つのコンポーネント（部品）**として別ファイルにしておくと便利です。

* **HTML:** 全ページ共通のパーツにする
* **JS:** `common.js` などの共通ファイルに記述する

こうしておけば、後で「はてなブックマークも追加したいな」と思ったときに、1箇所の修正で全ページのボタンを更新できます。

## まとめ

* シェアボタンの正体は、パラメータ付きのURLリンク。
* JavaScriptを使えば、現在のページURLを自動取得できる。
* 自作すれば軽量で、デザインも自由自在！

意外と簡単ですよね？
ぜひ自分のサイトに合わせてカスタマイズしてみてください！