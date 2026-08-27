
// B"H
module.exports = {
    encode(key) {
        if (Buffer.isBuffer(key)) return key;
        return Buffer.from(typeof key === 'string' ? key : String(key), 'utf8');
    },
    decode(buf) {
        if (!Buffer.isBuffer(buf)) return buf;
        return buf.toString('utf8');
    }
};
