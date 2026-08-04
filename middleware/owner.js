// Setayesh's part: Movie ownership protection
const Movie=require("../models/Movie");

async function isOwner(req,res,next){
    try {
        const movie=await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).send("Movie not found");
        }

        if (movie.owner && movie.owner.equals(req.session.user._id)) {
            return next();
        }

        return res.status(403).send("Unauthorized");
    } catch (err) {
        return next(err);
    }
}

module.exports=isOwner;
