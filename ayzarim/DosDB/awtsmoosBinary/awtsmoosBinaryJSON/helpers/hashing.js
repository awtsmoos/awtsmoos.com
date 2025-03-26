//B"H
var crypto = require("crypto");

function hashKey(key, size) {
    let hash = crypto.createHash('md5').update(key).digest();
    return hash.readUInt32BE(0) % size;
}

class AwtsmoosHashMap {
    constructor({
        capacity=8,
        hashEntrySize = 4,
        keySize = 1, /*
            each actual key is less 
            than 256 bytes
        */
        valueSize = 4
    }) {

        var hashTableBuffers = []
        const hashTableSize = capacity * 2;
        this.hashTableSize =hashTableSize;

        hashTableSize;

        var header = Buffer.alloc(1);
        header.writeUInt8(valueSize);

        this.valueSize = valueSize;
        this.keySize = keySize;
        this.hashEntrySize = hashEntrySize;

        
    }

    setupHashMap() {
        var hashMapBuffer = Buffer.alloc(
            this.hashTableSize *  
            this.keySize *
            this.valueSize 
           // * this.hashEntrySize
        );
        this.hashMapBuffer = hashMapBuffer;

    }

    setEntry(key, value) {
        var hashIndex = hashKey(key, this.hashTableSize);
        let index = hashIndex;
        while (getKeyAtIndex(index) != 0) 
            index = (index + 1) % hashTableSize;

        var entry = Buffer.alloc(this.keySize + this.valueSize);
        var valueBuf = Buffer.from(value);
        var keyBuf = Buffer.from(key);

        keyBuf.copy(entry, 0);
        valueBuf.copy(entry, this.keySize);
        var offset = index * this.valueSize * this.keySize;
        entry.copy(this.hashMapBuffer, offset)
      //  this.hashMapBuffer
    }

    getKeyAtIndex(index) {
        var start = this.keySize *
            this.valueSize *
       //     this.hashEntrySize * 
            index;
      
        return this.hashMapBuffer.readUInt8(
            start
        )
    }

}
/**
 * @method calculateHashTableSize
 * @description Calculates the hash table’s byte size, a measure of the Awtsmoos’ map.
 * @param {Buffer} buffer - The binary buffer
 * @param {number} hashTableSize - Number of slots
 * @param {number} offsetSize - Bytes per offset
 * @returns {Promise<number>} - Total hash table size
 */
async function calculateHashTableSize(buffer, hashTableSize, offsetSize) {
    let size = 0;
    let offset = buffer.length - offsetSize * hashTableSize;
    for (let i = 0; i < hashTableSize; i++) {
        const keyLengthInfo = await readConditional(buffer, offset);
        if (keyLengthInfo.amount === 0) {
            size += 1; // Empty slot
            offset += 1;
        } else {
            size += keyLengthInfo.buffer.length 
                + keyLengthInfo.amount 
                + offsetSize;
            offset += keyLengthInfo.buffer.length 
                + keyLengthInfo.amount + offsetSize;
        }
    }
    return size;
}

module.exports = {
    hashKey,
    calculateHashTableSize,
    AwtsmoosHashMap
}