---
title: Pythonでダウンロードフォルダを秒で整理する自動化スクリプトを作る
description: 'Pythonでダウンロードフォルダを秒で整理する自動化スクリプトを作る方法を解説します。'
pubDate: '2025-04-11'
tags: ['Python', '自動化', 'ダウンロードフォルダ整理']
---

## はじめに
こんにちは。皆さんのPCのダウンロードフォルダは整理されていますか？

私は気づくと、`IMG_2025.jpg`や`講義資料(1).pdf`といったファイルで溢れかえり、必要なファイルを探すのに毎回時間を浪費していました。

そこで今回は、**Pythonを用いてダウンロードフォルダを自動で整理するツール**をつくってみました。今回はその作成過程とコードを共有していきます。

## 今回作ったツールの仕様
今回作成したスクリプト(`Download-Folder-Organizer`)の仕様は以下の通りです。

- **全自動検出** : 実行したユーザーのダウンロードフォルダを自動で見つける(Windows/Mac対応)
- **拡張子で整理** : 画像、書類、音声、動画、プログラム
などに自動で振り分ける。
- **時系列で整理** : ファイルの更新日時を取得し、`2025/04`のような階層構造を自動生成して格納する。

### 実行後のイメージ
実行すると、散らかったファイルが以下のように整然と並びます。

```bash
Downloads/
  ├─ Images/
  │   └─ 2025/
  │       └─ 12/
  │           ├─ photo.jpg
  │           └─ icon.png
  ├─ Documents/
  │   └─ 2025/
  │       └─ 11/
  │           └─ report.pdf
  ...
```

## 技術的解説
ここからは、実際に使用した技術とコードのポイントを解説します。ソースコードは記事の最後にGitHubのリンクを載せています。

### 1. 誰のPCでも動くパス指定(pathlib)
自分のPC環境をハードコーディングしてしまうと、他のPCで動きません。今回はPythonの標準ライブラリ`pathlib`を使用し、ホームディレクトリを動的に取得していきます。

```python
from pathlib import Path
# Path.home() は実行ユーザーのホームディレクトリ（例: /Users/name）を返します
TARGET_DIR = Path.home() / "Downloads"
```

こうすることで、WindowsでもMacでもLinuxでも、コードを書き替えることなく動作します。

### 2. ファイルの更新日時を取得(datetime)
単に画像フォルダに全部突っ込むと、ファイルが数千個になり逆に探しにくくなるので、`os.stat()`を使ってファイルのメタデータを取得し、`datetime`で年月ごとのフォルダ名を生成しました。

```python
import datetime

# ファイルの更新日時（タイムスタンプ）を取得
mtime = item.stat().st_mtime
dt = datetime.fromtimestamp(mtime)

# 年と月を文字列化（例: "2025", "12"）
year_str = dt.strftime('%Y')
month_str = dt.strftime('%m')

# 移動先のパスを構築
dest_folder = target_path / folder_name / year_str / month_str
```

### 3. 安全なファイル移動(shutil)
ファイルを移動する際、ファイル名が被っていなければそのまま移動するだけですが、被っていた場合は上書きしてしまう可能性があります。そこで、`shutil.move()`を使用して、安全な移動を行うようにしました。

```python
if not dest_file.exists():
    shutil.move(str(item), str(dest_file))
```

## ソースコード(GitHub)
作成したソースコードはGitHubで公開しています。以下のリポジトリからクローンして使用できます。

[Download-Folder-Organizer](https://github.com/97kuek/Download-Folder-Organizer)