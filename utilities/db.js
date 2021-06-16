const { Pool } = require("pg");
const params = {
    user: "dim107",
    host: "localhost",
    database: "petition",
    password: "postgres",
    port: 5432
};
const connectionString = process.env.DATABASE_URL || params;

const db = new Pool({ connectionString });

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

module.exports.getSignaturesByCity = (city) => {
    return db.query(
        `
        SELECT first, last, age, city, url FROM users
        RIGHT JOIN signatures ON signatures.user_id=users.id
        LEFT JOIN user_profiles ON user_profiles.user_id=users.id 
        WHERE LOWER(city) = LOWER($1);
        `, [city]
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

module.exports.getUserInfo = (id) => {
    return db.query(
        `
        SELECT first, last, email, age, city, url FROM users
        LEFT JOIN user_profiles ON user_profiles.user_id=users.id WHERE users.id=$1
        `, [id]
    );
};

module.exports.updateUserCreds = (id, first, last, email) => {
    return db.query(
        `
        UPDATE users 
        SET first=$2, last=$3, email=$4
        WHERE id=$1
        `, [id, first, last, email]
    );
};

module.exports.updateUserPass = (id, hashedPassword) => db.query(`UPDATE users SET password_hash=$2 WHERE id=$1`, [id, hashedPassword]);

module.exports.updateUserInfo = (id, age, city, url) => {
    if (typeof age !== "number") age = null;
    db.query(
        `
        INSERT INTO user_profiles (user_id, age, city, url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT(user_id) DO
        UPDATE SET age=$2, city=$3, url=$4
        `, [id, age, city, url]
    );
};