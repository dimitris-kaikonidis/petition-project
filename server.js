const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./utilities/db");
const { genHash, compare } = require("./utilities/bcrypt");
const { validateForm } = require("./utilities/validate");
const { firstLetterCap } = require("./utilities/firstLetterCap");
const sessionSecret = process.env.SESSION_SECRET || require('./secrets.json').SESSION_SECRET;

const app = express();

//Handlebars
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//Security
app.use(cookieSession({
    secret: sessionSecret,
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

app.get("/register", (req, res) => res.render("register", { css: "register.css" }));
app.post("/register", validateForm, (req, res) => {
    const { first, last, email, password } = req.body;
    genHash(password)
        .then(hashedPassword => {
            db.addUser(firstLetterCap(first), firstLetterCap(last), email, hashedPassword)
                .then(result => {
                    const { id, first, last } = result.rows[0];
                    req.session.user = { id, first, last };
                    res.render("profile", { css: "profile.css" });
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
    db.getUserInfo(id)
        .then(result => result.rows[0] ? res.redirect("/petition") : res.render("profile", { css: "profile.css", id }))
        .catch(error => {
            console.log("Couldn't retrieve user info.", error);
            res.redirect("/petition");
        });
});
app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;
    const { id } = req.session.user;
    db.addUserInfo(firstLetterCap(age), firstLetterCap(city), url, id)
        .then(() => res.redirect("/petition"))
        .catch(error => {
            console.log("Something went wrong.", error);
            res.redirect("/petition");
        });
});

app.get("/login", (req, res) => res.render("login", { css: "login.css" }));
app.post("/login", validateForm, (req, res) => {
    const { email, password } = req.body;
    db.findUser(email)
        .then(result => {
            compare(password, result.rows[0].password_hash)
                .then(pass => {
                    if (!pass) throw "Wrong password.";
                    const { id, first, last, email, signature_id } = result.rows[0];
                    req.session.user = { id, first, last, email, signature_id };
                    res.redirect("/petition");

                })
                .catch((error) => {
                    console.log(error);
                    res.render("login", { css: "login.css", email, wrong: true });
                });
        })
        .catch((error) => {
            console.log("User not found.", error);
            res.render("login", { css: "login.css", email, wrong: true });
        });
});

app.get("/petition", (req, res) => {
    const { id, first, last, signature_id } = req.session.user;
    signature_id ? res.redirect("/thanks") : res.render("petition", { css: "petition.css", id, first, last });
});
app.post("/petition", validateForm, (req, res) => {
    const { signature } = req.body;
    const { id } = req.session.user;
    db.addSignatures(id, signature)
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
    const { id } = req.session.user;
    if (req.session.user.signature_id) {
        Promise.all([db.getCount(), db.getUserSignature(req.session.user.id)])
            .then(results => {
                const count = results[0].rows[0].count;
                const img = results[1].rows[0].signature;
                res.render("thanks", { css: "thanks.css", id, count, img });
            })
            .catch(error => {
                console.log("Couldn't get signature.", error);
                res.redirect("/petition");
            });
    } else res.redirect("/petition");
});

app.get("/signers", (req, res) => {
    const { id } = req.session.user;
    if (req.session.user.signature_id) {
        db.getSignatures()
            .then(result => res.render("signers", { css: "signers.css", id, signers: result.rows }))
            .catch(error => res.redirect("/thanks"));
    } else {
        res.redirect("/petition");
    }
});

app.get("/signers/:city", (req, res) => {
    const { id } = req.session.user;
    if (req.session.user.signature_id) {
        console.log(req.params);
        db.getSignaturesByCity(req.params.city)
            .then(result => res.render("signers", { css: "signers.css", id, signers: result.rows }))
            .catch(error => res.redirect("/thanks"));
    } else {
        res.redirect("/petition");
    }
});

app.get("/edit-profile", (req, res) => {
    const { id } = req.session.user;
    db.getUserInfo(id)
        .then(result => {
            const { first, last, email, age, city, url } = result.rows[0];
            res.render("edit_profile", { css: "edit_profile.css", id, first, last, email, age, city, url });
        })
        .catch(err => {
            console.log(err);
            res.render("edit_profile", { css: "edit_profile.css" });
        });
});
app.post("/edit-profile", (req, res) => {
    const { id, signature_id } = req.session.user;
    const { first, last, email, password, age, city, url } = req.body || null;
    let updateUserCredsPromise;
    if (first && last && email) {
        updateUserCredsPromise = db.updateUserCreds(id, first, last, email);
    }
    let updateUserPassPromise;
    if (password) {
        updateUserPassPromise = genHash(password).then(hashedPassword => db.updateUserPass(id, hashedPassword));
    }

    Promise.all([updateUserCredsPromise, updateUserPassPromise, db.updateUserInfo(id, age, city, url)])
        .then(() => {
            req.session.user = { id, first, last, email, signature_id };
            res.redirect("/thanks");
        })
        .catch(err => {
            console.log("Couldn't update profile", err);
            res.redirect("/edit-profile");
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));