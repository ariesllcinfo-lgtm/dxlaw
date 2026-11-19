#!/usr/bin/env node
// scripts/build-paper-pages.mjs の検証。ネットワーク不要: node scripts/test-paper-pages.mjs
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, readdir, writeFile, access} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, escapeHtml, selectPublishable} from './build-paper-pages.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(await readFile(path.join(here, 'fixtures/papers.sample.json'), 'utf8')).results;
const exists = p => access(p).then(() => true, () => false);

// 1. 公開ゲート: 公開可＋論文＋正しいIDだけ
const {papers, skipped} = selectPublishable(fixture);
assert.deepEqual(papers.map(p => p.id), ['PAP-0001']);
assert.equal(skipped.length, 1);
assert.match(skipped[0], /invalid 論文ID/);

// 2. 生成
const publicDir = await mkdtemp(path.join(os.tmpdir(), 'dxlaw-pages-'));
const origin = 'https://example.org';
const repoDir = path.join(publicDir, 'repository');
await mkdir(path.join(repoDir, 'PAP-9999'), {recursive: true});
await writeFile(path.join(repoDir, 'PAP-9999', 'index.html'), '<meta name="generator" content="dxlaw-paper-pages">'); // 以前の生成物
await mkdir(path.join(repoDir, 'handmade'), {recursive: true});
await writeFile(path.join(repoDir, 'handmade', 'index.html'), '<p>手書き</p>');
await writeFile(path.join(repoDir, 'index.html'), '<p>repository top</p>');

const result = await build({pages: fixture, publicDir, origin});
assert.deepEqual(result.removed, ['PAP-9999'], '公開可でなくなった生成ページは削除される');
assert.ok(await exists(path.join(repoDir, 'handmade', 'index.html')), '手書きページは消さない');
assert.equal(await readFile(path.join(repoDir, 'index.html'), 'utf8'), '<p>repository top</p>', '一覧ページは上書きしない');
assert.ok(!await exists(path.join(repoDir, 'PAP-0002')), '公開可OFFは出力しない');
assert.ok(!await exists(path.join(repoDir, 'NOTE-0001')), '論文以外は出力しない');
assert.ok(!await exists(path.join(publicDir, 'assets')), 'パストラバーサルで外へ書かない');
assert.deepEqual((await readdir(repoDir)).sort(), ['PAP-0001', 'handmade', 'index.html']);

// 3. HTMLの中身
const html = await readFile(path.join(repoDir, 'PAP-0001', 'index.html'), 'utf8');
for (const needle of [
  '<meta name="citation_title"', '<meta name="citation_author" content="安藤 和樹">',
  '<meta name="citation_publication_date" content="2026/11/01">',
  '<link rel="canonical" href="https://example.org/repository/PAP-0001/">',
  '<meta property="og:title"', '"@type": "ScholarlyArticle"', '"datePublished": "2026-11-01"',
  '<meta name="citation_keywords" content="法情報学">', 'href="/assets/paper-page.css"',
]) assert.ok(html.includes(needle), 'missing: ' + needle);
assert.ok(!html.includes('cdn.tailwindcss.com') && !html.includes('fonts.googleapis.com'), '外部CDNを使わない');

// 4. エスケープ（XSS）
assert.ok(!html.includes('<img src=x'), '要旨のHTMLはエスケープされる');
assert.ok(!/<b>x<\/b>/.test(html), 'タイトルのHTMLはエスケープされる');
const ldBlock = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
assert.ok(!ldBlock.includes('<'), 'JSON-LD内に生の < を出さない');
const ld = JSON.parse(ldBlock);
assert.equal(ld.headline, 'サンプル論文 </script><b>x</b> & "引用"', 'JSON-LDは元の値に復元できる');
assert.equal(html.match(/<script/g).length, 1, 'scriptはJSON-LDの1つだけ');
assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');

// 5. sitemap / robots
const sitemap = await readFile(path.join(publicDir, 'sitemap.xml'), 'utf8');
assert.ok(sitemap.includes('<loc>https://example.org/repository/PAP-0001/</loc>'));
assert.ok(!sitemap.includes('PAP-0002'));
const robots = await readFile(path.join(publicDir, 'robots.txt'), 'utf8');
assert.ok(robots.includes('Disallow: /api/') && robots.includes('Sitemap: https://example.org/sitemap.xml'));

// 6. origin未設定ならcanonical・sitemapを出さない
const bare = await mkdtemp(path.join(os.tmpdir(), 'dxlaw-bare-'));
await build({pages: fixture, publicDir: bare, origin: ''});
const bareHtml = await readFile(path.join(bare, 'repository', 'PAP-0001', 'index.html'), 'utf8');
assert.ok(!bareHtml.includes('rel="canonical"'));
assert.ok(!await exists(path.join(bare, 'sitemap.xml')));

// 7. 公開可が1件もなければ、生成ページは全て消える
await build({pages: [], publicDir, origin});
assert.ok(!await exists(path.join(repoDir, 'PAP-0001')));

console.log('PASS: paper pages (gate, escaping, stale removal, sitemap)');
