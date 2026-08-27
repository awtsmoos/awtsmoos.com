//B"H

/**
 * @method getKeyLength
 * @description Retrieves the number of keys in O(1), a direct glimpse of the Awtsmoos’ count.
 * @param {string} filename - File to read from
 * @returns {Promise<number>} - Number of keys
 */
async function getKeyLength(filename) {
    const fs = require('fs');
    const fd = fs.openSync(filename, 'r');
    try {
        const header = await readHeaderAsync(fd);
        return header.hashSize;
    } finally {
        fs.closeSync(fd);
    }
}

module.exports = getKeyLength;