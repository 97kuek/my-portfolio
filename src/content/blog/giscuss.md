---
title: Giscussで静的サイトにコメント機能を実装しよう
description: 'データベース不要！GitHub Discussionsを利用して、Astroなどの静的サイトに安全・無料でコメント欄を追加する方法を解説します。'
pubDate: '2025-12-26'
heroImage: '../../assets/giscuss.png'
tags: ['Astro', 'Web開発', 'Giscuss', 'React']
---

## はじめに

個人ブログを運営していると、読者からのフィードバックが欲しくなることがあります。
しかし、WordPressのようにデータベースを持たない「静的サイト」では、コメント機能の実装は少しハードルが高いです。

そこで便利なのが **Giscuss** です。
これは **GitHub Discussions** の仕組みを利用して、コメント欄を「埋め込む」ことができるツールです。
データベースの管理が一切不要で、しかも **完全無料** です。

この記事では、AstroブログにGiscussを導入する手順を、設定から実装まで丁寧に解説します。

## 1. 事前準備

Giscussを利用するには、以下の3つの条件を満たす必要があります。

1.  **リポジトリがPublic（公開）であること**
    *   プライベートリポジトリではGiscussは動きません。
2.  **Giscussアプリがインストールされていること**
    *   [Giscussアプリのページ](https://github.com/apps/giscus) に行き、自分のリポジトリに対してアクセス権を許可してください。
3.  **Discussions機能が有効になっていること**
    *   リポジトリの `Settings` > `General` > `Features` にある **Discussions** にチェックを入れます。

## 2. 設定値の取得

[Giscussの公式サイト](https://giscus.app/ja) にアクセスし、画面に従って設定を入力していきます。
正しく入力すると、サイト下部に `<script>` タグが自動生成されます。

### おすすめの設定
入力項目が多いですが、ブログ用なら以下がおすすめです。

*   **リポジトリ**: `自分のGitHubユーザー名/リポジトリ名` を入力。
*   **ページとDiscussionsの紐付け**: 「ページ URL を含む」または「ページの pathname」が管理しやすいです。
*   **カテゴリー**: ブログのコメント用なら **Announcements** が無難です。
    *   *注意*: カテゴリの設定で「誰でも書き込める」ようになっているか確認してください。
*   **機能**: **リアクション**機能をONにすると、Slackのように絵文字で反応できて楽しいです。
*   **テーマ**: 自分のサイトに合うものを選びます（後述するAstroコンポーネントで動的に切り替えも可能ですが、まずは `preferred_color_scheme` などが簡単です）。

## 3. Astroコンポーネントの作成

生成された `<script>` タグをそのまま貼っても動きますが、使い回せるようにコンポーネント化しましょう。
`src/components/Giscuss.astro` を作成します。

**ポイント**: `data-theme` などを自分の環境に合わせて調整してください。

```astro title="src/components/Giscuss.astro"
<div class="giscuss-container">
  <script src="https://giscus.app/client.js"
    data-repo="[ここに data-repo の値]"
    data-repo-id="[ここに data-repo-id の値]"
    data-category="Announcements"
    data-category-id="[ここに data-category-id の値]"
    data-mapping="pathname"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="preferred_color_scheme"
    data-lang="ja"
    data-loading="lazy"
    crossorigin="anonymous"
    async>
  </script>
</div>

<style>
  .giscuss-container {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--gray-light, #e0e0e0); /* サイトの変数があれば使う */
    width: 100%;
  }
</style>
```

※ `[ ]` の部分は、公式サイトで生成されたご自身の値に書き換えてください。

## 4. 記事レイアウトへの組み込み

最後に、ブログ記事のレイアウトファイルにこのコンポーネントを配置します。
例えば `src/layouts/BlogPost.astro` を編集します。

```astro title="src/layouts/BlogPost.astro"
---
import Giscuss from '../components/Giscuss.astro';
// ... その他のimport
---

<article>
  <!-- 記事の本文 -->
  <slot />

  <!-- 記事の下にコメント欄を配置 -->
  <Giscuss />
</article>
```

## 5. 動作確認

ローカル環境（`npm run dev`）でもGiscussは表示されますが、実際に投稿テストをする場合は、本番環境またはlocalhostの設定許可を確認してください。

記事ページの下部にコメント欄が表示され、GitHubアカウントでログインして書き込みができれば成功です！

## まとめ

Giscussを使うと、**サーバー管理の手間ゼロ**で、エンジニアにとって馴染み深いGitHub上のコメント体験を読者に提供できます。
「いいね」代わりのリアクション機能も標準装備されているので、読者とのコミュニケーションがより活発になるかもしれません。

ぜひ導入してみてください！