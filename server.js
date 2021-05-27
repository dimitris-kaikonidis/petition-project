const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const secrets = require("./secrets.json");
const csurf = require("csurf");
const { getSignatures, addSignatures, getCount, addUser, findUser } = require("./utilities/db");
const { genHas, compare } = require("./utilities/bcrypt");
const { validate } = require("./utilities/validate");

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

app.use((req, res, next) => {
    if ("user" in req.session && (req.url.startsWith("/login") || req.url.startsWith("/register"))) {
        console.log("You're already logged in.");
        res.redirect("/");
    } else {
        next();
    }
});

app.use((req, res, next) => {
    console.log(!("user" in req.session), req.session.user);
    if (!("user" in req.session) && !(req.url.startsWith("/login") || req.url.startsWith("/register"))) {
        console.log("you're not logged in");
        res.redirect("/login");
    } else {
        next();
    }
});

app.get("/", (req, res) => res.redirect("petition"));

app.get("/register", (req, res) => res.render("register"));
app.post("/register", validate, (req, res) => {
    const { first, last, email, password } = req.body;
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
});

app.get("/login", (req, res) => res.render("login"));
app.post("/login", validate, (req, res) => {
    console.log("logging in");
    const { email, password } = req.body;
    findUser(email)
        .then(result => {
            compare(password, result.rows[0].password_hash)
                .then(() => {
                    console.log("pass ok");
                    const { first, last, signature } = result.rows[0];
                    req.session.user = { first, last, signature };
                    console.log(req.session.user);
                    res.redirect("/petition");
                })
                .catch((error) => {
                    console.log(error);
                    res.redirect("/login");
                });
        })
        .catch((error) => {
            console.log(error);
            res.redirect("/login");
        });
});

app.get("/petition", (req, res) => {
    console.log(req.session);
    const { first, last, signature } = req.session.user;
    signature ? res.redirect("/thanks") : res.render("petition", { first, last });
});
app.post("/petition", validate, (req, res) => {
    const { signature } = req.body;
    const { id } = req.session.user;
    addSignatures(id, signature)
        .then(() => {
            req.session.signed = true;
            res.redirect("/thanks");
        })
        .catch(error => {
            console.log(error);
            req.session = null;
        });
});

app.get("/thanks", (req, res) => {
    getCount()
        .then(result => {
            const count = result.rows[0].count;
            const img = req.session.user.signature;
            res.render("thanks", { count, img });
        })
        .catch(error => console.log(error));
    // getUserSignature(req.session.user.id).then(result => {
    //     if (result) {
    //         Promise.all([getCount(), getUserSignature(req.session.user.id)])
    //             .then(results => {
    //                 const count = results[0].rows[0].count;
    //                 const img = results[1].rows[0].signature;
    //                 res.render("thanks", { count, img });
    //             });
    //     } else res.redirect("/petition");
    // });
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