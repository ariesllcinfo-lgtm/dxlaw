const SOURCE_ID = '681eb1aa-52bb-4073-b159-6ddbfc9aebee';
const fields = {
  works: ['id','type','category','title','subtitle','author','publisher','date','pages','coverStyle','abstract','toc','docId'],
  news: ['id','date','category','title','workId'],
  slides: ['id','tag','title','date','image','description'],
  profile: ['name','nameEn','description','themesHeading','themes','keywords','contactEmail','creativeUrl','jazzUrl','cafeUrl','pillar1Title','pillar1Description','pillar2Title','pillar2Description','pillar3Title','pillar3Description'],
};
function value(prop) {
  if (!prop) return '';
  if (prop.type === 'title' || prop.type === 'rich_text') return (prop[prop.type] || []).map(part => part.plain_text || '').join('');
  if (prop.type === 'select') return prop.select?.name || '';
  return '';
}
async function loadCMS(token) {
  const data = {works: [], news: [], slides: [], profile: []};
  let cursor;
  do {
    const response = await fetch('https://api.notion.com/v1/data_sources/' + SOURCE_ID + '/query', {
      method: 'POST',
      headers: {Authorization: 'Bearer ' + token, 'Notion-Version': '2025-09-03', 'Content-Type': 'application/json'},
      body: JSON.stringify({page_size: 100, ...(cursor ? {start_cursor: cursor} : {})}),
    });
    if (!response.ok) throw new Error('Notion API error: ' + response.status);
    const body = await response.json();
    for (const page of body.results || []) {
      if (page.archived || page.in_trash) continue;
      const props = page.properties || {};
      const section = value(props.section);
      if (!Object.hasOwn(fields, section)) continue;
      const item = {};
      for (const key of fields[section]) item[key] = value(props[key]);
      if (section !== 'profile' && !item.id) item.id = page.id;
      if (section === 'works') item.toc = item.toc.split(/\r?\n/).filter(Boolean);
      data[section].push(item);
    }
    cursor = body.has_more ? body.next_cursor : null;
    if (body.has_more && !cursor) throw new Error('Missing Notion pagination cursor');
  } while (cursor);
  for (const section of ['works','news','slides']) data[section].sort((a,b) => a.id.localeCompare(b.id, 'en', {numeric:true}));
  data.updatedAt = new Date().toISOString();
  return data;
}

const PAPER_SOURCE_ID = '3fa51522-3974-80bd-bbbd-000b4bd5eea2';
const PAPER_TYPE = '論文';
const PAPER_PUBLIC_FIELD = '公開可';

// Public API: only records explicitly classified as 論文 AND opted in with 公開可.
// Unchecked, missing, archived, and trashed records must never appear in the response.
async function loadPapers(token) {
  const works = [];
  let cursor = null;
  const visited = new Set();
  do {
    const response = await fetch('https://api.notion.com/v1/data_sources/' + PAPER_SOURCE_ID + '/query', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        filter: {
          and: [
            {property: '書籍種別', select: {equals: PAPER_TYPE}},
            {property: PAPER_PUBLIC_FIELD, checkbox: {equals: true}},
          ],
        },
        ...(cursor ? {start_cursor: cursor} : {}),
      }),
    });
    if (!response.ok) {
      const error = new Error('Notion papers API error: ' + response.status);
      error.status = response.status;
      throw error;
    }
    const body = await response.json();
    for (const page of body.results || []) {
      if (page.archived || page.in_trash) continue;
      const props = page.properties || {};
      if (value(props['書籍種別']) !== PAPER_TYPE) continue;
      if (props[PAPER_PUBLIC_FIELD]?.type !== 'checkbox' || props[PAPER_PUBLIC_FIELD].checkbox !== true) continue;
      const title = value(props['論文タイトル']).trim();
      if (!title) continue;
      const publicAbstract = value(props['公開要旨']).trim();
      const author = value(props['著者']).trim() || '安藤 和樹';
      const publicationDate = props['公開日']?.date?.start ||
        props['最終更新日']?.date?.start || (page.last_edited_time || '').slice(0, 10);
      const notionId = value(props['論文ID']).trim();
      const maturity = value(props['研究成熟度']).trim();
      const researchSeries = value(props['研究系列']).trim();
      const seriesRole = value(props['系列内位置']).trim();
      const legalInformatics = props['法情報学研究']?.type === 'checkbox' && props['法情報学研究'].checkbox === true;
      const legalInformaticsCategory = legalInformatics ? value(props['法情報学研究区分']).trim() : '';
      const status = value(props['状態']).trim();
      const field = value(props['主学問分野']).trim();
      const subfield = value(props['分野']).trim();
      const specialties = (props['専門領域']?.type === 'multi_select'
        ? props['専門領域'].multi_select || []
        : []).map(option => option.name).filter(Boolean);
      works.push({
        id: page.id,
        paperId: notionId,
        type: PAPER_TYPE,
        category: 'article',
        title,
        subtitle: value(props['サブタイトル']).trim(),
        publicAbstract,
        author,
        publicationDate,
        maturity,
        researchSeries,
        seriesRole,
        legalInformatics,
        legalInformaticsCategory,
        status,
        field,
        subfield,
        specialties,
        updatedAt: page.last_edited_time || '',
        url: page.url || '',
      });
    }
    cursor = body.has_more ? body.next_cursor : null;
    if (cursor) {
      if (visited.has(cursor)) throw new Error('Repeated Notion papers pagination cursor');
      visited.add(cursor);
    } else if (body.has_more) {
      throw new Error('Missing Notion papers pagination cursor');
    }
  } while (cursor);
  works.sort((a, b) => {
    if (a.paperId && b.paperId) return a.paperId.localeCompare(b.paperId, 'ja', {numeric: true});
    if (a.paperId) return -1;
    if (b.paperId) return 1;
    return a.title.localeCompare(b.title, 'ja');
  });
  return {works, source: 'notion-paper-repository', updatedAt: new Date().toISOString()};
}

