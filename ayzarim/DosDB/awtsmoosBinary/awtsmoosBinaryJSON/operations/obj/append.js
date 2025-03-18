//B"H
/**
 * @method appendToJSON
 * @description Appends a key-value pair, extending the Awtsmoos’ weave.
 * @param {string} filename - File to append to
 * @param {string} key - Key to add
 * @param {any} value - Value to add
 */
function appendToJSON(filename, key, value) {
    const fs = require('fs');
    const fd = fs.openSync(filename, 'r+');
    try {
        const header = readHeader(fd); // Assume this parses magic, hashSize, offsetSize
        const indexTableStart = fs.fstatSync(fd).size - (header.hashSize * header.offsetSize + calculateHashTableSizeSync(fd, header.hashSize, header.offsetSize));
        const dataEnd = indexTableStart;

        // Serialize new pair
        const keyBuffer = Buffer.from(key, 'utf8');
        const keyLengthInfo = writeConditional(keyBuffer.length);
        const valueBuffer = serializeValue(value); // Assume this exists, matches serializeJSON logic
        const pairBuffer = Buffer.concat([keyLengthInfo.buffer, keyBuffer, valueBuffer]);
        fs.writeSync(fd, pairBuffer, 0, pairBuffer.length, dataEnd);

        // Update index table
        const offsets = readOffsets(fd, header);
        offsets.push(dataEnd);
        const newHashSize = header.hashSize + 1;
        const newIndexTable = Buffer.alloc(newHashSize * header.offsetSize);
        offsets.forEach((off, i) => writeToBuffer(newIndexTable, off, header.offsetSize, i * header.offsetSize));
        fs.writeSync(fd, newIndexTable, 0, newIndexTable.length, dataEnd + pairBuffer.length);

        // Update hash table
        const hashTableStart = dataEnd + pairBuffer.length + newIndexTable.length;
        const oldHashTableSize = calculateHashTableSizeSync(fd, header.hashSize, header.offsetSize);
        const hashTableBuffer = Buffer.alloc(oldHashTableSize);
        fs.readSync(fd, hashTableBuffer, 0, oldHashTableSize, indexTableStart + header.hashSize * header.offsetSize);
        const newHashTable = resizeHashTable(hashTableBuffer, header.hashSize, newHashSize, header.offsetSize);
        const hashIndex = hashKey(key, newHashSize);
        let index = hashIndex;
        while (newHashTable[index]) index = (index + 1) % newHashSize;
        newHashTable[index] = { key, offset: dataEnd };
        const hashBuffers = newHashTable.map(entry => entry ? Buffer.concat([writeConditional(entry.key.length).buffer, Buffer.from(entry.key), Buffer.alloc(header.offsetSize).fill(0).map((_, i) => writeToBuffer(_, entry.offset, header.offsetSize, i))]) : Buffer.from([0]));
        fs.writeSync(fd, Buffer.concat(hashBuffers), 0, Buffer.concat(hashBuffers).length, hashTableStart);

        // Update header
        fs.writeSync(fd, writeConditional(newHashSize).buffer, 0, writeConditional(newHashSize).buffer.length, 4);
        fs.ftruncateSync(fd, hashTableStart + Buffer.concat(hashBuffers).length);
    } finally {
        fs.closeSync(fd);
    }
}

/**
 * @method resizeHashTable
 * @description Resizes and rehashes the table, a reweaving by the Awtsmoos.
 * @param {Buffer} buffer - Current hash table buffer
 * @param {number} oldSize - Old size
 * @param {number} newSize - New size
 * @param {number} offsetSize - Bytes per offset
 * @returns {Array} - New hash table array
 */
function resizeHashTable(buffer, oldSize, newSize, offsetSize) {
    const newTable = new Array(newSize).fill(null);
    let offset = 0;
    for (let i = 0; i < oldSize; i++) {
        const keyLengthInfo = writeConditional
            .readConditionalSync(buffer, offset); // Assume sync version
        if (keyLengthInfo.amount === 0) {
            offset += 1;
            continue;
        }
        const key = buffer.toString('utf8', offset + keyLengthInfo.buffer.length, offset + keyLengthInfo.buffer.length + keyLengthInfo.amount);
        const keyOffset = readFromBuffer(buffer, offset + keyLengthInfo.buffer.length + keyLengthInfo.amount, offsetSize);
        let index = hashKey(key, newSize);
        while (newTable[index]) index = (index + 1) % newSize;
        newTable[index] = { key, offset: keyOffset };
        offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + offsetSize;
    }
    return newTable;
}

module.exports = appendToJSON