const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const secrets = require("./secrets.json");
const { getSignatures, addSignatures, getCount, getUsersSignature } = require("./db");

const app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(cookieSession({
    secret: secrets.session,
    maxAge: 1000 * 60 * 60 * 24 * 30
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) => res.redirect("petition"));

app.get("/petition", (req, res) => req.session.signed ? res.redirect("/thanks") : res.render("petition"));

app.post("/petition", (req, res) => {
    addSignatures(req.body.first, req.body.last, req.body.signature)
        .then((results) => {
            req.session.signed = true;
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thanks");
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        Promise.all([getCount(), getUsersSignature(req.session.signatureId)])
            .then(results => {
                const count = results[0].rows[0].count;
                const img = results[1].rows[0].signature;
                res.render("thanks", { count, img });
            });
    } else res.redirect("petition");
});

app.get("/signers", (req, res) => {
    if (req.session.signed) {
        getSignatures().then(result => res.render("signers", { signers: result.rows }));
    } else {
        res.redirect("petition");
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));