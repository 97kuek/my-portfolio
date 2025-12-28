---
title: 'Node.jsで自分専用のDiscordボットを作る'
description: 'Node.jsとdiscord.jsを使ってボットを作成します。トークン管理など、セキュリティの基本を最初からしっかり押さえた手順解説です。'
pubDate: '2025-08-20'
heroImage: '../../assets/discord.jpg'
categories: ['Node.js', 'Discord.js']
---

## はじめに

みなさん、Discordは使ったことはありますか？私は、サークルなどの進捗管理ツールとして利用しています。一般的には、ゲーム中のボイスチャットなどでも使われることも多いと思います。

LINEなどのSNSと違うDiscordの魅力の一つは、誰でも簡単に **Bot（ボット）** を作って自動化できることです。
特定の言葉に反応させたり、決まった時間に通知を送ったり、アイデア次第で何でもできます。

今回は、「こんにちは」と話しかけると返事をしてくれるシンプルなボットを作りながら、**Node.jsでのボット開発の基礎**を解説します。

## 1. Discord Developer Portal での設定

まずは「ボットのアカウント」を作成します。

1.  Discord Developer Portalにアクセスし、ログインします。

https://discord.com/developers/applications 

2.  右上の **New Application** をクリックし、名前（例: MyFirstBot）を入力して作成します。
3.  左メニューの **Bot** を選び、**Reset Token** をクリックしてトークンを表示・コピーします。
4.  **Intents（権限）の設定**
    同じBot設定ページの少し下に **Privileged Gateway Intents** という項目があります。
    ここで **Message Content Intent** を **ON** にして、下の「Save Changes」を押してください。
    *   これを忘れると、ボットがユーザーのメッセージの中身（「こんにちは」など）を読めず、反応できません。
5.  **サーバーへの招待**
    左メニュー **OAuth2** > **URL Generator** を選びます。
    *   **SCOPES**: `bot` にチェック
    *   **BOT PERMISSIONS**: `Send Messages`, `Read Message History` など必要なものにチェック（テストなら `Administrator` でも可ですが、実運用では絞りましょう）
    発行されたURLをブラウザで開き、自分のサーバーにボットを招待します。

## 2. プロジェクトの作成とセキュリティ準備

ここからがプログラミングです。node.jsを用いるので、インストールしていない人は下のリンクからインストールしておきましょう。

https://nodejs.org/ja

### 2.1 フォルダとライブラリの準備

ターミナルを開き、以下のコマンドを順番に実行してください。

```bash
# 1. フォルダを作る
mkdir my-discord-bot
cd my-discord-bot

# 2. プロジェクトの初期化（Enter連打でOK）
npm init -y

# 3. 必要なライブラリを入れる
# discord.js: ボット操作用
# dotenv: トークンを隠して管理するためのライブラリ
npm install discord.js dotenv
```

`npm install` コマンドは、プロジェクトに必要なライブラリをインストールするコマンドです。
`discord.js` は、DiscordのAPIを操作するためのライブラリです。`dotenv` は、環境変数を管理するためのライブラリです。

### 2.2 トークンの設定 (.env)

プロジェクトフォルダの中に、`.env` （ドット・エンブ）という名前でファイルを作ります。
ここに、先ほどコピーしたトークンを貼り付けます。

```ini title=".env"
DISCORD_TOKEN=ここにコピーしたトークンを貼り付け
```

`.env`は、環境変数を管理するためのファイルです。他の人にトークンを漏洩させないために、GitHubで共有する際は、必ず `.gitignore` ファイルを作り、中に `.env` と書いて、このファイルがアップロードされないようにしましょう。

## 3. ボットのプログラム作成 (index.js)

フォルダ内に `index.js` を作成し、以下のコードを書きます。

```javascript title="index.js"
// 必要な機能を読み込む
// constは定数を定義
// requireはライブラリを読み込む
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

// .envファイルの設定を読み込む
dotenv.config();

// クライアント（ボット）の作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // サーバーの基本情報
        GatewayIntentBits.GuildMessages,    // メッセージの受信
        GatewayIntentBits.MessageContent,   // メッセージ内容の読み取り
    ]
});

// 起動したときの処理
client.once('ready', () => {
    console.log(`${client.user.tag} としてログインしました！`); // ログに出力
});

// メッセージを受け取ったときの処理
client.on('messageCreate', (message) => {
    // ボット自身の発言には反応しない（無限ループ防止）
    if (message.author.bot) return;

    // メッセージ内容が「こんにちは」だった場合
    if (message.content === 'こんにちは') {
        message.reply('こんにちは！Node.jsで動いていますよ！🤖');
    }
});

// ログイン実行
client.login(process.env.DISCORD_TOKEN);
```

## 4. 実行してみよう！

ターミナルで以下のコマンドを実行します。

```bash
node index.js
```

ターミナルに「〇〇 としてログインしました！」と表示されれば起動成功です。
Discordサーバーで「こんにちは」と入力してみてください。ボットが返事をしてくれるはずです！

## まとめ

今回は簡単なDiscordボットを作成しました。今回はローカルホストで動作させましたが、実際に運用する場合は、サーバー上で動作させなければなりません。以前は、Herokuなどのサービスで簡単にサーバーを借りることができたのですが、最近お金をかけなくてはならなくなったようですね...残念です。