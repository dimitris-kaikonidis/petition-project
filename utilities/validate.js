module.exports.validateForm = (req, res, next) => {
    const inputs = Object.keys(req.body);
    let ok = true;
    inputs.forEach(input => {
        if (!req.body[input]) {
            ok = false;
            return;
        }
    });
    if (ok) next();
    else res.redirect(req.url);
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.user.signature_id) res.redirect("/petition");
    else next();
};
