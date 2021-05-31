const { addSignatures } = require("../utilities/db");
const { validateForm } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

router.get("/petition", (req, res) => {
    const { id, first, last, signature_id } = req.session.user;
    signature_id ? res.redirect("/thanks") : res.render("petition", { css: "petition.css", id, first, last });
});
router.post("/petition", validateForm, (req, res) => {
    const { signature } = req.body;
    const { id } = req.session.user;
    addSignatures(id, signature)
        .then(result => {
            req.session.user.signature_id = result.rows[0];
            res.redirect("/thanks");
        })
        .catch(error => {
            console.log("Couldn't add signature.", error);
            res.redirect("/petition");
        });
});

module.exports = router;