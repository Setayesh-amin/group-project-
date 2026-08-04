const express = require("express");
const { body, validationResult } = require("express-validator");

const Movie = require("../models/Movie");
const isAuthenticated = require("../middleware/auth");
const isOwner = require("../middleware/owner");

const router = express.Router();

const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime/Mystery",
    "Drama",
    "Family",
    "Fantasy",
    "Historical",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Thriller"
];


// Rolando's part: Browse movies
//GET All Movies
router.get("/", async (req, res) => {
    const q = req.query.q || "";
    const genre = req.query.genre || "";
    const sort = req.query.sort || "featured";

    let query = {};

    //Search by movie name or description
    if (q) {
        query = {
            $or: [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        };
    }

    //Filter by genre
    if (genre) {
        query.genres = genre;
    }

    let moviesQuery = Movie.find(query);

    //Sorting
    if (sort === "rating") {
        moviesQuery = moviesQuery.sort({ rating: -1 });
    }

    else if (sort === "newest") {
        moviesQuery = moviesQuery.sort({ _id: -1 });
    }

    else if (sort === "title") {
        moviesQuery = moviesQuery.sort({ name: 1 });
    }

    const movies = await moviesQuery;

    res.render("movies/collection", {
        title: "Browse Movies",
        movies,
        total: movies.length,
        filters: {
            q,
            genre,
            sort
        }
    });
});



// Setayesh's part: Add movies
//GET Add Movie Form
router.get("/add", isAuthenticated, (req, res) => {
    res.render("movies/add", {
        errors: [],
        movie: {},
        genres
    });
});


// Setayesh's part: My Movies
// GET Movies Added By The Current User
router.get("/my", isAuthenticated, async (req, res, next) => {
    try {
        const movies = await Movie.find({ owner: req.session.user._id })
            .sort({ _id: -1 });

        res.render("movies/collection", {
            title: "My Movies",
            movies,
            total: movies.length,
            filters: { q: "", genre: "", sort: "newest" },
            isMyMovies: true
        });
    } catch (err) {
        next(err);
    }
});


//POST Add Movie
router.post(
    "/add",
    isAuthenticated,

    // Rolando's part: Form validation
    [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Movie name is required"),

        body("poster")
            .trim()
            .notEmpty()
            .withMessage("Poster URL is required"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required"),

        body("year")
            .notEmpty()
            .withMessage("Release year is required")
            .bail()
            .isInt()
            .withMessage("Enter a valid year"),

        body("genres")
            .custom((value) => {
                const selectedGenres = Array.isArray(value) ? value : [value];
                return selectedGenres.some(Boolean);
            })
            .withMessage("Select at least one genre"),

        body("rating")
            .notEmpty()
            .withMessage("Rating is required")
            .bail()
            .isFloat({ min: 0, max: 10 })
            .withMessage("Rating must be between 0 and 10")
    ],

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("movies/add", {
                errors: errors.array(),
                movie: req.body,
                genres
            });
        }

        try {
            const movie = new Movie({
                name: req.body.name,
                poster: req.body.poster,
                description: req.body.description,
                year: req.body.year,
                genres: Array.isArray(req.body.genres)
                    ? req.body.genres
                    : [req.body.genres],
                rating: req.body.rating,
                owner: req.session.user._id
            });

            await movie.save();
            res.redirect("/movies/my");
        } catch (err) {
            next(err);
        }
    }
);



//GET Movie Details
router.get("/:id", async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return res.status(404).send("Movie not found");
    }

    res.render("movies/details", {
        title: movie.name,
        movie,
        sessionUser: req.session.user
    });
});



// Setayesh's part: Edit movies
//GET Edit Form
router.get("/:id/edit", isAuthenticated, isOwner, async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    res.render("movies/edit", {
        movie,
        errors: [],
        genres
    });
});



//POST Edit Movie
router.post(
    "/:id/edit",
    isAuthenticated,
    isOwner,

    // Rolando's part: Form validation
    [
        body("name").notEmpty(),

        body("description").notEmpty(),

        body("year").isInt(),

        body("genres").notEmpty(),

        body("rating")
            .isFloat({ min: 0, max: 10 })
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("movies/edit", {
                movie: {
                    _id: req.params.id,
                    ...req.body
                },

                errors: errors.array()
            });
        }


        await Movie.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                poster: req.body.poster,
                description: req.body.description,
                year: req.body.year,
                genres: req.body.genres,
                rating: req.body.rating

            }
        );

        res.redirect("/movies/" + req.params.id);
    }
);



// Setayesh's part: Delete movies
//DELETE Movie
router.delete(
    "/:id",
    isAuthenticated,
    isOwner,

    async (req, res) => {
        await Movie.findByIdAndDelete(req.params.id);
        res.redirect(303, "/movies");
    }

);

module.exports = router;
