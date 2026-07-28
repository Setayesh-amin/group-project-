const path = require('path');
const express = require('express');

const app = express();

const movies = [
  {
    name: 'The Grand Budapest Hotel',
    year: 2014,
    genres: ['Comedy', 'Drama'],
    rating: 8.1,
    description: 'A legendary concierge and his young protégé become wrapped up in a story of friendship, art, and adventure.',
    color: 'coral'
  },
  {
    name: 'Arrival',
    year: 2016,
    genres: ['Sci-Fi', 'Drama'],
    rating: 7.9,
    description: 'A linguist works to understand mysterious visitors and discovers that language can reshape how we see time.',
    color: 'green'
  },
  {
    name: 'Spirited Away',
    year: 2001,
    genres: ['Animation', 'Fantasy'],
    rating: 8.6,
    description: 'A young girl enters a magical world and must find the courage to save her family and return home.',
    color: 'gold'
  },
  {
    name: 'Moonlight',
    year: 2016,
    genres: ['Drama'],
    rating: 7.4,
    description: 'A tender portrait of identity, connection, and growing up, told across three defining chapters.',
    color: 'blue'
  },
  {
    name: 'Parasite',
    year: 2019,
    genres: ['Thriller', 'Drama'],
    rating: 8.5,
    description: 'Two families from opposite worlds become unexpectedly intertwined in a sharp and suspenseful story.',
    color: 'red'
  },
  {
    name: 'The Farewell',
    year: 2019,
    genres: ['Comedy', 'Drama'],
    rating: 7.5,
    description: 'A family gathers under the guise of a wedding to share love, laughter, and an unspoken goodbye.',
    color: 'purple'
  }
];

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/movies'));

app.get('/movies', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const genre = String(req.query.genre || '');
  const sort = String(req.query.sort || 'featured');

  let results = movies.filter((movie) => {
    const matchesQuery = !query ||
      movie.name.toLowerCase().includes(query) ||
      movie.description.toLowerCase().includes(query);
    const matchesGenre = !genre || movie.genres.includes(genre);
    return matchesQuery && matchesGenre;
  });

  if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  if (sort === 'newest') results.sort((a, b) => b.year - a.year);
  if (sort === 'title') results.sort((a, b) => a.name.localeCompare(b.name));

  res.render('movies/index', {
    title: 'Discover movies',
    movies: results,
    total: movies.length,
    filters: { q: req.query.q || '', genre, sort }
  });
});

app.use((req, res) => res.redirect('/movies'));

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`ReelVault is running at http://localhost:${port}`);
  });
}

module.exports = app;