// Research programme: read one fixed Notion page. The token stays on the Worker;
// the public endpoint never accepts an arbitrary Notion page identifier.
const RESEARCH_PROGRAM_PAGE_ID = '41d51522-3974-810b-897c-f2049d1a035d';
const NOTION_API_VERSION = '2025-09-03';

async function notionProgrammeGet(token, path) {
  const response = await fetch('https://api.notion.com/v1' + path, {
    headers: {
      Authorization: 'Bearer ' + token,
      'Notion-Version': NOTION_API_VERSION,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const error = new Error('Notion research programme request failed: ' + response.status);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

function programmeRichText(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map(part => ({
    text: String(part.plain_text || part.text?.content || part.equation?.expression || '').slice(0, 12000),
    href: typeof part.href === 'string' ? part.href : '',
    bold: part.annotations?.bold === true,
    italic: part.annotations?.italic === true,
    code: part.annotations?.code === true,
    underline: part.annotations?.underline === true,
    strikethrough: part.annotations?.strikethrough === true,
  }));
}

const PROGRAMME_BLOCK_TYPES = new Set([
  'paragraph', 'heading_1', 'heading_2', 'heading_3',
  'bulleted_list_item', 'numbered_list_item', 'quote',
  'table', 'table_row', 'equation', 'code', 'to_do',
  'divider', 'child_page', 'bookmark', 'callout',
]);

async function programmeChildren(token, parentId, depth, limits) {
  if (depth > 4) throw new Error('Research programme nesting limit exceeded');
  const items = [];
  let cursor = null;
  let pageCount = 0;
  do {
    if (++limits.requests > 45) throw new Error('Research programme request limit exceeded');
    const params = new URLSearchParams({page_size: '100'});
    if (cursor) params.set('start_cursor', cursor);
    const response = await notionProgrammeGet(token, '/blocks/' + parentId + '/children?' + params);
    for (const block of response.results || []) {
      if (block.archived || block.in_trash) continue;
      if (++limits.blocks > 500) throw new Error('Research programme block limit exceeded');
      if (!PROGRAMME_BLOCK_TYPES.has(block.type)) continue;
      const kind = block.type;
      const data = block[kind] || {};
      const item = {type: kind};
      if (Array.isArray(data.rich_text)) item.richText = programmeRichText(data.rich_text);
      if (kind === 'table') item.hasColumnHeader = data.has_column_header === true;
      if (kind === 'table_row') item.cells = (data.cells || []).map(programmeRichText);
      if (kind === 'equation') item.expression = String(data.expression || '');
      if (kind === 'code') item.language = String(data.language || '');
      if (kind === 'to_do') item.checked = data.checked === true;
      if (kind === 'child_page') {
        item.title = String(data.title || '');
        item.url = 'https://www.notion.so/' + block.id.replace(/-/g, '');
      }
      if (kind === 'bookmark') item.url = String(data.url || '');
      // A child page has its own publication policy; show only its link, not its contents.
      if (block.has_children && kind !== 'child_page' && depth < 4) {
        item.children = await programmeChildren(token, block.id, depth + 1, limits);
      }
      items.push(item);
    }
    cursor = response.has_more ? response.next_cursor : null;
    if (response.has_more && !cursor) throw new Error('Research programme cursor missing');
    if (++pageCount > 10) throw new Error('Research programme pagination limit exceeded');
  } while (cursor);
  return items;
}

async function loadResearchProgramme(token) {
  const page = await notionProgrammeGet(token, '/pages/' + RESEARCH_PROGRAM_PAGE_ID);
  if (page.archived || page.in_trash) throw new Error('Research programme is unavailable');
  const heading = page.properties?.title?.title || [];
  const title = heading.map(part => part.plain_text || '').join('') ||
    '法情報学・計算法制度科学 ― 統合研究プログラム';
  const blocks = await programmeChildren(token, RESEARCH_PROGRAM_PAGE_ID, 0,
    {requests: 0, blocks: 0});
  return {
    title,
    blocks,
    updatedAt: page.last_edited_time || '',
    source: 'notion-research-programme',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!['/api/cms', '/api/papers', '/api/research-program'].includes(url.pathname)) return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{Allow:'GET'}});
    if (!env.NOTION_TOKEN) return new Response('Notion CMS is not configured', {status:503});
    if (url.pathname === '/api/research-program') {
      const cache = caches.default;
      const cacheKey = new Request(url.origin + '/api/research-program');
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      try {
        const response = Response.json(await loadResearchProgramme(env.NOTION_TOKEN), {
          headers: {'Cache-Control': 'public, max-age=60, s-maxage=180'},
        });
        if (ctx?.waitUntil) ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      } catch (error) {
        console.error('Research programme unavailable', error.message);
        return new Response('Research programme unavailable', {
          status: 502, headers: {'Cache-Control': 'no-store'},
        });
      }
    }
    if (url.pathname === '/api/papers') {
      try {
        return Response.json(await loadPapers(env.NOTION_TOKEN), {
          headers: {'Cache-Control': 'public, max-age=60, s-maxage=120'},
        });
      } catch (error) {
        console.error('Papers unavailable', error.message);
        return new Response('Papers unavailable', {status:502, headers:{'Cache-Control':'no-store'}});
      }
    }
    try {
      return Response.json(await loadCMS(env.NOTION_TOKEN), {headers:{'Cache-Control':'public, max-age=60'}});
    } catch (error) {
      console.error('CMS unavailable', error.message);
      return new Response('CMS unavailable', {status:502});
    }
  },
};
