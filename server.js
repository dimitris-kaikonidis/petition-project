const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const { getSignatures, addSignatures } = require("./db");

const app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) => res.redirect("petition"));

app.get("/petition", (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    console.log(req.body);
    addSignatures(req.body.first, req.body.last, req.body.signature)
        .then(result => {
            console.log(result.rows);
            res.send("OK");
        });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));