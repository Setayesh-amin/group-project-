const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");

const router = express.Router();

//GET Register Form
router.get("/register", (req, res) => {
    res.render("auth/register", {
        errors: [],
        formUser: {}
    });
});


//POST Register
router.post(
"/register",

[
    body("name")
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .isLength({min:6})
        .withMessage("Password must be at least 6 characters"),

    body("confirmPassword")
        .custom((value,{req})=>{
            if(value !== req.body.password){
                throw new Error("Passwords do not match");
            }

            return true;
        })
],

async(req,res)=>{

const errors = validationResult(req);

if(!errors.isEmpty()){
    return res.render("auth/register",{
        errors: errors.array(),
        formUser:req.body
    });
}

const existingUser = await User.findOne({
    email:req.body.email
});

if(existingUser){
    return res.render("auth/register",{
        errors:[
            {
                msg:"Email is already registered"
            }
        ],
        formUser:req.body
    });
}

const hashedPassword = await bcrypt.hash(
    req.body.password,
    10
);

const user = new User({
    name:req.body.name,
    email:req.body.email,
    password:hashedPassword
});

await user.save();

res.redirect("/login");

});


//GET Login Form
router.get("/login", (req, res) => {
    res.render("auth/login", {
        errors: []
    });
});


//POST Login
router.post(
    "/login",
    [
        body("email")
            .isEmail()
            .withMessage("Enter a valid email"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.render("auth/login", {
                errors: errors.array()
            });
        }

        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.render("auth/login", {
                errors: [{ msg: "Invalid email or password." }]
            });
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPassword) {
            return res.render("auth/login", {
                errors: [{ msg: "Invalid email or password." }]
            });
        }

        // Save user in session
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        req.session.save(() => {
            console.log("SESSION SAVED:", req.session.user);
            res.redirect("/movies");
        });
    }
);


//GET Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
});

module.exports = router;