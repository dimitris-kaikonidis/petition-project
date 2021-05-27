const spicedPG = require('spiced-pg');

const db = spicedPG("postgres:dim107:postgres@localhost:5432/petition");

module.exports.addSignatures = (id, signature) => {
    return db.query(
        `
        INSERT INTO signatures (user_id, signature)
        VALUES ($1, $2)
        RETURNING id;
        `,
        [id, signature]
    );
};

module.exports.getCount = () => db.query(`SELECT COUNT(id) FROM signatures;`);

module.exports.getUserSignature = (id) => db.query(`SELECT signature FROM signatures WHERE user_id=$1`, [id]);

module.exports.addUser = (first, last, email, hashedPassword) => {
    return db.query(
        `
        INSERT INTO users (first, last, email, password_hash)
        VALUES ($1, $2, $3, $4)
        `,
        [first, last, email, hashedPassword]
    );
};

module.exports.findUser = (email) => {
    return db.query(
        `
        SELECT users.id, first, last, email, password_hash, signatures.id AS signature_id FROM users 
        LEFT JOIN signatures ON signatures.user_id=users.id WHERE email=$1;
        `, [email]);
};

module.exports.getSignatures = () => {
    return db.query(
        `
        SELECT first, last FROM users 
        RIGHT JOIN signatures ON signatures.user_id=users.id;
        `
    );
};