import express from "express";


const app = express();

const API_KEY = "51267a93ae204ffc9592846eeb425bcc";

app.get("/games", async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=50&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();
    const filtredData = data.results.filter(
      (game) => game?.esrb_rating?.id === 1
    );
    while (filtredData.length < 50) {
        page++;
        const url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=50&page=${page}`;
        const response = await fetch(url);
        const data = await response.json();
        const newFiltredData = data.results.filter(
          (game) => game?.esrb_rating?.id === 1
        );
        filtredData.push(...newFiltredData);
    }
    res.json(filtredData);
});


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});