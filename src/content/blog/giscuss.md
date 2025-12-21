---
title: Giscussで静的サイトにコメント機能をつける
description: 'コメント機能の実装方法'
pubDate: '2025-08-11'
heroImage: '../../assets/giscuss.png'
tags: ['Astro', 'Web開発', '技術解説', 'Giscuss']
---

## はじめに

個人開発のブログにコメント機能を載せたいけれど，データベースを管理するのは面倒……。そんな時に最適なのが、GitHub Discussionsをバックエンドとして利用する**Giscuss**です．

この記事では，Astroで構築したブログにGiscussを組み込む全手順を解説します．

## 目次
1. [GitHubリポジトリの設定](#1-githubリポジトリの設定)
2. [Giscussの設定値を取得する](#2-giscussの設定値を取得する)
3. [Astroコンポーネントの作成](#3-astroコンポーネントの作成)
4. [レイアウトへの組み込み](#4-レイアウトへの組み込み)
5. [まとめ](#5-まとめ)

## 1. GitHubリポジトリの設定

Giscussを動かすには，ブログのリポジトリで以下の設定が必要です．

1. **リポジトリをPublicにする**: プライベートリポジトリでは動作しません．
2. **Discussionsを有効化する**: リポジトリの `Settings > General > Features` から「Discussions」にチェックを入れます．
3. **giscuss-appをインストール**: [giscussダウンロードサイト](https://github.com/apps/giscus) にアクセスし，対象のリポジトリに対してアクセス権限を許可します．


## 2. Giscussの設定値を取得する

[giscuss](https://giscus.app/ja) にアクセスし，自分のリポジトリ情報を入力して専用の`<script>`タグを生成します．

* **リポジトリ**: `ユーザー名/リポジトリ名`
* **ページとDiscussions連携設定**: Discussionのタイトルにページの pathnameを利用する設定がおすすめ．
* **カテゴリー**: ブログ用途なら**Announcements**がおすすめです．
* **機能**: **リアクション**を有効にしておくと，コメントの下に絵文字で簡単にリアクションができます．
* **テーマ**: コメント欄のスタイルを変更できます．自分のブログにあったスタイルを見つけましょう．

一通り設定が終わると，サイトの下部にコードが生成されます．その内容をコピーしましょう．

## 3. Astroコンポーネントの作成

次にAstroで使い回せるように，`src/components/Giscus.astro` を作成します．先ほどのコピーしたコードをそのまま貼り付けましょう．

```astro title="src/components/Giscus.astro"
<section class="giscuss-container">
    <script src="https://giscus.app/client.js"
        data-repo="[リポジトリを記述]"
        data-repo-id="[リポジトリIDを記述]"
        data-category="[カテゴリ名を記述]"
        data-category-id="[カテゴリIDを記述]"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="ja"
        crossorigin="anonymous"
        async>
    </script>
</section>

<style>
  .giscuss-container {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(var(--gray), 0.2);
  }
</style>

```

## 4. レイアウトへの組み込み

作成したコンポーネントを，ブログ記事用のレイアウト（例：`src/layouts/BlogPost.astro`）で読み込みます．

```astro title="src/layouts/BlogPost.astro"
---
import Giscuss from '../components/Giscuss.astro';
// ...他のインポート
---

<article>
  <slot />

  <Giscuss />
</article>
```

## 5. まとめ

Giscussを導入することで，以下のようなメリットがあります．

* **ログイン不要**: GitHubアカウントを持っていればすぐにコメントできる．
* **リアクション機能**: 絵文字で気軽に反応がもらえる．
* **完全無料**: サーバー維持費やDB管理のコストがゼロ．

開発者ブログとの相性は抜群なので、ぜひ試してみてください！