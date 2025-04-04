// B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav into Atzilus,
// this code weaves a JSON tapestry with a hash table, a divine map of renewal.

var writeConditional = require("../helpers/writeConditional.js");
var writeToBuffer = require("../helpers/writeToBuffer.js");
var { hashKey } = require("../helpers/hashing/misc.js");
const { magicJSON } = require("./../constants.js");
var serializeValue = require("./serializeValue.js");
var byteSize = require("../helpers/byteSize.js")
var temp = {};


var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")

var serializeArray = null;
Object.defineProperty(temp, "serializeArray", {
    get() {
        if (!serializeArray) serializeArray = require("./array.js");
        return serializeArray;
    }
});

/**
 * @method serializeJSON
 * @description Serializes a JSON object with an embedded hash table, echoing the Awtsmoos’ order.
 * @param {object} json - The JSON object to serialize
 * @returns {Buffer} - The serialized binary buffer
 */
function serializeJSON(json) {
    if (Array.isArray(json)) return temp.serializeArray(json);

    // Header: Awtsmoos’ signature
    let header = [Buffer.from(magicJSON)];
    const keys = Object.keys(json);
    const hashTableSize = keys.length * 2;//avoid collisions


    var lengthSizeOfKeys = writeConditional(keys.length);

    var lengthInfoOfHashTable = writeConditional(hashTableSize);

    /**
        even though the hash table and length of keys
        is later, good to get static fields in front
        for easy decoding later (if u want to know
        size of keys instantly, don't need to keep tracking etc.)
     */
 



    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);
    




    var keysInOrder = temp.serializeArray(keys);
    var sizeOfKeysArrayInfo = writeConditional(keysInOrder.length);

    


    const dataBuffers = [];
    const offsets = [];
    const hashTable = new Array(hashTableSize).fill(null);
    let offset = header.reduce((sum, buf) => sum + buf.length, 0);

    // Data: Key-value pairs, sparks of the Awtsmoos
    for (let key of keys) {
        const keyBuffer = Buffer.from(key, 'utf8');
        const keyLengthInfo = writeConditional(keyBuffer.length); // Raw length

        var sizeOfKeyLength = Buffer.from([keyLengthInfo.size]);

        const value = json[key];
        const valueBuffer = serializeValue(value, true); // Assume packs type/length

        const pairBuffer = Buffer.concat([
            sizeOfKeyLength,
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

    
    /**
     * make packed byte
     * with all size bytes (2 bits each 0 1 2 3 = 
     * 1 2 4 8) packed
     */
    var sizeOfKeysLengthPacked = packedLength(
        lengthSizeOfKeys.size
    );

    var sizeOfEmbeddedKeysArrayLength = packedLength(
        sizeOfKeysArrayInfo.size
    )

    var sizeOfHashTableLength = packedLength(
        lengthInfoOfHashTable.size
    );

    var packedOffsetSize = packedLength(
        offsetSize
    )

    var packAll = (
            (packedOffsetSize << 6) | 
            //0b11000000
            (sizeOfKeysLengthPacked << 4) | 
            //0b00110000, 

            (sizeOfEmbeddedKeysArrayLength << 2) |
            //0b00001100
            (sizeOfHashTableLength)
            //0b00000011
        )
    
    
    offsetSizePlaceholder.writeUInt8(packAll);

    // Hash table: fixed sized entries based
    //on index
    const hashBuffers = Buffer.alloc(
        hashTable.length * offsetSize
    )
    hashTable.forEach((entry, index) => {
        if (entry) {
           // console.log(entry,entry.offset, index,offsetSize)


            hashBuffers
            .writeUIntBE(


                
                entry.offset, //never 0. so if 0 is found, that's null
                index * offsetSize,
                
                
                offsetSize
            );
            
        }
    });
  //  console.log("wrote",hashTable,hashBuffers)


  


    var keysArrayLength = sizeOfKeysArrayInfo.buffer;
    var footer = (Buffer.concat([
        lengthInfoOfHashTable.buffer,
        lengthSizeOfKeys.buffer,

        keysInOrder,

        keysArrayLength
    ]))
    

    

    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        (hashBuffers),
        footer
    ]);
}

module.exports = serializeJSON;