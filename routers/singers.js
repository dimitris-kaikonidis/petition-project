const { getSignatures, getSignaturesByCity } = require("../utilities/db");
const { requireSignature } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

router.get("/signers", requireSignature, (req, res) => {
    const { id } = req.session.user;
    getSignatures()
        .then(result => res.render("signers", { css: "signers.css", id, signers: result.rows }))
        .catch(error => res.redirect("/thanks"));
});

router.get("/signers/:city", requireSignature, (req, res) => {
    const { id } = req.session.user;
    getSignaturesByCity(req.params.city)
        .then(result => res.render("signers", { css: "signers.css", id, signers: result.rows }))
        .catch(error => res.redirect("/thanks"));
});

module.exports = router;