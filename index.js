import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();

app.use(cors());

const games = JSON.parse(fs.readFileSync("./games.json", "utf-8"));

app.get("/api/games", (req, res) => {
  const {
    genre,
    platform,
    tag,
    store,
    rating,
    search,
    page = "1",
    limit = "20",
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const start = (pageNum - 1) * limitNum;
  const end = start + limitNum;

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
  const totalPages = Math.ceil(total / limitNum);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.path}`;
  const params = new URLSearchParams(req.query);

  const prevPage =
    pageNum > 1
      ? (() => {
          params.set("page", pageNum - 1);
          return `${baseUrl}?${params.toString()}`;
        })()
      : null;

  const nextPage =
    pageNum < totalPages
      ? (() => {
          params.set("page", pageNum + 1);
          return `${baseUrl}?${params.toString()}`;
        })()
      : null;

  res.status(200).json({
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    previous: prevPage,
    next: nextPage,
    results: paginated,
  });
});

app.get("/api/games/:id", (req, res) => {
  const { id } = req.params;
  const game = games.find((g) => g.id === +id);
  if (game) {
    res.status(200).json(game);
  } else {
    res.status(404).json({ error: "Game not found" });
  }
});

app.get("/api/platforms", (_, res) => {
  const uniquePlatforms = [
    ...new Map(
      games.flatMap((g) =>
        g.platforms.map((p) => [
          p.platform.slug,
          { slug: p.platform.slug, name: p.platform.name },
        ])
      )
    ).values(),
  ];
  res.status(200).json({
    platforms: uniquePlatforms.sort((a, b) => a.name.localeCompare(b.name)),
  });
});

app.get("/api/genres", (_, res) => {
  const uniqueGenres = [
    ...new Map(
      games.flatMap((g) =>
        g.genres.map((g) => [g.slug, { slug: g.slug, name: g.name }])
      )
    ).values(),
  ];
  res.status(200).json({
    genres: uniqueGenres.sort((a, b) => a.name.localeCompare(b.name)),
  });
});

app.get("/api/stores", (_, res) => {
  res.status(200).json({
    store: [
      ...new Set(games.flatMap((g) => g.stores.map((s) => s.store.name))),
    ].sort(),
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
