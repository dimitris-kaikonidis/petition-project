const { addUserInfo } = require("../utilities/db");
const { firstLetterCap } = require("../utilities/firstLetterCap");
const redis = require("../utilities/redis");
const express = require("express");
const router = express.Router();


router.get("/profile", (req, res) => {
    if (req.session.newUser) {
        req.session.newUser = false;
        res.render("profile");
    }
    else res.redirect("edit-profile");
});
router.post("/profile", (req, res) => {
    const { city, url } = req.body || null;
    let { age } = req.body;
    typeof age === "number" ? age : age = null;
    const { id } = req.session.user;
    redis.DEL(city);
    addUserInfo(age, firstLetterCap(city), url, id)
        .then(() => res.redirect("/petition"))
        .catch(error => {
            console.log("Something went wrong.", error);
            res.redirect("/petition");
        });
});

module.exports = router;