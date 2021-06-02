const { getSignatures, getSignaturesByCity } = require("../utilities/db");
const redis = require("../utilities/redis");
const { requireSignature } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

const expires = (60 * 60 * 24).toString();

router.get("/signers", requireSignature, (req, res) => {
    const { id } = req.session.user;
    redis.EXISTS("users").then(result => {
        if (result) {
            redis.GET("users")
                .then(result => res.render("signers", { css: "signers.css", id, signers: JSON.parse(result) }))
                .catch(error => res.redirect("/thanks"));
        } else {
            getSignatures()
                .then(result => {
                    redis.SETEX("users", expires, JSON.stringify(result.rows));
                    res.render("signers", { css: "signers.css", id, signers: result.rows });
                })
                .catch(error => res.redirect("/thanks"));
        }
    });
});

router.get("/signers/:city", requireSignature, (req, res) => {
    const { id } = req.session.user;
    redis.EXISTS(req.params.city).then(result => {
        if (result) {
            redis.GET(req.params.city)
                .then(result => res.render("signers", { css: "signers.css", id, signers: JSON.parse(result) }))
                .catch(error => res.redirect("/thanks"));
        } else {
            getSignaturesByCity(req.params.city)
                .then(result => {
                    redis.SETEX("users", expires, JSON.stringify(result.rows));
                    res.render("signers", { css: "signers.css", id, signers: result.rows });
                })
                .catch(error => res.redirect("/thanks"));
        }
    });
});

module.exports = router;