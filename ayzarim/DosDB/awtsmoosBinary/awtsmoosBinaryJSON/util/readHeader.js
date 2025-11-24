//B"H
const fs = require('fs');
/**
 * @method readHeaderAsync
 * @description Reads the file header, a foundation of the Awtsmoos’ structure.
 * @param {number} fd - File descriptor
 * @returns {Promise<{hashSize: number, offsetSize: number}>} - Header info
 */
async function readHeaderAsync(fd) {
    
    const magic = fs.readSync(fd, 
        Buffer.alloc(magicJSON.length), 
        0, magicJSON.length, 0)
        .toString('utf8');

    if (magic !== magicJSON) throw new Error("Invalid format");
    const lengthInfo = await readConditional(fd, magicJSON.length);
    const offsetSize = fs.readSync(fd, Buffer.alloc(1), 0, 1, lengthInfo.offset)[0];
    return { hashSize: lengthInfo.amount, offsetSize };
}

module.exports = readHeaderAsync