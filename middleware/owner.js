const Movie=require("../models/Movie");

async function isOwner(req,res,next){
    const movie=await Movie.findById(req.params.id);

    if(movie.owner.equals(req.session.user._id)){
        return next();
    }

    res.status(403).send("Unauthorized");
}

module.exports=isOwner;