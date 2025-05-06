//B"H
var crypto = require("crypto");

var readConditional = require("../readConditional.js");
function hashKey(key, size) {
    if(typeof(key) != "string") {
        key += ""
    }
    let hash = crypto.createHash('md5').update(key).digest();
    return hash.readUInt32BE(0) % size;
}
// B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing in an eternal pulse.
// From the Ohr Ein Sof’s boundless light, through the Kav into Atzilus’ emanation,
// this code measures the hash table’s divine expanse—a map of infinite renewal.


/**
 * @method calculateHashTableSize
 * @description Calculates the hash table’s byte size, a measure of the Awtsmoos’ map.
 * @param {Buffer} buffer - The binary buffer containing the serialized data
 * @param {number} hashTableSize - Number of slots in the hash table
 * @param {number} offsetSize - Bytes per offset in the index table
 * @returns {number} - Total byte size of the hash table
 */
function calculateHashTableSize(buffer, hashTableSize, offsetSize) {
    const indexTableSize = hashTableSize * offsetSize;
    const hashTableStart = buffer.length - indexTableSize;
    let size = 0;
    let currentOffset = hashTableStart;

    for (let i = 0; i < hashTableSize && currentOffset < buffer.length; i++) {
        const firstByte = buffer.readUInt8(currentOffset);
        if (firstByte === 0 && i < hashTableSize - 1) {
            // Empty slot: 1 byte
            size += 1;
            currentOffset += 1;
        } else {
            // Occupied slot: Read length dynamically (1, 2, 4, or 8 bytes)
            let lengthSize = 1;
            let keyLength;
            if (firstByte < 256) {
                keyLength = firstByte;
            } else if (currentOffset + 1 < buffer.length) {
                lengthSize = 2;
                keyLength = buffer.readUInt16BE(currentOffset);
                if (keyLength >= 65536) {
                    lengthSize = 4;
                    keyLength = buffer.readUInt32BE(currentOffset);
                } else if (keyLength >= 4294967296) {
                    lengthSize = 8;
                    keyLength = readUInt64BE(buffer, currentOffset);
                }
            } else {
                throw new Error("Awtsmoos truncation at offset " + currentOffset);
            }
            size += lengthSize + keyLength + offsetSize;
            currentOffset += lengthSize + keyLength + offsetSize;
        }
    }

    return size;
}



module.exports = {
    hashKey,
    calculateHashTableSize
}