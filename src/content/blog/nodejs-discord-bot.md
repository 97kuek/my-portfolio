---
title: 'Node.jsで自分専用のDiscordボットを作る'
description: 'Node.jsとdiscord.jsを使ってボットを作成します。トークン管理など、セキュリティの基本を最初からしっかり押さえた手順解説です。'
pubDate: '2025-08-20'
categories: ['Node.js', 'Discord.js']
---

## はじめに

Discordの魅力の一つは、誰でも簡単に **Bot（ボット）** を作って自動化できることです。
特定の言葉に反応させたり、決まった時間に通知を送ったり、アイデア次第で何でもできます。

今回は、「こんにちは」と話しかけると返事をしてくれるシンプルなボットを作りながら、**Node.jsでのボット開発の基礎**を解説します。

---

## 1. Discord Developer Portal での設定

まずは「ボットのアカウント」を作成します。

1.  [Discord Developer Portal](https://discord.com/developers/applications) にアクセスし、ログインします。
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

---

## 2. プロジェクトの作成とセキュリティ準備

ここからがプログラミングです。
今回は「トークンをコードに直接書かない」という、安全な開発の基本ルール（`.env`管理）を最初から守って作ります。

### フォルダとライブラリの準備

ターミナル（PowerShellやVSCodeのターミナル）を開き、以下のコマンドを順番に実行してください。

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

### トークンの設定 (.env)

プロジェクトフォルダの中に、`.env` （ドット・エンブ）という名前でファイルを作ります。
ここに、先ほどコピーしたトークンを貼り付けます。

```ini title=".env"
DISCORD_TOKEN=ここにコピーしたトークンを貼り付け
```

> [!TIP]
> もしGitで管理する場合は、必ず `.gitignore` ファイルを作り、中に `.env` と書いて、このファイルがアップロードされないようにしましょう。

---

## 3. ボットのプログラム作成 (index.js)

フォルダ内に `index.js` を作成し、以下のコードを書きます。

```javascript title="index.js"
// 必要な機能を読み込み
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

// .envファイルの設定を読み込む
dotenv.config();

// クライアント（ボット）の作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // サーバーの基本情報
        GatewayIntentBits.GuildMessages,    // メッセージの受信
        GatewayIntentBits.MessageContent,   // メッセージ内容の読み取り（重要！）
    ]
});

// 起動したときの処理
client.once('ready', () => {
    console.log(`${client.user.tag} としてログインしました！`);
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
// コードに直接書かず、process.env から読み込むので安全！
client.login(process.env.DISCORD_TOKEN);
```

---

## 4. 実行してみよう！

ターミナルで以下のコマンドを実行します。

```bash
node index.js
```

ターミナルに「〇〇 としてログインしました！」と表示されれば起動成功です。
Discordサーバーで「こんにちは」と入力してみてください。ボットが返事をしてくれるはずです！

## まとめ

今回は以下の手順でボットを作成しました。

1.  Developer Portalでボットを作り、**Message Content Intent** をONにする。
2.  `npm install discord.js dotenv` で環境を作る。
3.  `.env` ファイルでトークンを安全に管理する。
4.  `index.js` でロジックを書き、起動する。

この「`.env` で秘密情報を管理する」というやり方は、ボット開発だけでなくWeb開発全般で必須の知識です。
ぜひ覚えておいてくださいね！