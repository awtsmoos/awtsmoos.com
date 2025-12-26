
// B"H
/**
 * @file keyEncoding.js
 * @description Standardizes the transformation of keys into searchable binary vessels.
 */

module.exports = {
    encode(key) {
        if (Buffer.isBuffer(key)) return key;
        const str = typeof key === 'string' ? key : String(key);
        return Buffer.from(str, 'utf8');
    },
    decode(buf) {
        if (!Buffer.isBuffer(buf)) return buf;
        return buf.toString('utf8');
    }
};
