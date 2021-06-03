const { getCount, getUserSignature } = require("../utilities/db");
const { requireSignature } = require("../utilities/validate");
const express = require("express");
const router = express.Router();

router.get("/thanks", requireSignature, (req, res) => {
    const { id } = req.session.user;
    Promise.all([getCount(), getUserSignature(req.session.user.id)])
        .then(results => {
            const count = results[0].rows[0].count;
            const img = results[1].rows[0].signature;
            res.render("thanks", { id, count, img });
        })
        .catch(error => {
            console.log("Couldn't get signature.", error);
            res.redirect("/petition");
        });
});

module.exports = router;