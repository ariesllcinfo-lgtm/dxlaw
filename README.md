# DX法研究会ウェブサイト

Cloudflare Workers Static Assets + Notion APIによる研究会ウェブサイト。

## ページ構成

- `/` — トップページ：研究理念、新着情報、各ページへの案内
- `/research-program/` — 法情報学・計算法制度科学の統合研究プログラム。Notion研究計画の本文をAPI経由で表示（固定HTMLの二重管理はしない）
- `/repository/` — 論文リポジトリ：Notionの「書籍種別：論文」だけを一覧表示し、背表紙からNotion原文を開く
- `/kazuki-ando/` — 安藤和樹：研究者プロフィール、研究関心、研究テーマ

共通デザインは `public/assets/site.css`、共通動作は `public/assets/site.js` に配置。
各ページは `public/**/index.html` に分かれ、ナビゲーションは相互リンク。

## Notion連携

- `/api/cms` — ニュース、スライド、プロフィール
- `/api/papers` — 論文リポジトリ（分類が「論文」のレコードに限定）
- `/api/research-program` — 固定したNotion統合研究計画ページの本文ブロックを読み取り専用で取得。NOTION_TOKENはWorkerのシークレットに保持し、サイト画面は取得内容を安全にDOM表示。5分以内程度のキャッシュで更新反映

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

## 法情報学の独立書架

Notion 論文リポジトリに次の２項目を追加。

- `法情報学研究`：チェックボックス。形式モデル、法令の意味・効果検証、AI処理過程の実装・評価、アルゴリズム配分の定量検証を主たる方法として扱う論文だけに設定する。専門領域に「法情報学」があるという理由だけでは設定しない。
- `法情報学研究区分`：`形式検証・規範モデル`、`AI・行政システム検証`、`アルゴリズム・定量評価` の３区分。

Notion データソースに専用ギャラリービュー「法情報学｜専用研究書架」を設け、４本の論文を登録。研究計画は[法情報学研究計画](https://app.notion.com/41d515223974810b897cf2049d1a035d)に置く。

`/api/papers` では `legalInformatics: boolean` と `legalInformaticsCategory: string` を返す。 `/repository/#legal-informatics` はフラグのついた論文をカード形式で表示し、通常の５研究系列の本棚には二重表示しない。 `研究系列`、`研究成熟度`、`書籍種別` は独立して保ち、元の法的テーマが失われないようにする。

## 開発・公開

このプロジェクトは `wrangler.jsonc` を使用するCloudflare Workerです。認証済みの開発環境からリポジトリ直下で `npx wrangler deploy` を実行します。

GitHubの `.github/workflows/verify-paper-shelf.yml` はページ分離・JS構文・6冊/行のモバイル本棚を検証します。GitHubへのpushだけでは公開されない場合があるため、Cloudflareのデプロイ履歴を確認してください。

## 法情報学・計算法制度科学の統合研究プログラム

両者は一体として扱います。公開コンテンツの正本は[Notionの統合研究計画](https://app.notion.com/p/41d515223974810b897cf2049d1a035d)です。/research-program/はWorkerの/api/research-programを通じてNotionブロックを描画し、サイト側に研究本文・詳細な日程表をハードコードしません。更新反映にはエッジキャッシュ分の遅延があり得ます。

数理仕様はNotion「数理モデル v0.1」、実装・実証の研究質問や作業項目はノートで管理します。実装には固定的な月次・年次スケジュールを設定しません。取得エラー時は古い研究内容を偽って表示せず、同期エラーを明示します。

## 論文の個別ページ（検索・OGP向けの静的HTML）

`scripts/build-paper-pages.mjs` が、Notion論文リポジトリから `/repository/<論文ID>/` を生成します。出力するのは書誌情報（題名・著者・日付・要旨・分類）だけで、本文は含みません。`citation_*` メタタグ、JSON-LD（ScholarlyArticle）、OGP、`sitemap.xml`、`robots.txt` を出します。外部CDNは使いません。

```
NOTION_TOKEN=... SITE_ORIGIN=https://公開ドメイン node scripts/build-paper-pages.mjs
node scripts/test-paper-pages.mjs   # ネットワーク不要の検証
```

公開の条件（fail closed）：「書籍種別＝論文」かつ Notion の **「公開可」チェックボックスがON** の行だけを出力します。「公開可」列がなければNotionが400を返し、何も書かずに失敗します。「公開可」を外すと、次回ビルドで生成済みページが削除されます（生成物の目印がないページは削除しません）。

Notionに追加する列（任意の列は未設定でも動きます）：

- `公開可`（チェックボックス・必須）
- `公開要旨`（テキスト・任意。公開用に書いた要旨だけを入れる。内部メモ用の「理論的貢献」は使いません）
- `公開日`（日付・任意。なければ「最終更新日」を使用）
- `著者`（テキスト・任意。なければ「安藤 和樹」）

Notion本文へのリンクは既定で出しません（リンク先が公開共有されていると全文が読めるため）。出したい場合だけ `INCLUDE_NOTION_LINK=1` を付けます。

`SITE_ORIGIN` を指定しない場合、canonical・sitemap・robots は出力しません。`NOTION_TOKEN` は読み取り専用の連携に限り、GitHub Actions の Secrets などに置いてください。
