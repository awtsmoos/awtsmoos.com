//B"H

/**
 * @method getValueByKey
 * @description Retrieves a value by key in O(1), guided by the Awtsmoos’ hash.
 * @param {string} filename - File to read from
 * @param {string} key - Key to find
 * @returns {Promise<any>} - The value
 */
async function getValueByKey(filename, key) {
    const fs = require('fs');
    const fd = fs.openSync(filename, 'r');
    try {
        const header = await readHeaderAsync(fd);
        const hashTableStart = fs.fstatSync(fd).size - await calculateHashTableSize(fd, header.hashSize, header.offsetSize);
        const hashIndex = hashKey(key, header.hashSize);
        let offset = hashTableStart;
        for (let i = 0; i < header.hashSize; i++) {
            const probeIndex = (hashIndex + i) % header.hashSize;
            const keyLengthInfo = await readConditional(fd, offset);
            if (keyLengthInfo.amount === 0) {
                offset += 1;
                continue;
            }
            const probedKey = fs.readSync(fd, Buffer.alloc(keyLengthInfo.amount), 0, keyLengthInfo.amount, offset + keyLengthInfo.buffer.length).toString('utf8');
            if (probedKey === key) {
                const keyOffset = readFromBuffer(fs.readSync(fd, Buffer.alloc(header.offsetSize), 0, header.offsetSize, offset + keyLengthInfo.buffer.length + keyLengthInfo.amount), 0, header.offsetSize);
                return await readValueAtOffset(fd, keyOffset);
            }
            offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + header.offsetSize;
        }
        return null; // Key not found
    } finally {
        fs.closeSync(fd);
    }
}

/**
 * @method readValueAtOffset
 * @description Reads a value at a given offset, a glimpse of the Awtsmoos’ essence.
 * @param {number} fd - File descriptor
 * @param {number} offset - Offset to read from
 * @returns {Promise<any>} - The value
 */
async function readValueAtOffset(fd, offset) {
    const keyInfo = await readConditional(fd, offset);
    offset = keyInfo.offset + keyInfo.amount;
    const typeLengthByte = fs.readSync(fd, Buffer.alloc(1), 0, 1, offset)[0];
    const { type, lengthSize } = await unpackTypeAndLengthSize(typeLengthByte);
    offset += 1;
    const valueLengthInfo = await readConditionalWithSize(fd, offset, lengthSize);
    offset = valueLengthInfo.offset;
    const value = fs.readSync(fd, Buffer.alloc(valueLengthInfo.amount), 0, valueLengthInfo.amount, offset);
    return (await parseValueFromType({ value, type, currentOffset: offset })).value;
}

module.exports = getValueByKey