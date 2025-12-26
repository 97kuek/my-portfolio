---
title: 【第1弾】Node.jsで自分専用のDiscordボットを作ってみよう！
description: 'Node.jsとdiscord.jsを使って、自分専用のDiscordボットを作成・設定する方法を解説します。'
pubDate: '2025-12-20'
tags: ['設定', 'Discord', '技術解説']
---

### はじめに

こんにちは！みなさんはDiscordを使ったことはあるでしょうか？

Discordとは、**音声・ビデオ・テキストを用いてリアルタイムで交流できる**プラットフォームです。ちなみに私はサークル活動などで頻繁に使用しています。

LINEと違ってDiscordは**拡張性が高い**というのが1つのメリットです。その代表例が**ボット**です。ボットは、一言でいうとDiscord上で自動的に作業を行ってくれるプログラムのことです。**サーバー管理の自動化**や**情報の通知と連携**などなど、様々な便利な機能を自動化してくれます。Discordには**MEE6**や**ProBot**など、世界中で使用されている多機能ボットが存在しますが、もっと**カスタマイズ性を持ったボット**を作りたい人に向けて、**自分専用のボットを作ってみよう**と思います。今回は第1弾として、**こんにちはに返信する最小限のコードを実装したボット**を作っていきたいと思います。

## Discord Developer Portalでのボット登録

コードを書く前に、まずは**Discordの運営側にボットを登録する**必要があります。

1. **[Discord Developer Portal](https://discord.com/developers/applications)** にログインし、**New Application**を作成します。
2. **Botタブ**から**Token**を取得します。※Tokenはボットの「パスワード」です。絶対に他人に教えたり、GitHubなどで公開したりしないでください。
3. **Privileged Gateway Intentsの設定**:
ここが一番の落とし穴です。**同じくBotタブにある** **`MESSAGE CONTENT INTENT`** を必ず **ON** にしてください。これを忘れると、ボットがメッセージの内容を読み取ることができません。

## 「こんにちは」に返信する最小限のコード

環境が整ったら、いよいよプログラミングです。
適当な場所にプロジェクト用のフォルダを作成してターミナルを開き、以下のコマンドを実行します。

```bash
npm init -y
npm install discord.js

```
最初のコマンドは、プロジェクトを開始する際の初期化コマンドです。`-y`は`yes`の略で、プロジェクトの基本情報を記述する手間を省くことができます。これを実行すると、`package.json`というファイルが作成されます。2個目のコマンドは、Discordを操作するためのライブラリを自分のパソコンにダウンロードするコマンドです。

コマンドを打ち終えたら、フォルダ内に `index.js` というファイルを作成し、以下のコードを記述します。

```javascript title="index.js"
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

最後に、ターミナルで以下のコマンドを実行しましょう。

``` bash
node index.js
```

ボットがオンラインになれば成功です！

## 補足
今回のindex.jsはDiscordのトークンをそのまま記述しているため、GitHubなどで公開する際には注意が必要です。
トークンを安全に管理するには、`.env`ファイルを用いてトークンを管理する方法があります。まずは、.envファイルを実行するのに必要な`dotenv`ライブラリを追加でインストールしましょう。ターミナルで以下を実行してください

``` bash
npm install dotenv
```

実行し終えたら、`package.json`と同じ階層に`.env`ファイルを作成し、以下のように記述してください

``` .env title=".env"
DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
```

次に、index.jsを以下のように修正してください

```javascript title="index.js"
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

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
client.login(process.env.DISCORD_TOKEN);
```

これで、`.gitignore`ファイルに`.env`を追加することで、トークンを安全に管理することができました。

## まとめ
今回は簡易的なボットの作成方法を紹介しました。機会があれば次回は、スラッシュコマンドを実装したボット、外部APIを使用したボットなど、より複雑なボットの作成方法を紹介したいと思います！それでは！