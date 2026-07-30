const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");
const Movie = require("./models/Movie"); 

const app = express();


mongoose.connect("mongodb://127.0.0.1/movieDB");

app.get("/reset-session", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/register");
    });
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

app.use(methodOverride("_method"));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
}); 


// HOME PAGE
app.get("/", async (req, res) => {
  try {
    const movies = await Movie.find()
      .sort({ _id: -1 })   // Newest first
      .limit(6);           // Show only the 6 newest

      res.render("index", {
        title: "Home",
        movies,
        movieCount: movies.length
      });

  } catch (err) {
    console.error(err);
    res.send("Database Error");
  }
});


app.use("/movies", movieRoutes);

app.use("/", authRoutes);


app.listen(3000, () => {
    console.log("Server running on port 3000");
});

/*const movies = [
  {
    name: 'The Grand Budapest Hotel',
    year: 2014,
    genres: ['Comedy', 'Drama'],
    rating: 8.1,
    description: 'A legendary concierge and his young protégé become wrapped up in a story of friendship, art, and adventure.',
    image: '/images/movies/grand-budapest.jpg'
  },
  {
    name: 'Arrival',
    year: 2016,
    genres: ['Sci-Fi', 'Drama'],
    rating: 7.9,
    description: 'A linguist works to understand mysterious visitors and discovers that language can reshape how we see time.',
    image: '/images/movies/arrival.jpg'
  },
  {
    name: 'Spirited Away',
    year: 2001,
    genres: ['Animation', 'Fantasy'],
    rating: 8.6,
    description: 'A young girl enters a magical world and must find the courage to save her family and return home.',
    image: '/images/movies/spirited-away.jpg'
  },
  {
    name: 'Moonlight',
    year: 2016,
    genres: ['Drama'],
    rating: 7.4,
    description: 'A tender portrait of identity, connection, and growing up, told across three defining chapters.',
    image: '/images/movies/moonlight.jpg'
  },
  {
    name: 'Parasite',
    year: 2019,
    genres: ['Thriller', 'Drama'],
    rating: 8.5,
    description: 'Two families from opposite worlds become unexpectedly intertwined in a sharp and suspenseful story.',
    image: '/images/movies/parasite.jpg'
  },
  {
    name: 'The Farewell',
    year: 2019,
    genres: ['Comedy', 'Drama'],
    rating: 7.5,
    description: 'A family gathers under the guise of a wedding to share love, laughter, and an unspoken goodbye.',
    image: '/images/movies/the-farewell.jpg'
  }
];*/

