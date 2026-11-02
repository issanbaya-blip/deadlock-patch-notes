export async function onRequest({ request }) {
  const cache = caches.default;
  const key = new Request(new URL(request.url).origin + "/api/map-data");
  const cached = await cache.match(key);
  if (cached) return cached;
  try {
    const upstream = await fetch("https://api.deadlock-api.com/v1/assets/map");
    if (!upstream.ok) throw new Error("Map data unavailable");
    const map = await upstream.json();
    const payload = {
      updatedAt: new Date().toISOString(), radius: map.radius, images: map.images, objectives: map.objective_positions,
      ziplinePaths: map.zipline_paths, camps: map.neutral_camps,
      layers: map.entities
    };
    const response = Response.json(payload, { headers: { "Cache-Control": "public, max-age=3600" } });
    await cache.put(key, response.clone());
    return response;
  } catch {
    return Response.json({ error: "マップデータを取得できませんでした。時間をおいて再読み込みしてください。" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

