# My Portfolio

Astroで構築された個人のポートフォリオサイト兼技術ブログです。

## ディレクトリ構成

主要なファイルとディレクトリの役割は以下の通りです。

```bash
.
├── src/
│   ├── assets/          # 画像ファイルなどの静的アセット
│   ├── components/      # 再利用可能なUIコンポーネント
│   │   ├── TagCloud.astro   # サイドバーのタグ一覧（TAGS）
│   │   ├── TechIcon.astro   # 技術アイコン（SVG）の管理
│   │   ├── PostCard.astro   # 記事一覧で表示されるカード
│   │   └── Header.astro     # サイトヘッダー
│   ├── content/
│   │   └── blog/        # ブログ記事のMarkdownファイル (.md) はここに配置
│   ├── layouts/         # ページ全体の共通レイアウト
│   ├── pages/           # ページコンポーネント（ファイル名がURLに対応）
│   │   ├── index.astro       # トップページ
│   │   └── blog/
│   │       └── [...page].astro # ページネーション付きブログ一覧
│   └── styles/          # グローバルCSS (global.css)
└── public/              # 静的ファイル（faviconなど）
```

## 開発・編集ガイド

- **記事の追加**: `src/content/blog/` に新しい `.md` ファイルを作成してください。
- **タグの編集**: 記事の frontmatter に `categories: ['タグ名']` を記述すると、自動的にサイドバーのTAGSに追加されます。
- **アイコンの追加**: 新しい技術タグを使う場合、`src/components/TechIcon.astro` にSVG定義を追加するとアイコンが表示されます。