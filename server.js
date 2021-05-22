const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");
const { getSignatures, addSignatures } = require("./db");

const app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) => res.redirect("petition"));

app.get("/petition", (req, res) => {
    if (req.cookies.signed) res.redirect("/thanks");
    else res.render("petition");
});

app.post("/petition", (req, res) => {
    addSignatures(req.body.first, req.body.last, req.body.signature)
        .then(() => res.redirect("/thanks"));
});

app.get("/thanks", (req, res) => {
    if (req.cookies.signed) res.render("thanks");
    else res.redirect("petition");
});

app.get("/signers", (req, res) =>
    getSignatures()
        .then(result => res.render("signers", { signers: result.rows }))
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));