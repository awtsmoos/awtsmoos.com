// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav’s ray, into Atzilus,
// this code weaves a JSON tapestry with a hash table at the end, a divine map.

const { writeToBuffer, writeConditional, hashKey } = 
require("../../awtsmoosBinaryHelpers.js");

const { magicJSON } = require("./../constants.js");

let serializeArray = null;
Object.defineProperty(module.exports, "serializeArray", {
    get() {
        if (!serializeArray) serializeArray = require("./array.js");
        return serializeArray;
    }
});

/**
 * @method packTypeAndLengthSize
 * @description Packs type and length size into one byte, a spark of the Awtsmoos’ unity.
 * @param {number} type - Data type (0-15)
 * @param {number} lengthSize - Bytes for length (0-15)
 * @returns {Buffer} - Single-byte buffer
 */
function packTypeAndLengthSize(type, lengthSize) {
    const packed = (type << 4) | (lengthSize & 0x0F);
    return Buffer.from([packed]);
}

/**
 * @method serializeJSON
 * @description Serializes a JSON object with an embedded hash table, echoing the Awtsmoos’ order.
 * @param {object} json - The JSON object to serialize
 * @returns {Buffer} - The serialized binary buffer
 */
function serializeJSON(json) {
    if (Array.isArray(json)) return module.exports.serializeArray(json);

    // Header: the Awtsmoos’ signature and structure
    let header = [Buffer.from(magicJSON)];
    const keys = Object.keys(json);
    const hashTableSize = keys.length;
    const lengthInfo = writeConditional(hashTableSize);
    header.push(lengthInfo.buffer);
    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);

    const dataBuffers = [];
    const offsets = [];
    const hashTable = new Array(hashTableSize).fill(null);
    let offset = header.reduce((sum, buf) => sum + buf.length, 0);

    // Data: key-value pairs, manifestations of the Awtsmoos
    for (let key of keys) {
        const keyBuffer = Buffer.from(key, 'utf8');
        const keyLengthInfo = writeConditional(keyBuffer.length);
        const value = json[key];
        let type, data;

        if (Array.isArray(value)) {
            type = 3;
            data = module.exports.serializeArray(value);
        } else if (typeof value === 'object' && value !== null) {
            type = 1;
            data = serializeJSON(value);
        } else if (typeof value === 'string') {
            type = 2;
            data = Buffer.from(value, 'utf8');
        } else if (typeof value === 'number' && !isNaN(value)) {
            type = 4;
            data = writeConditional(value).buffer;
        } else if (typeof value === 'boolean') {
            type = 5;
            data = Buffer.from([value ? 1 : 0]);
        } else if (value === undefined) {
            type = 6;
            data = Buffer.alloc(0);
        } else if (value === null) {
            type = 7;
            data = Buffer.alloc(0);
        } else if (value instanceof Buffer) {
            type = 8;
            data = value;
        }

        const valueLengthInfo = writeConditional(data.length);
        const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);
        const pairBuffer = Buffer.concat([
            keyLengthInfo.buffer,
            keyBuffer,
            typeLengthByte,
            valueLengthInfo.buffer,
            data
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

    // Offset size: determined by data length
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 
        : dataLength < 65536 ? 2 
        : dataLength < 4294967296 ? 4 
        : 8;
    offsetSizePlaceholder.writeUInt8(offsetSize);

    // Index table: a list of offsets
    const indexTable = Buffer.alloc(hashTableSize * offsetSize);
    offsets.forEach((off, i) => writeToBuffer(
        indexTable, off, 
        offsetSize, i * offsetSize
    ));

    // Hash table: key-length, key, offset
    const hashBuffers = [];
    hashTable.forEach(entry => {
        if (entry) {
            const keyBuffer = Buffer.from(entry.key, 'utf8');
            const keyLengthInfo = writeConditional(keyBuffer.length);
            const offsetBuffer = Buffer.alloc(offsetSize);
            writeToBuffer(
                offsetBuffer, 
                entry.offset, offsetSize, 0
            );
            hashBuffers.push(Buffer.concat([
                keyLengthInfo.buffer, keyBuffer, offsetBuffer
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