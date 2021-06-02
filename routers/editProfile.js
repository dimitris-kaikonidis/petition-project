const { genHash } = require("bcryptjs");
const { getUserInfo, updateUserCreds, updateUserPass, updateUserInfo } = require("../utilities/db");
const redis = require("../utilities/redis");
const express = require("express");
const router = express.Router();

router.get("/edit-profile", (req, res) => {
    const { id } = req.session.user;
    getUserInfo(id)
        .then(result => {
            const { first, last, email, age, city, url } = result.rows[0];
            req.session.city = city;
            res.render("edit_profile", { css: "edit_profile.css", id, first, last, email, age, city, url });
        })
        .catch(err => {
            console.log(err);
            res.render("edit_profile", { css: "edit_profile.css" });
        });
});
router.post("/edit-profile", (req, res) => {
    const { id, signature_id } = req.session.user;
    const { first, last, email, password, age, city, url } = req.body || null;
    if (req.session.city != city) {
        redis.DEL(req.session.city);
        redis.DEL(city);
    }
    let updateUserCredsPromise;
    if (first && last && email) {
        updateUserCredsPromise = updateUserCreds(id, first, last, email);
    }
    let updateUserPassPromise;
    if (password) {
        updateUserPassPromise = genHash(password).then(hashedPassword => updateUserPass(id, hashedPassword));
    }

    Promise.all([updateUserCredsPromise, updateUserPassPromise, updateUserInfo(id, age, city, url)])
        .then(() => {
            req.session.user = { id, first, last, email, signature_id };
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("Couldn't update profile", err);
            res.redirect("/edit-profile");
        });
});

module.exports = router;