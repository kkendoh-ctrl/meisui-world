# GitHub Pages デプロイメント手順

## 現在の状態

- ✅ ローカルリポジトリ初期化完了
- ✅ ファイルコミット完了
- ✅ リモートリポジトリ設定完了
- ⏳ GitHub へのプッシュ待機中

## 推奨デプロイ方法

### 方法1: GitHub CLI (gh) を使用（推奨）

```bash
cd /sessions/stoic-funny-faraday/mnt/めいすいくん/github-deploy/

# GitHub にログイン（初回のみ）
gh auth login

# リポジトリにプッシュ
git push -u origin main
```

### 方法2: Web ブラウザから直接アップロード

1. https://github.com/kkendoh-ctrl/meisui-world にアクセス
2. 「Upload files」をクリック
3. 以下のファイルをドラッグ&ドロップ：
   - vote.html
   - display.html
   - index.html
   - README.md
4. 「Commit changes」をクリック

### 方法3: Personal Access Token を使用

```bash
cd /sessions/stoic-funny-faraday/mnt/めいすいくん/github-deploy/

# リモートURLを更新（TOKEN は自身の PAT に置き換え）
git remote set-url origin https://kkendoh-ctrl:TOKEN@github.com/kkendoh-ctrl/meisui-world.git

# プッシュ
git push -u origin main
```

## GitHub Pages 設定

プッシュ後、リポジトリの Settings で以下を設定：

1. **Settings** → **Pages** を開く
2. **Build and deployment** セクション
3. **Source**: "Deploy from a branch" を選択
4. **Branch**: main / root (/) を選択
5. **Save** をクリック

数分後、以下のURLでサイトが公開されます：
- https://kkendoh-ctrl.github.io/meisui-world/

## 確認事項

### プッシュ前にチェック

```bash
# リモート設定確認
git remote -v
# Expected output:
# origin  https://github.com/kkendoh-ctrl/meisui-world.git (fetch)
# origin  https://github.com/kkendoh-ctrl/meisui-world.git (push)

# ローカルコミット確認
git log --oneline
# Expected: 2つ以上のコミットが表示される

# ファイルの状態確認
git status
# Expected: working tree clean
```

### デプロイ後に確認

1. リポジトリページで以下を確認：
   - ✅ すべてのファイルが main ブランチに存在
   - ✅ README.md が表示される
   - ✅ Settings → Pages で公開ステータスを確認

2. 公開ページをテスト：
   - https://kkendoh-ctrl.github.io/meisui-world/ にアクセス
   - vote.html と display.html へのリンクが機能すること
   - ページが正常に読み込まれること

## トラブルシューティング

### GitHub Pages が 404 を返す

**原因:** GitHub Pages ビルドが完了していない

**解決方法:**
1. Settings → Pages を再度確認
2. "Your site is published at..." メッセージを待つ（5～10分）
3. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）
4. ページを再読み込み（Ctrl+F5）

### Firebase が接続できない

**原因:** HTTPS への自動リダイレクトやセキュリティルール

**確認事項:**
1. ブラウザコンソール（F12）でエラーを確認
2. Firebase コンソールでセキュリティルール確認
3. Firebase SDK CDN が読み込まれているか確認

### ファイルの変更がページに反映されない

**原因:** キャッシュ

**解決方法:**
1. Git で最新版をプッシュ
2. ブラウザキャッシュをクリア
3. Ctrl+F5 でハードリロード

## 更新手順

ファイルを更新した場合：

```bash
cd /sessions/stoic-funny-faraday/mnt/めいすいくん/github-deploy/

# 変更を確認
git status

# ステージング
git add .

# コミット
git commit -m "更新内容の説明"

# プッシュ
git push origin main
```

## リポジトリ情報

| 項目 | 値 |
|---|---|
| リポジトリ URL | https://github.com/kkendoh-ctrl/meisui-world |
| ホスティング URL | https://kkendoh-ctrl.github.io/meisui-world/ |
| ブランチ | main |
| ビルド設定 | Deploy from a branch |
| Source | main / root |

## Firebase セキュリティルール（推奨）

本番環境ではセキュリティルールを設定してください：

```json
{
  "rules": {
    "votes": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

または、認証なしの読み取りのみ許可（開発用）：

```json
{
  "rules": {
    "votes": {
      ".read": true,
      ".write": false
    }
  }
}
```

---

**デプロイメント完了後は、DEPLOYMENT_COMPLETE.md を作成して完了日時を記録してください。**
