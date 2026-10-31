export async function onRequest(context) {
  const url = "https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=1422450&count=10&maxlength=0";
  try {
    const upstream = await fetch(url, { headers: { Accept: "application/json" } });
    if (!upstream.ok) return Response.json({ error: "Steamニュースを取得できませんでした。" }, { status: 502 });
    const payload = await upstream.json();
    const posts = payload?.appnews?.newsitems ?? [];
    const latest = posts.find(post => /steam_community_announcements\//i.test(post.url ?? ""));
    if (!latest) return Response.json({ error: "公式パッチ情報が見つかりませんでした。" }, { status: 404 });
    return Response.json({
      title: latest.title,
      publishedAt: new Date(latest.date * 1000).toISOString(),
      url: latest.url,
      contents: latest.contents ?? ""
    }, { headers: { "Cache-Control": "public, max-age=120", "Access-Control-Allow-Origin": "*" } });
  } catch {
    return Response.json({ error: "公式ニュースへの接続に失敗しました。時間をおいて再度お試しください。" }, { status: 502 });
  }
}
