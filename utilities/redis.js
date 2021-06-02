const promisify = require("util").promisify;
const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', err => console.log(err));

module.exports.GET = promisify(client.get).bind(client);
module.exports.SET = promisify(client.set).bind(client);
module.exports.SETEX = promisify(client.setex).bind(client);
module.exports.DEL = promisify(client.del).bind(client);
module.exports.EXISTS = promisify(client.exists).bind(client);