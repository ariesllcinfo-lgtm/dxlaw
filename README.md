# DX法研究会ウェブサイト

Cloudflare Workers Static Assets + Notion APIによる研究会ウェブサイト。

## ページ構成

- `/` — トップページ：研究理念、新着情報、各ページへの案内
- `/repository/` — 論文リポジトリ：Notionの「書籍種別：論文」だけを一覧表示し、背表紙からNotion原文を開く
- `/kazuki-ando/` — 安藤和樹：研究者プロフィール、研究関心、研究テーマ

共通デザインは `public/assets/site.css`、共通動作は `public/assets/site.js` に配置。
各ページは `public/**/index.html` に分かれ、ナビゲーションは相互リンク。

## Notion連携

- `/api/cms` — ニュース、スライド、プロフィール
- `/api/papers` — 論文リポジトリ（分類が「論文」のレコードに限定）

API実装は `src/worker.js`。機密情報 `NOTION_TOKEN` はCloudflare Workerのシークレットで管理し、リポジトリには置かない。

## 開発・公開

このプロジェクトは `wrangler.jsonc` を使用するCloudflare Workerです。認証済みの開発環境からリポジトリ直下で `npx wrangler deploy` を実行します。

GitHubの `.github/workflows/verify-paper-shelf.yml` はページ分離・JS構文・6冊/行のモバイル本棚を検証します。GitHubへのpushだけでは公開されない場合があるため、Cloudflareのデプロイ履歴を確認してください。
