const spicedPG = require('spiced-pg');

const db = spicedPG("postgres:dim107:postgres@localhost:5432/petition");

module.exports.addSignatures = (signature) => {
    return db.query(
        `
        INSERT INTO signatures (signature)
        VALUES ($1)
        RETURNING id;
        `,
        [signature]
    );
};

module.exports.getSignatures = () => db.query(`SELECT * FROM signatures;`);

module.exports.getCount = () => db.query(`SELECT COUNT(id) FROM signatures;`);

module.exports.getUserSignature = (id) => db.query(`SELECT signature FROM signatures WHERE id=$1`, [id]);

module.exports.addUser = (first, last, email, hashedPassword) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first, last;
        `,
        [first, last, email, hashedPassword]
    );
};

module.exports.findUser = (email) => db.query(`SELECT id, first, last, email, password_hash FROM users WHERE email=$1`, [email]);