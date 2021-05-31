const { addUserInfo, getUserInfo } = require("../utilities/db");
const { firstLetterCap } = require("../utilities/firstLetterCap");
const express = require("express");
const router = express.Router();

router.get("/profile", (req, res) => {
    const { id } = req.session.user;
    getUserInfo(id)
        .then(result => res.render("profile", { css: "profile.css", id }))
        .catch(error => {
            console.log("Couldn't retrieve user info.", error);
            res.redirect("/petition");
        });
});
router.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const { id } = req.session.user;
    addUserInfo(firstLetterCap(age), firstLetterCap(city), url, id)
        .then(() => res.redirect("/petition"))
        .catch(error => {
            console.log("Something went wrong.", error);
            res.redirect("/petition");
        });
});

module.exports = router;