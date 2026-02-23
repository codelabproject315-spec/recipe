# 🍳 冷蔵庫レシピ生成アプリ

今ある食材を入力するだけで、AIが自動でレシピを提案してくれるWebアプリです。

## 🚀 ローカルで動かす

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開く

## ☁️ Vercelにデプロイする手順

1. このリポジトリをGitHubにpush
2. [vercel.com](https://vercel.com) にGitHubでログイン
3. 「New Project」→ このリポジトリを選択
4. 設定はデフォルトのままで「Deploy」

以上で公開URLが発行されます！

## 📁 ファイル構成

```
recipe-app/
├── index.html          # エントリーHTML
├── vite.config.js      # Vite設定
├── package.json        # 依存パッケージ
└── src/
    ├── main.jsx        # Reactエントリー
    └── App.jsx         # メインアプリ
```

## 🔧 機能

- 食材をタグ形式で入力（Enterで追加）
- よく使う食材のクイック追加ボタン
- 料理ジャンル選択（和食・洋食・中華など）
- レシピ提案数の選択（1〜5品）
- ClaudeのAIによるレシピ自動生成
- 材料・手順・ポイントをカード形式で表示
