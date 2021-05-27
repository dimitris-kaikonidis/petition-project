const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const secrets = require("./secrets.json");
const csurf = require("csurf");
const { getSignatures, addSignatures, getCount, addUser, findUser, getUserSignature, addUserInfo, getUserInfo } = require("./utilities/db");
const { genHas, compare } = require("./utilities/bcrypt");
const { validateForm } = require("./utilities/validate");
const { firstLetterCap } = require("./utilities/firstLetterCap");

const app = express();

//Handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//Security
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

//Valid Route Check
app.use((req, res, next) => {
    if ("user" in req.session && (req.url.startsWith("/login") || req.url.startsWith("/register"))) {
        res.redirect("/");
    } else {
        next();
    }
});
app.use((req, res, next) => {
    if (!("user" in req.session) && !(req.url.startsWith("/login") || req.url.startsWith("/register"))) {
        res.redirect("/login");
    } else {
        next();
    }
});

//Routes
app.get("/", (req, res) => res.redirect("petition"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", validateForm, (req, res) => {
    const { first, last, email, password } = req.body;
    genHas(password)
        .then(hashedPassword => {
            addUser(firstLetterCap(first), firstLetterCap(last), email, hashedPassword)
                .then(result => {
                    const { id, first, last } = result.rows[0];
                    req.session.user = { id, first, last };
                    res.redirect("/profile");
                })
                .catch(error => {
                    console.log("Registration failed.", error);
                    res.redirect("/register");
                });
        })
        .catch(error => {
            console.log("Password hashing failed.", error);
            res.redirect("/register");
        });
});

app.get("/profile", (req, res) => {
    const { id } = req.session.user;
    getUserInfo(id)
        .then(result => result.rows[0] ? res.redirect("/petition") : res.render("profile"))
        .catch(error => {
            console.log("Couldn't retrieve user info.", error);
            res.redirect("/petition");
        });
});
app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const { id } = req.session.user;
    addUserInfo(firstLetterCap(age), firstLetterCap(city), url, id)
        .then(() => res.redirect("/petition"))
        .catch(error => {
            console.log("Something went wrong.", error);
            res.redirect("/petition");
        });
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", validateForm, (req, res) => {
    const { email, password } = req.body;
    findUser(email)
        .then(result => {
            compare(password, result.rows[0].password_hash)
                .then(() => {
                    const { id, first, last, signature_id } = result.rows[0];
                    req.session.user = { id, first, last, signature_id };
                    res.redirect("/petition");
                })
                .catch((error) => {
                    console.log("Wrong password.", error);
                    res.redirect("/login");
                });
        })
        .catch((error) => {
            console.log("User not found.", error);
            res.redirect("/login");
        });
});

app.get("/petition", (req, res) => {
    const { first, last, signature_id } = req.session.user;
    signature_id ? res.redirect("/thanks") : res.render("petition", { first, last });
});
app.post("/petition", validateForm, (req, res) => {
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

app.get("/thanks", (req, res) => {
    if (req.session.user.signature_id) {
        Promise.all([getCount(), getUserSignature(req.session.user.id)])
            .then(results => {
                const count = results[0].rows[0].count;
                const img = results[1].rows[0].signature;
                res.render("thanks", { count, img });
            })
            .catch(error => {
                console.log("Couldn't get signature.", error);
                res.redirect("/petition");
            });
    } else res.redirect("/petition");
});

app.get("/signers", (req, res) => {
    if (req.session.user.signature_id) {
        getSignatures()
            .then(result => {
                res.render("signers", { signers: result.rows });
            });
    } else {
        res.redirect("petition");
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));