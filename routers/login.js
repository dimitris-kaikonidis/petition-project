const { compare } = require("../utilities/bcrypt");
const { findUser } = require("../utilities/db");
const { validateForm } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => res.render("login", { css: "login.css" }));
router.post("/login", validateForm, (req, res) => {
    const { email, password } = req.body;
    findUser(email)
        .then(result => {
            compare(password, result.rows[0].password_hash)
                .then(pass => {
                    if (!pass) throw "Wrong password.";
                    const { id, first, last, email, signature_id } = result.rows[0];
                    req.session.user = { id, first, last, email, signature_id };
                    res.redirect("/petition");

                })
                .catch((error) => {
                    console.log(error);
                    res.render("login", { css: "login.css", email, wrong: true });
                });
        })
        .catch((error) => {
            console.log("User not found.", error);
            res.render("login", { css: "login.css", email, wrong: true });
        });
});

module.exports = router;