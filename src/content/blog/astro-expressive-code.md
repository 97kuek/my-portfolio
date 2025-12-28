---
title: 'Astroのコードブロックを劇的に見やすくする！Expressive Code導入ガイド'
description: 'Astroのコードブロックを劇的に見やすくする！Expressive Code導入ガイド'
pubDate: '2025-12-27'
heroImage: '../../assets/astro.png'
categories: ['Web Development']
---

## はじめに
技術ブログやポートフォリオサイトをつくっていると、**ソースコードをもっと綺麗に見せたい**と思うことがあると思います。

デフォルトのシンタックスハイライトだけでは少し物足りない...そんな時におすすめなのが**Expressive Code**です。これを導入することで、**ファイル名表示**、**行番号表示**、**コードブロックの角丸**などが簡単に実現できます。

今回は、AstroでExpressive Codeを導入する方法を紹介します。

## Expressive Codeとは？
Expressive Codeは、Markdown内のコードブロックを拡張するためのエンジンです。主な特徴は以下の通り。

- Macのウィンドウ風デザイン
- コピーボタンの標準搭載
- 行のハイライトやDiff表示が簡単
- レスポンシブ対応(スマホでも崩れない)

私のブログにもExpressive Codeが導入されています。

## 1. インストール
まずはプロジェクトにパッケージを追加します。Astroには便利な`astro add`コマンドが用意されているので、これを使うのが一番早いです。ターミナルを開き、以下のコマンドを実行してください。

```bash
npx astro add astro-expressive-code
```

## 2. 設定の確認
自動インストールが完了したら、念のため`astro.config.mjs`を確認してみましょう。以下のように`expressiveCode()`がインポート、`integrations`配列に追加されていればOKです。

```javascript
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [expressiveCode()],
});
```

基本的にはこれだけで導入完了です！

## 3. テーマのカスタマイズ
デフォルトでも十分綺麗ですが、好みに合わせてカスタマイズできます。`astro.config.mjs`にオプションを追加します。。

```javascript
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';

export default defineConfig({
  integrations: [expressiveCode({
    theme: ['dracula', 'github-light'],
    styleOverrides: {
        codeFontFamily: 'MyCustomFont, monospace',
    }
  })],
});
```

## まとめ
AstroにExpressive Codeを導入することで、コードブロックを劇的に見やすくすることができます。コマンドで一発で導入できるので是非試してみてください！