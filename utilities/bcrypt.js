const bcrypt = require("bcryptjs");

module.exports.genHas = password => bcrypt.genSalt().then(salt => bcrypt.hash(password, salt));

module.exports.compare = bcrypt.compare;