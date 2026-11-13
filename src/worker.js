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
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/cms') return env.ASSETS.fetch(request);
    if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{Allow:'GET'}});
    if (!env.NOTION_TOKEN) return new Response('Notion CMS is not configured', {status:503});
    try {
      return Response.json(await loadCMS(env.NOTION_TOKEN), {headers:{'Cache-Control':'public, max-age=60'}});
    } catch (error) {
      console.error('CMS unavailable', error.message);
      return new Response('CMS unavailable', {status:502});
    }
  },
};
