//B"H
var awtsmoosReader = require("../../helpers/awtsmoosReader.js")
/**
 * @method getKeys
 * @description Retrieves all keys in O(n), but O(1) amortized per key, via the Awtsmoos’ map.
 * @param {string} filename - File to read from
 * @returns {Promise<string[]>} - Array of keys
 */
async function getKeys(filename) {
    const fs = require('fs');
    const fd = fs.openSync(filename, 'r');
    try {
        const header = await readHeaderAsync(fd);
        const hashTableStart = fs.fstatSync(fd).size - await calculateHashTableSize(fd, header.hashSize, header.offsetSize);
        const keys = [];
        let offset = hashTableStart;
        for (let i = 0; i < header.hashSize; i++) {
            const keyLengthInfo = await readConditional(fd, offset);
            if (keyLengthInfo.amount === 0) {
                offset += 1;
                continue;
            }
            const key = fs.readSync(fd, Buffer.alloc(keyLengthInfo.amount), 0, keyLengthInfo.amount, offset + keyLengthInfo.buffer.length).toString('utf8');
            keys.push(key);
            offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + header.offsetSize;
        }
        return keys;
    } finally {
        fs.closeSync(fd);
    }
}

module.exports = getKeys;
