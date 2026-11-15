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

// This endpoint intentionally returns ONLY rows explicitly classified as 論文.
// Uncategorized entries, research notes and books are never inferred as papers.
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
        filter: {property: '書籍種別', select: {equals: PAPER_TYPE}},
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
      const title = value(props['論文タイトル']).trim();
      if (!title) continue;
      const notionId = value(props['論文ID']).trim();
      const maturity = value(props['研究成熟度']).trim();
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
        maturity,
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/cms' && url.pathname !== '/api/papers') return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{Allow:'GET'}});
    if (!env.NOTION_TOKEN) return new Response('Notion CMS is not configured', {status:503});
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
