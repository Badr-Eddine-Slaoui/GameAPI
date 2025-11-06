self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("/api/games/")){
    event.respondWith(handleGamesRequest(url));
  }
});

async function handleGamesRequest(url) {
  const res = await fetch("/games.json");
  const games = await res.json();

  const genre = url.searchParams.get("genre");
  const platform = url.searchParams.get("platform");
  const tag = url.searchParams.get("tag");
  const store = url.searchParams.get("store");
  const rating = url.searchParams.get("rating");
  const search = url.searchParams.get("search");

  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const start = (page - 1) * limit;
  const end = start + limit;

  let filtered = games;
  if (genre)
    filtered = filtered.filter((g) =>
      g.genres.map((g) => g.slug).includes(genre.toLowerCase())
    );

  if (platform)
    filtered = filtered.filter((g) =>
      g.platforms.map((p) => p.platform.slug).includes(platform.toLowerCase())
    );

  if (tag)
    filtered = filtered.filter((g) =>
      g.tags.map((t) => t.slug).includes(tag.toLowerCase())
    );

  if (store)
    filtered = filtered.filter((g) =>
      g.stores.map((s) => s.store.slug).includes(store.toLowerCase())
    );

  if (rating) filtered = filtered.filter((g) => g.rating >= parseFloat(rating));

  if (search)
    filtered = filtered.filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );

  const paginated = filtered.slice(start, end);
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);

  const baseUrl = url.origin + url.pathname;
  const params = new URLSearchParams(url.searchParams);

  const prevPage =
    page > 1
      ? (() => {
          params.set("page", page - 1);
          return `${baseUrl}?${params.toString()}`;
        })()
      : null;

  const nextPage =
    page < totalPages
      ? (() => {
          params.set("page", page + 1);
          return `${baseUrl}?${params.toString()}`;
        })()
      : null;

  const response = {
    page,
    limit,
    total,
    totalPages,
    previous: prevPage,
    next: nextPage,
    results: paginated,
  };

  return new Response(JSON.stringify(response, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
