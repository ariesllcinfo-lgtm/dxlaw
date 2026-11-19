#!/usr/bin/env node
// 論文ごとの静的な個別ページ（/repository/<論文ID>/）を生成する。
//
//   NOTION_TOKEN=... SITE_ORIGIN=https://example.org node scripts/build-paper-pages.mjs
//   node scripts/build-paper-pages.mjs --fixture scripts/fixtures/papers.sample.json --out /tmp/out
//
// 公開の安全側ルール（fail closed）:
//   * 書籍種別が「論文」かつ Notion の「公開可」チェックが ON の行だけを出力する。
//   * 「公開可」列が存在しない場合、Notion が 400 を返し、このスクリプトは何も書かずに失敗する。
//   * 公開可を外した論文のページは、次回ビルドで削除される（生成物の目印がある場合のみ）。
//   * 本文は出力しない。書誌情報（題名・著者・日付・要旨・分類）だけを静的HTMLにする。

import {mkdir, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const PAPER_SOURCE_ID = '3fa51522-3974-80bd-bbbd-000b4bd5eea2';
const NOTION_VERSION = '2025-09-03';
const PAPER_TYPE = '論文';
const PUBLISH_FLAG = '公開可';
const GENERATOR = 'dxlaw-paper-pages';
const DEFAULT_AUTHOR = '安藤 和樹';
const DEFAULT_AUTHOR_EN = 'Kazuki Ando';
const SITE_NAME = 'DX法研究会';
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const STATIC_PATHS = ['/', '/repository/', '/research-program/', '/kazuki-ando/'];

const MATURITY_NOTE = {
  '完成': '研究計画上の「完成」段階の原稿です。査読済みを意味しません。',
};
const DEFAULT_NOTE = '研究計画上の分類は成熟度を示すもので、査読済み・完成を意味しません。内容は改訂されることがあります。';

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => (
    {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
}

export function jsonLd(object) {
  return JSON.stringify(object, null, 2)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function plain(prop) {
  if (!prop) return '';
  if (prop.type === 'title' || prop.type === 'rich_text') {
    return (prop[prop.type] || []).map(part => part.plain_text || '').join('').trim();
  }
  if (prop.type === 'select') return prop.select?.name || '';
  return '';
}

function dateOf(prop) {
  const start = prop?.type === 'date' ? prop.date?.start : '';
  return /^\d{4}-\d{2}-\d{2}/.test(start || '') ? start.slice(0, 10) : '';
}

export function normalizePage(page) {
  const p = page.properties || {};
  const id = plain(p['論文ID']);
  const author = plain(p['著者']) || DEFAULT_AUTHOR;
  return {
    id,
    title: plain(p['論文タイトル']),
    subtitle: plain(p['サブタイトル']),
    author,
    authorEn: author === DEFAULT_AUTHOR ? DEFAULT_AUTHOR_EN : '',
    abstract: plain(p['公開要旨']),
    series: plain(p['研究系列']),
    maturity: plain(p['研究成熟度']),
    specialties: p['専門領域']?.type === 'multi_select'
      ? (p['専門領域'].multi_select || []).map(o => o.name).filter(Boolean) : [],
    version: p['現在版']?.type === 'number' ? p['現在版'].number : null,
    published: dateOf(p['公開日']),
    modified: dateOf(p['最終更新日']) || (page.last_edited_time || '').slice(0, 10),
    notionUrl: typeof page.url === 'string' && /^https:\/\//.test(page.url) ? page.url : '',
    type: plain(p['書籍種別']),
    publishable: p[PUBLISH_FLAG]?.type === 'checkbox' && p[PUBLISH_FLAG].checkbox === true,
    archived: Boolean(page.archived || page.in_trash),
  };
}

// 出力してよい論文だけを返す。ここが唯一の公開ゲート。
export function selectPublishable(pages) {
  const seen = new Set();
  const papers = [];
  const skipped = [];
  for (const page of pages) {
    const paper = normalizePage(page);
    const label = paper.id || paper.title || '(no id)';
    if (paper.archived || paper.type !== PAPER_TYPE || !paper.publishable) continue;
    if (!paper.title) { skipped.push(label + ': title missing'); continue; }
    if (!ID_PATTERN.test(paper.id)) { skipped.push(label + ': invalid 論文ID'); continue; }
    if (seen.has(paper.id)) { skipped.push(label + ': duplicate 論文ID'); continue; }
    seen.add(paper.id);
    papers.push(paper);
  }
  papers.sort((a, b) => a.id.localeCompare(b.id, 'en', {numeric: true}));
  return {papers, skipped};
}

function pageUrl(origin, id) {
  return origin ? `${origin}/repository/${encodeURIComponent(id)}/` : '';
}

export function renderPaperPage(paper, origin) {
  const url = pageUrl(origin, paper.id);
  const date = paper.published || paper.modified;
  const description = paper.abstract || paper.subtitle || `${SITE_NAME}の論文書誌情報`;
  const shortDescription = description.length > 200 ? description.slice(0, 197) + '…' : description;
  const fullTitle = paper.subtitle ? `${paper.title} ― ${paper.subtitle}` : paper.title;
  const keywords = [...paper.specialties, paper.series].filter(Boolean);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: paper.title,
    ...(paper.subtitle ? {alternativeHeadline: paper.subtitle} : {}),
    inLanguage: 'ja',
    author: {
      '@type': 'Person', name: paper.author,
      ...(paper.authorEn ? {alternateName: paper.authorEn} : {}),
    },
    publisher: {'@type': 'Organization', name: SITE_NAME},
    ...(date ? {datePublished: date} : {}),
    ...(paper.modified ? {dateModified: paper.modified} : {}),
    ...(paper.abstract ? {abstract: paper.abstract} : {}),
    ...(keywords.length ? {keywords: keywords.join(', ')} : {}),
    ...(url ? {url, mainEntityOfPage: url} : {}),
    identifier: paper.id,
    ...(paper.version != null ? {version: String(paper.version)} : {}),
  };

  const meta = [
    `<meta name="generator" content="${GENERATOR}">`,
    `<meta name="description" content="${escapeHtml(shortDescription)}">`,
    `<meta name="author" content="${escapeHtml(paper.author)}">`,
    url ? `<link rel="canonical" href="${escapeHtml(url)}">` : '',
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(shortDescription)}">`,
    url ? `<meta property="og:url" content="${escapeHtml(url)}">` : '',
    `<meta name="twitter:card" content="summary">`,
    `<meta name="citation_title" content="${escapeHtml(paper.title)}">`,
    `<meta name="citation_author" content="${escapeHtml(paper.author)}">`,
    date ? `<meta name="citation_publication_date" content="${date.replace(/-/g, '/')}">` : '',
    `<meta name="citation_language" content="ja">`,
    `<meta name="citation_publisher" content="${SITE_NAME}">`,
    url ? `<meta name="citation_abstract_html_url" content="${escapeHtml(url)}">` : '',
    ...paper.specialties.map(k => `<meta name="citation_keywords" content="${escapeHtml(k)}">`),
  ].filter(Boolean).join('\n  ');

  const rows = [
    ['論文ID', paper.id],
    ['著者', paper.author],
    paper.series && ['研究系列', paper.series],
    paper.maturity && ['研究成熟度', paper.maturity],
    paper.version != null && ['版', 'v' + paper.version],
    date && ['日付', date],
    paper.modified && paper.modified !== date && ['最終更新', paper.modified],
  ].filter(Boolean).map(([k, v]) =>
    `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('\n        ');

  const note = MATURITY_NOTE[paper.maturity] || DEFAULT_NOTE;
  const abstractBlock = paper.abstract
    ? `<section aria-labelledby="abstract"><h2 id="abstract">要旨</h2>${
      paper.abstract.split(/\n{2,}/).map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('')}</section>`
    : '';
  const tags = paper.specialties.length
    ? `<ul class="tags" aria-label="専門領域">${paper.specialties.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul>` : '';
  const readLink = paper.notionUrl
    ? `<p><a class="button" href="${escapeHtml(paper.notionUrl)}" rel="noopener noreferrer" target="_blank">本文をNotionで開く ↗</a></p>` : '';

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(paper.title)} | ${SITE_NAME}</title>
  ${meta}
  <link rel="stylesheet" href="/assets/paper-page.css">
  <script type="application/ld+json">
${jsonLd(ld)}
  </script>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">${SITE_NAME}</a>
    <nav aria-label="サイトナビゲーション">
      <a href="/repository/#works">論文リポジトリ</a>
      <a href="/research-program/">研究プログラム</a>
      <a href="/kazuki-ando/#profile">安藤和樹</a>
    </nav>
  </header>
  <main>
    <p class="crumbs"><a href="/">トップ</a> ／ <a href="/repository/#works">論文リポジトリ</a> ／ ${escapeHtml(paper.id)}</p>
    <article>
      <h1>${escapeHtml(paper.title)}</h1>
      ${paper.subtitle ? `<p class="subtitle">${escapeHtml(paper.subtitle)}</p>` : ''}
      <dl class="meta">
        ${rows}
      </dl>
      ${abstractBlock}
      ${tags}
      <p class="note">${escapeHtml(note)}</p>
      ${readLink}
    </article>
  </main>
  <footer>&copy; 2026 ${SITE_NAME} (${DEFAULT_AUTHOR_EN}). All Rights Reserved.</footer>
</body>
</html>
`;
}

export function renderSitemap(origin, papers) {
  const urls = [
    ...STATIC_PATHS.map(p => origin + p),
    ...papers.map(p => pageUrl(origin, p.id)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${escapeHtml(u)}</loc></url>`).join('\n')}
</urlset>
`;
}

export function renderRobots(origin) {
  return `# generated by ${GENERATOR}
User-agent: *
Disallow: /api/
Sitemap: ${origin}/sitemap.xml
`;
}

async function isGenerated(file) {
  try { return (await readFile(file, 'utf8')).includes(`content="${GENERATOR}"`); }
  catch { return false; }
}

// 公開可が外れた／削除された論文の生成ページを消す。手書きのページは目印が無いので触らない。
export async function removeStalePages(outDir, keepIds) {
  let removed = [];
  let entries = [];
  try { entries = await readdir(outDir, {withFileTypes: true}); } catch { return removed; }
  for (const entry of entries) {
    if (!entry.isDirectory() || keepIds.has(entry.name)) continue;
    const file = path.join(outDir, entry.name, 'index.html');
    if (await isGenerated(file)) {
      await rm(path.join(outDir, entry.name), {recursive: true, force: true});
      removed.push(entry.name);
    }
  }
  return removed;
}

async function fetchFromNotion(token) {
  const pages = [];
  let cursor = null;
  const visited = new Set();
  do {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${PAPER_SOURCE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        filter: {and: [
          {property: '書籍種別', select: {equals: PAPER_TYPE}},
          {property: PUBLISH_FLAG, checkbox: {equals: true}},
        ]},
        ...(cursor ? {start_cursor: cursor} : {}),
      }),
    });
    if (!response.ok) {
      const hint = response.status === 400
        ? `（Notionの論文リポジトリに「${PUBLISH_FLAG}」チェックボックス列が必要です）` : '';
      throw new Error(`Notion API error ${response.status}${hint}`);
    }
    const body = await response.json();
    pages.push(...(body.results || []));
    cursor = body.has_more ? body.next_cursor : null;
    if (body.has_more && !cursor) throw new Error('Missing Notion pagination cursor');
    if (cursor) {
      if (visited.has(cursor)) throw new Error('Repeated Notion pagination cursor');
      visited.add(cursor);
    }
  } while (cursor);
  return pages;
}

function parseArgs(argv) {
  const args = {fixture: '', out: '', publicDir: ''};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--fixture') args.fixture = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--public') args.publicDir = argv[++i];
    else throw new Error('Unknown argument: ' + argv[i]);
  }
  return args;
}

