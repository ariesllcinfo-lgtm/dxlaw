const CMS_URL = "https://script.google.com/macros/s/AKfycbzDwPv-gE1G1CJtwnC46GeexJREP1OkOmaVmRP8TEjwTd7dPJdxMN-4vEAc0ucdC8t89A/exec";
export default { async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== "/api/cms") return env.ASSETS.fetch(request);
  try {
    const upstream = await fetch(CMS_URL, {redirect:"follow", headers: {Accept:"application/json"}});
    if (!upstream.ok) return new Response("CMS unavailable", {status:502});
    const data = await upstream.json();
    if (!data || !Array.isArray(data.works) || !Array.isArray(data.news) || !Array.isArray(data.slides)) throw new Error("Invalid CMS data");
    return Response.json(data, {headers:{"Cache-Control":"public, max-age=60"}});
  } catch { return new Response("CMS unavailable", {status:502}); }
}};