// B"H
const crypto = require("crypto");
function hashKey(key, size) {
    const hash = crypto.createHash('md5').update(key).digest();
    return hash.readUInt32BE(0) % size;
}
module.exports = { hashKey };