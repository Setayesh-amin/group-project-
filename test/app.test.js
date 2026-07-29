const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const pug = require('pug');

test('browse page renders the movie collection', () => {
  const html = pug.renderFile(path.join(__dirname, '../views/movies/index.pug'), {
    title: 'Discover movies',
    total: 1,
    movies: [{
      name: 'Arrival',
      year: 2016,
      genres: ['Sci-Fi'],
      rating: 7.9,
      description: 'A story.',
      image: '/images/movies/arrival.jpg'
    }],
    filters: { q: '', genre: '', sort: 'featured' }
  });

  assert.match(html, /Browse the collection/);
  assert.match(html, /Arrival/);
  assert.match(html, /images\/movies\/arrival\.jpg/);
});
