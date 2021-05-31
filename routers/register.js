const { genHash } = require("../utilities/bcrypt");
const { addUser } = require("../utilities/db");
const { firstLetterCap } = require("../utilities/firstLetterCap");
const { validateForm } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

router.get("/register", (req, res) => res.render("register", { css: "register.css" }));
router.post("/register", validateForm, (req, res) => {
    const { first, last, email, password } = req.body;
    genHash(password)
        .then(hashedPassword => {
            addUser(firstLetterCap(first), firstLetterCap(last), email, hashedPassword)
                .then(result => {
                    const { id, first, last } = result.rows[0];
                    req.session.user = { id, first, last };
                    req.session.newUser = true;
                    res.redirect("profile");
                })
                .catch(error => {
                    console.log("Registration failed.", error);
                    res.redirect("/register");
                });
        })
        .catch(error => {
            console.log("Password hashing failed.", error);
            res.redirect("/register");
        });
});

module.exports = router;