const API = "https://api.deadlock-api.com/v1";

export async function onRequest({ request }) {
  const url = new URL(request.url);
  const heroId = Number(url.searchParams.get("hero_id"));
  if (!Number.isInteger(heroId) || heroId < 1) return Response.json({ error: "ヒーローを指定してください。" }, { status: 400 });
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/api/hero-insights?hero_id=${heroId}&v=4`);
  const cached = url.searchParams.get("refresh") === "1" ? null : await cache.match(cacheKey);
  if (cached) return cached;
  const since = Math.floor(Date.now() / 1000) - 3 * 86400;
  const get = async path => {
    const response = await fetch(`${API}${path}`, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`データAPIが ${response.status} を返しました`);
    return response.json();
  };
  try {
    const [heroRows, counters, synergies, buildRows, itemResponse] = await Promise.all([
      get(`/analytics/hero-stats?min_unix_timestamp=${since}&game_mode=normal`),
      get(`/analytics/hero-counter-stats?min_unix_timestamp=${since}&game_mode=normal&min_matches=20`),
      get(`/analytics/hero-synergy-stats?min_unix_timestamp=${since}&game_mode=normal&min_matches=20`),
      get(`/analytics/hero-build-stats/${heroId}?min_unix_timestamp=${since}&game_mode=normal&min_matches=100`),
      fetch(new URL("/item-index.json", url.origin)).then(r => r.ok ? r.json() : [])
    ]);
    const relevantBuilds = [...buildRows].sort((a,b) => b.matches - a.matches).slice(0, 4);
    const builds = await Promise.all(relevantBuilds.map(async row => {
      const detail = await get(`/builds/${heroId}/${row.hero_build_id}`).catch(() => null);
      const b = detail?.hero_build;
      const byId = new Map(itemResponse.map(item => [item.id, item]));
      const groups = (b?.details?.mod_categories || []).map(group => ({
        name: group.name,
        items: (group.mods || []).map(mod => byId.get(mod.ability_id)).filter(Boolean)
      })).filter(group => group.items.length);
      return { id: row.hero_build_id, name: b?.name || `ビルド ${row.hero_build_id}`, description: b?.description || "", matches: row.matches, wins: row.wins, winRate: row.matches ? row.wins / row.matches : 0, published: b?.publish_timestamp || null, url: `https://deadlock-api.com/builds/${heroId}/${row.hero_build_id}`, groups };
    }));
    const result = {
      updatedAt: new Date().toISOString(),
      hero: (heroRows || []).find(row => row.hero_id === heroId) || null,
      heroStats: heroRows || [],
      counters: (counters || []).filter(row => row.hero_id === heroId),
      synergies: (synergies || []).filter(row => row.hero_id1 === heroId || row.hero_id2 === heroId),
      builds
    };
    const response = Response.json(result, { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (error) {
    return Response.json({ error: "戦績データを取得できませんでした。時間をおいて再度お試しください。" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

