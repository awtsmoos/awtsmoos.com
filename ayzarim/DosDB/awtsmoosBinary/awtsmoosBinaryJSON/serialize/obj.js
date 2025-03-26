// B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav into Atzilus,
// this code weaves a JSON tapestry with a hash table, a divine map of renewal.

var writeConditional = require("../helpers/writeConditional.js");
var writeToBuffer = require("../helpers/writeToBuffer.js");
var { hashKey } = require("../helpers/hashing/misc.js");
const { magicJSON } = require("./../constants.js");
var serializeValue = require("./serializeValue.js");

/**
 * @method serializeJSON
 * @description Serializes a JSON object with an embedded hash table, echoing the Awtsmoos’ order.
 * @param {object} json - The JSON object to serialize
 * @returns {Buffer} - The serialized binary buffer
 */
function serializeJSON(json) {
    if (Array.isArray(json)) return module.exports.serializeArray(json);

    // Header: Awtsmoos’ signature
    let header = [Buffer.from(magicJSON)];
    const keys = Object.keys(json);
    const hashTableSize = keys.length;

    const lengthInfo = writeConditional(hashTableSize, false); // Raw length, no type
    header.push(lengthInfo.buffer);
    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);

    const dataBuffers = [];
    const offsets = [];
    const hashTable = new Array(hashTableSize).fill(null);
    let offset = header.reduce((sum, buf) => sum + buf.length, 0);

    // Data: Key-value pairs, sparks of the Awtsmoos
    for (let key of keys) {
        const keyBuffer = Buffer.from(key, 'utf8');
        const keyLengthInfo = writeConditional(keyBuffer.length, false); // Raw length

        const value = json[key];
        const valueBuffer = serializeValue(value, true); // Assume packs type/length

        const pairBuffer = Buffer.concat([
            keyLengthInfo.buffer,
            keyBuffer,
            valueBuffer
        ]);

        const hashIndex = hashKey(key, hashTableSize);
        let index = hashIndex;
        while (hashTable[index] !== null) 
            index = (index + 1) % hashTableSize;

        hashTable[index] = { key, offset };
        offsets.push(offset);
        dataBuffers.push(pairBuffer);
        offset += pairBuffer.length;
    }

    // Offset size: Determined by data length
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 
        : dataLength < 65536 ? 2 
        : dataLength < 4294967296 ? 4 
        : 8;
    offsetSizePlaceholder.writeUInt8(offsetSize);

    // Index table: Offsets list
    const indexTable = Buffer.alloc(hashTableSize * offsetSize);
    offsets.forEach((off, i) => writeToBuffer(indexTable, off, offsetSize, i * offsetSize));

    // Hash table: Raw key length + key + offset
    const hashBuffers = [];
    hashTable.forEach(entry => {
        if (entry) {
            const keyBuffer = Buffer.from(entry.key, 'utf8');
            const keyLengthInfo = writeConditional(keyBuffer.length, false);
            const offsetBuffer = Buffer.alloc(offsetSize);
            writeToBuffer(offsetBuffer, entry.offset, offsetSize, 0);
            hashBuffers.push(Buffer.concat([
                keyLengthInfo.buffer, // Raw length (1, 2, 4, or 8 bytes)
                keyBuffer,
                offsetBuffer
            ]));
        } else {
            hashBuffers.push(Buffer.from([0])); // Empty slot
        }
    });

    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        indexTable,
        Buffer.concat(hashBuffers)
    ]);
}

module.exports = serializeJSON;