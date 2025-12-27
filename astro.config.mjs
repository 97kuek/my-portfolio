import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// 1. 追加: 数式プラグインをインポート
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
    site: 'https://97kuek.vercel.app',

    // ▼▼▼ ここを修正しました（expressiveCodeを先頭に移動） ▼▼▼
    integrations: [expressiveCode({
        frames: {
            showCopyToClipboardButton: true,
        },
    }), mdx(), sitemap()],

    // 2. 追加: ここで数式プラグインを有効化します
    markdown: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeKatex],
    },
});