export async function build({pages, publicDir, origin}) {
  const {papers, skipped} = selectPublishable(pages);
  const outDir = path.join(publicDir, 'repository');
  await mkdir(outDir, {recursive: true});
  for (const paper of papers) {
    const dir = path.join(outDir, paper.id);
    await mkdir(dir, {recursive: true});
    await writeFile(path.join(dir, 'index.html'), renderPaperPage(paper, origin));
  }
  const removed = await removeStalePages(outDir, new Set(papers.map(p => p.id)));
  if (origin) {
    await writeFile(path.join(publicDir, 'sitemap.xml'), renderSitemap(origin, papers));
    await writeFile(path.join(publicDir, 'robots.txt'), renderRobots(origin));
  }
  return {papers, skipped, removed};
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const publicDir = path.resolve(args.publicDir || args.out || path.join(root, 'public'));
  const rawOrigin = (process.env.SITE_ORIGIN || '').trim().replace(/\/+$/, '');
  if (rawOrigin && !/^https:\/\/[A-Za-z0-9.-]+(:\d+)?$/.test(rawOrigin)) {
    throw new Error('SITE_ORIGIN must look like https://example.org');
  }
  if (!rawOrigin) console.warn('SITE_ORIGIN未設定: canonical・sitemap.xml・robots.txtは出力しません。');

  let pages;
  if (args.fixture) {
    pages = JSON.parse(await readFile(args.fixture, 'utf8')).results;
  } else {
    if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN is required (or use --fixture)');
    pages = await fetchFromNotion(process.env.NOTION_TOKEN);
  }
  const result = await build({pages, publicDir, origin: rawOrigin});
  console.log(`generated ${result.papers.length} paper page(s): ${result.papers.map(p => p.id).join(', ') || '-'}`);
  if (result.removed.length) console.log('removed stale page(s): ' + result.removed.join(', '));
  for (const message of result.skipped) console.warn('skipped ' + message);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exit(1); });
}
