const chalk = require("chalk");
const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const sessionSecret = process.env.SESSION_SECRET || require('./secrets.json').SESSION_SECRET;

//Routers
const register = require("./routers/register");
const profile = require("./routers/profile");
const login = require("./routers/login");
const petition = require("./routers/petition");
const thanks = require("./routers/thanks");
const signers = require("./routers/signers");
const editProfile = require("./routers/editProfile");
const logout = require("./routers/logout");

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
        res.redirect("/petition");
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
app.get("/", (req, res) => res.redirect("/login"));

app.use(register);
app.use(profile);
app.use(login);
app.use(petition);
app.use(thanks);
app.use(signers);
app.use(editProfile);
app.use(logout);

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));
}

module.exports = app;