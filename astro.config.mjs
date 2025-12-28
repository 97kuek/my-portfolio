import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import { defineConfig } from 'astro/config';

// 1. 追加: 数式プラグインとTOC用プラグイン、リンクカードプラグインをインポート
import remarkMath from 'remark-math';
import remarkLinkCard from 'remark-link-card';
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
    }), mdx(), sitemap(), partytown({
        config: {
            forward: ["dataLayer.push"],
        },
    })],

    // 2. 追加: ここで数式プラグインとTOC用プラグインを有効化します
    markdown: {
        remarkPlugins: [remarkMath, remarkLinkCard],
        rehypePlugins: [rehypeKatex, rehypeSlug, rehypeAutolinkHeadings],
    },
});