
// B"H
const constants = require("../../../constants.js");

function localWriteVarInt(value) {
    const bytes = [];
    let v = Math.floor(value);
    while (v > 127) {
        bytes.push((v & 127) | 128);
        v >>>= 7;
    }
    bytes.push(v);
    return Buffer.from(bytes);
}

function serializeJSON(json) {
    const serializeValue = require("./value.js");
    const magicBuf = Buffer.from(constants.MAGIC_JSON);
    const keys = Object.keys(json);
    const parts = [magicBuf, localWriteVarInt(keys.length)];
    
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const keyBuf = Buffer.from(key, 'utf8');
        parts.push(localWriteVarInt(keyBuf.length));
        parts.push(keyBuf);
        parts.push(serializeValue(json[key], true));
    }
    return Buffer.concat(parts);
}

module.exports = { serializeJSON, localWriteVarInt };
