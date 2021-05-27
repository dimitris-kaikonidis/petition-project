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

module.exports.getUserSignature = (id) => db.query(`SELECT signature FROM signatures WHERE user_id=$1`, [id]);

module.exports.getSignatures = () => {
    return db.query(
        `
        SELECT first, last, age, city, url FROM users 
        RIGHT JOIN signatures ON signatures.user_id=users.id
        LEFT JOIN user_profiles ON user_profiles.user_id=users.id;
        `
    );
};

module.exports.getCount = () => db.query(`SELECT COUNT(id) FROM signatures;`);

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

module.exports.findUser = (email) => {
    return db.query(
        `
        SELECT users.id, first, last, email, password_hash, signatures.id AS signature_id FROM users 
        LEFT JOIN signatures ON signatures.user_id=users.id WHERE email=$1;
        `, [email]);
};

module.exports.addUserInfo = (age, city, url, id) => {
    return db.query(
        `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4);
        `, [age, city, url, id]
    );
};

module.exports.getUserInfo = (id) => db.query(`SELECT * FROM user_profiles WHERE user_id=$1`, [id]);