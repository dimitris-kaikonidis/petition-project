DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) UNIQUE,
    signature VARCHAR NOT NULL CHECK (signature != '')
);