const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const secrets = require("./secrets.json");
const csurf = require("csurf");
const { getSignatures, addSignatures, getCount, getUserSignature, addUser, findUser } = require("./utilities/db");
const { genHas, compare } = require("./utilities/bcrypt");
const validate = require("./utilities/validate");

const app = express();

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(cookieSession({
    secret: secrets.session,
    maxAge: 1000 * 60 * 60 * 24 * 30
}));

app.use(express.urlencoded({ extended: true }));
app.use(csurf());

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
});
app.use(express.static(__dirname + '/public/'));

app.get("/", (req, res) => req.session.loggedIn ? res.redirect("petition") : res.redirect("login"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", (req, res) => {
    const { first, last, email, password } = req.body;
    if (!first || !last || !email || !password) {
        res.render("register", {
            error: "Input field required."
        });
    } else {
        genHas(password)
            .then(hashedPassword => {
                addUser(first, last, email, hashedPassword)
                    .then(result => {
                        req.session.user = result.rows[0];
                        res.redirect("/login");
                    })
                    .catch(error => {
                        console.log(error);
                        res.redirect("/register");
                    });
            })
            .catch(error => {
                console.log(error);
                res.redirect("/redirect");
            });
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    findUser(email)
        .then(result => {
            compare(password, result.rows[0].password_hash)
                .then(() => {
                    req.session.loggedIn = true;
                    const { id, first, last } = result.rows[0];
                    req.session.user = { id, first, last };
                    res.redirect("/petition");
                })
                .catch((error) => res.redirect("login"));
        })
        .catch((error) => res.redirect("login"));
});

app.get("/petition", (req, res) => {
    const { first, last } = req.session.user;
    req.session.signed ? res.redirect("/thanks") : res.render("petition", { first, last });
});
app.post("/petition", (req, res) => {
    const { signature } = req.body;
    addSignatures(signature)
        .then((results) => {
            req.session.signed = true;
            req.session.signatureId = results.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(error => {
            console.log(error);
            res.session = null;
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        Promise.all([getCount(), getUserSignature(req.session.signatureId)])
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