const express = require("express");
const { body, validationResult } = require("express-validator");

const Movie = require("../models/Movie");
const isAuthenticated = require("../middleware/auth");
const isOwner = require("../middleware/owner");

const router = express.Router();


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

    res.render("movies/list", {
        movies,
        total: movies.length,
        filters: {
            q,
            genre,
            sort
        }
    });
});



//GET Add Movie Form
router.get("/add", isAuthenticated, (req, res) => {
    res.render("movies/add", {
        errors: [],
        movie: {}
    });
});



// POST Add Movie
router.post(
    "/add",
    isAuthenticated,

    [
        body("name")
            .notEmpty()
            .withMessage("Movie name is required"),

        body("description")
            .notEmpty()
            .withMessage("Description is required"),

        body("year")
            .isInt()
            .withMessage("Enter a valid year"),

        body("genres")
            .notEmpty()
            .withMessage("Genre is required"),

        body("rating")
            .isFloat({ min: 0, max: 10 })
            .withMessage("Rating must be between 0 and 10")
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("movies/add", {
                errors: errors.array(),
                movie: req.body
            });
        }

        const movie = new Movie({
            name: req.body.name,
            description: req.body.description,
            year: req.body.year,
            genres: req.body.genres,
            rating: req.body.rating,
            owner: req.session.user._id

        });

        await movie.save();

        res.redirect("/movies");
    }
);



//GET Movie Details
router.get("/:id", async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return res.status(404).send("Movie not found");
    }

    res.render("movies/details", {
        movie
    });
});



//GET Edit Form
router.get("/:id/edit", isAuthenticated, isOwner, async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    res.render("movies/edit", {
        movie,
        errors: []
    });
});



//POST Edit Movie
router.post(
    "/:id/edit",
    isAuthenticated,
    isOwner,

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
                description: req.body.description,
                year: req.body.year,
                genres: req.body.genres,
                rating: req.body.rating

            }
        );

        res.redirect("/movies/" + req.params.id);
    }
);



// DELETE Movie
router.delete(
    "/:id",
    isAuthenticated,
    isOwner,

    async (req, res) => {
        await Movie.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    }

);

module.exports = router;