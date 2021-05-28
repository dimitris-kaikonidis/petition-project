const bcrypt = require("bcryptjs");

module.exports.genHash = password => bcrypt.genSalt().then(salt => bcrypt.hash(password, salt));

module.exports.compare = bcrypt.compare;