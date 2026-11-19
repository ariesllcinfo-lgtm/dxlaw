# DX法研究会ウェブサイト

Cloudflare Workers Static Assets + Notion APIによる研究会ウェブサイト。

## ページ構成

- `/` — トップページ：研究理念、新着情報、各ページへの案内
- `/research-program/` — 計算法制度科学：制度分析から経営・経済予測までを結ぶ研究プログラムの公開ページ（Notionの詳細計画にリンク）
- `/repository/` — 論文リポジトリ：Notionの「書籍種別：論文」だけを一覧表示し、背表紙からNotion原文を開く
- `/kazuki-ando/` — 安藤和樹：研究者プロフィール、研究関心、研究テーマ

共通デザインは `public/assets/site.css`、共通動作は `public/assets/site.js` に配置。
各ページは `public/**/index.html` に分かれ、ナビゲーションは相互リンク。

## Notion連携

- `/api/cms` — ニュース、スライド、プロフィール
- `/api/papers` — 論文リポジトリ（分類が「論文」のレコードに限定）

API実装は `src/worker.js`。機密情報 `NOTION_TOKEN` はCloudflare Workerのシークレットで管理し、リポジトリには置かない。

## 研究系列の表示

論文リポジトリのNotionデータソースには「研究系列」と「系列内位置」を追加しています。既存の「理論領域」や「専門領域」「書籍種別」は変更せず、別軸で運用します。

- Ⅰ 制度的確定と損失帰属（中核研究）
- Ⅱ AIによる行為帰属と責任（中核研究）
- Ⅲ 財産拘束と比較財産法（中核研究）
- Ⅳ 法的責任と経済的リスク（中核研究）
- Ⅴ 公的配分と係数統治（育成）

`/api/papers` は上記の2つのNotion項目を `researchSeries`, `seriesRole` として返します。 `/repository/` は研究系列カードでの絞り込みと系列別の並び順を提供し、従来の分野別配色を維持します。未分類論文も「その他・未分類」から閲覧できます。

研究体系の整理・位置づけは[Notionの研究体系ガイド](https://app.notion.com/41d515223974816fbea9f961a13a9a21)に記載。分類は研究計画上の体系で、査読済み・完成を意味しません。

## 開発・公開

このプロジェクトは `wrangler.jsonc` を使用するCloudflare Workerです。認証済みの開発環境からリポジトリ直下で `npx wrangler deploy` を実行します。

GitHubの `.github/workflows/verify-paper-shelf.yml` はページ分離・JS構文・6冊/行のモバイル本棚を検証します。GitHubへのpushだけでは公開されない場合があるため、Cloudflareのデプロイ履歴を確認してください。

## 計算法制度科学の研究計画

「計算法制度科学」は研究プログラムの仮称であり、新学問としての成立や予測精度は未検証です。詳細は[Notionの研究計画](https://app.notion.com/p/41d515223974810b897cf2049d1a035d)を参照してください。論文リポジトリの「書籍種別＝論文」の表示条件は変更しません。
