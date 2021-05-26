DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    CONSTRAINT user_id FOREIGN KEY(id) INTEGER NOT NULL REFERENCES users(id),
    signature VARCHAR NOT NULL CHECK (signature != '')
);