import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 1. 追加: 数式プラグインとTOC用プラグインをインポート
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
    site: 'https://97kuek.vercel.app',

    // ▼▼▼ ここを修正しました（expressiveCodeを先頭に移動） ▼▼▼
    integrations: [expressiveCode({
        themes: ['github-dark'],
        frames: {
            showCopyToClipboardButton: true,
        },
    }), mdx(), sitemap()],

    // 2. 追加: ここで数式プラグインとTOC用プラグインを有効化します
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex, rehypeSlug, rehypeAutolinkHeadings],
    },
});