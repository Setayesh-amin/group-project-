const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

const movieRoutes = require("./routes/movies");
const authRoutes = require("./routes/auth");
const Movie = require("./models/Movie"); 
const defaultMovies = require("./data/defaultMovies");

const app = express();


mongoose.connect("mongodb://127.0.0.1/movieDB")
    .then(async () => {
        // Add only missing starter movies, so restarting never creates duplicates.
        await Promise.all(defaultMovies.map(({ name, ...movie }) =>
            Movie.updateOne({ name }, { $set: { name, ...movie } }, { upsert: true })
        ));
        console.log("MongoDB connected and starter movies are ready");
    })
    .catch((err) => console.error("MongoDB connection error:", err));

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

      const movieCount = await Movie.countDocuments();

      res.render("index", {
        title: "Home",
        movies,
        movieCount
      });

  } catch (err) {
    console.error(err);
    res.send("Database Error");
  }
});


app.use("/movies", movieRoutes);

app.get("/browse-movies", (req, res) => {
    res.redirect(301, "/movies");
});

app.use("/", authRoutes);


app.listen(3000, () => {
    console.log("Server running on port 3000");
});
