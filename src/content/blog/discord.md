---
title: 【第1弾】Node.jsで自分専用のDiscordボットを作ってみよう！
description: 'Discordの設定方法'
pubDate: '2025-12-20'
tags: ['設定', 'Discord', '技術解説']
---

<現在執筆中...>

### はじめに

こんにちは！みなさんはDiscordを使ったことはあるでしょうか？
私はサークル活動などで頻繁に使用しています。Discordには「Bot」という便利な拡張機能があり、今回は学習も兼ねて、**Node.jsを使って自分専用のボットを作ってみよう**と思います。

## なぜ「Node.js」を選ぶのか？

Discordボットを作るためのライブラリは、Python (`discord.py`) などいくつか選択肢がありますが、私は以下の理由で **Node.js (`discord.js`)** を選びました。

* **イベント駆動型でリアルタイム性に強い**:
「メッセージが送られた」「誰かがサーバーに参加した」といったイベントに対し、非同期処理（Async/Await）を使って効率よく反応できます。
* **JavaScriptの知識を活かせる**:
Web開発で広く使われるJavaScriptで書けるため、将来的にWebアプリなどを作りたい人にとっても学習効率が良いです。

---

## Discord Developer Portalでのボット登録

コードを書く前に、まずは**Discordの運営側にボットを登録する**必要があります。

1. **[Discord Developer Portal](https://discord.com/developers/applications)** にログインし、「New Application」を作成します。
2. **Botタブ**から「Token」を取得します。
* > **注意！** Tokenはボットの「パスワード」です。絶対に他人に教えたり、GitHubなどで公開したりしないでください。




3. **Privileged Gateway Intentsの設定**:
ここが一番の落とし穴です。同じくBotタブにある **`MESSAGE CONTENT INTENT`** を必ず **ON** にしてください。これを忘れると、ボットがメッセージの内容を読み取ることができません。

---

## 「こんにちは」に返信する最小限のコード

環境が整ったら、いよいよプログラミングです。
適当な場所にプロジェクト用のフォルダを作成してターミナルを開き、以下のコマンドを実行して準備をします。

```bash
# プロジェクトの初期化
npm init -y
# ライブラリのインストール
npm install discord.js

```

次に、フォルダ内に `index.js` というファイルを作成し、以下のコードを記述します。

```javascript
const { Client, GatewayIntentBits } = require('discord.js');

// ボットが受け取る情報の種類を設定
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // サーバーとの接続
        GatewayIntentBits.GuildMessages,    // メッセージの検知
        GatewayIntentBits.MessageContent,   // メッセージ内容の取得
    ]
});

// 起動確認
client.once('ready', () => {
    console.log(`ログインしました！: ${client.user.tag}`);
});

// 返信ロジック
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // 自分の発言には反応しない

    if (message.content === 'こんにちは') {
        message.reply('こんにちは！Node.jsで動いていますよ！');
    }
});

// 取得したトークンでログイン
client.login('YOUR_BOT_TOKEN_HERE');

```

最後に、ターミナルで `node index.js` を実行して、ボットがオンラインになれば成功です！
