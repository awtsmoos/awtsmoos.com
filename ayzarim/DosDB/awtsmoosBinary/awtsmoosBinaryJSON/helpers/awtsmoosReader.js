// B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the boundless Ohr Ein Sof, through the Kav into Atzilus, this code unveils
// the keys hidden within the hash table, a reflection of divine renewal.
var {
    magicJSON
} = require("../../constants.js")
class AwtsmoosReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.pos = 0;
    }

    /**
     * @method readUInt
     * @description Reads an unsigned integer from the buffer based on size.
     * @param {number} size - Bytes to read (1, 2, 4, or 8)
     * @returns {number} - The integer value
     */
    readUInt(size) {
        let value;
        if (size === 1) value = this.buffer.readUInt8(this.pos);
        else if (size === 2) value = this.buffer.readUInt16LE(this.pos);
        else if (size === 4) value = this.buffer.readUInt32LE(this.pos);
        else value = Number(this.buffer.readBigUInt64LE(this.pos));
        this.pos += size;
        return value;
    }

    /**
     * @method readVariableLength
     * @description Reads a variable-length number (assumes writeConditional format).
     * @returns {number} - The length value
     */
    readVariableLength() {
        const firstByte = this.buffer.readUInt8(this.pos);
        this.pos += 1;
        if (firstByte < 0x80) return firstByte; // 1 byte
        if (firstByte < 0xC0) return ((firstByte & 0x3F) << 8) | this.buffer.readUInt8(this.pos++); // 2 bytes
        if (firstByte < 0xE0) return ((firstByte & 0x1F) << 16) | this.buffer.readUInt16LE(this.pos); // 3 bytes, adjust pos after
        this.pos += 2;
        return ((firstByte & 0x0F) << 24) | this.buffer.readUInt32LE(this.pos); // 4 bytes, adjust pos after
    }

    /**
     * @method getKeys
     * @description Extracts an array of keys from the hash table in the buffer.
     * @returns {string[]} - Array of keys
     */
    getKeys() {
        // Skip header: magicJSON (assume 4 bytes), hash table size, offset size
        this.pos = magicJSON.length; // Skip magicJSON
        const hashTableSize = this.readVariableLength();
        const offsetSize = this.buffer.readUInt8(this.pos);
        this.pos += 1;

        // Skip data section and index table to reach hash table
        let dataSectionLength = 0;
        for (let i = 0; i < hashTableSize; i++) {
            const keyLength = this.readVariableLength();
            this.pos += keyLength; // Skip key
            this.pos += this.readVariableLength(); // Skip value length
            this.pos += this.buffer.readUInt8(this.pos - 1); // Skip value (assume simple length prefix)
        }
        this.pos += hashTableSize * offsetSize; // Skip index table

        // Read hash table
        const keys = [];
        for (let i = 0; i < hashTableSize; i++) {
            const keyLength = this.readVariableLength();
            if (keyLength === 0) {
                this.pos += 1; // Empty slot, skip null byte
                continue;
            }
            const key = this.buffer.toString('utf8', this.pos, this.pos + keyLength);
            keys.push(key);
            this.pos += keyLength + offsetSize; // Skip key and offset
        }

        return keys;
    }
}

module.exports = AwtsmoosReader;