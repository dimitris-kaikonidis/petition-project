module.exports.firstLetterCap = str => {
    return str
        .split(" ")
        .map(str => str.charAt(0).toUpperCase() + str.toLowerCase().slice(1))
        .join(" ");
};
