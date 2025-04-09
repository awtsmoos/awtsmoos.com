// B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav into Atzilus,
// this code weaves a JSON tapestry with a hash table, a divine map of renewal.

var writeConditional = require("../helpers/writeConditional.js");
var writeToBuffer = require("../helpers/writeToBuffer.js");
var { hashKey } = require("../helpers/hashing/misc.js");
const { magicJSON } = require("./../constants.js");
var serializeValue = require("./serializeValue.js");
var getArray = require("../deserialize/getArray.js")
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


    

    var lengthInfoOfHashTable = writeConditional(hashTableSize);

    /**
        even though the hash table and length of keys
        is later, good to get static fields in front
        for easy decoding later (if u want to know
        size of keys instantly, don't need to keep tracking etc.)
     */
 



    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);
    




    
    const dataBuffers = [];
    const offsets = [];
    const hashTable = new Array(hashTableSize).fill(null);
    let offset = header.reduce((sum, buf) => sum + buf.length, 0);

    var entrySizeOfMetadataTable 
    var metadataTable = [];
    // Data: Key-value pairs, sparks of the Awtsmoos

    var keyNum = 0;
    for (let key of keys) {
        const keyBuffer = Buffer.from(key, 'utf8');
        const keyLengthInfo = writeConditional(keyBuffer.length); // Raw length

        var sizeOfKeyLength = Buffer.from([keyLengthInfo.size]);

        const value = json[key];
        const valueBufferInfo = serializeValue(value, false); 

       
        const valueDataBuffer = valueBufferInfo.data;
        

        const hashIndex = hashKey(key, hashTableSize);
        let index = hashIndex;
        while (hashTable[index] !== null) 
            index = (index + 1) % hashTableSize;

        hashTable[index] = {
            key,
            sizeOfKeyLength: keyLengthInfo.size,

            offset,
            keyNum
        };
        var bufferOffset = writeConditional(offset)

        var packedLengthSizes = (
            packedLength(
                keyLengthInfo.size
            ) << 2 | 
        
            //0b00001100 | 
            packedLength(
                bufferOffset.size
            )
            //0b00000011
        );

        var keysAndValueTypes = Buffer.concat([
            Buffer.from([packedLengthSizes]),
            Buffer.from([valueBufferInfo.typeLengthByte]),
            keyLengthInfo.buffer,

            valueBufferInfo.valueLengthInfo.buffer,

            keyBuffer,

            bufferOffset.buffer
        ])

        metadataTable.push(keysAndValueTypes);

        offsets.push(offset);
        dataBuffers.push(valueDataBuffer);
        offset += valueDataBuffer.length;

        keyNum++;
    }

    // Offset size: Determined by data length
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 
        : dataLength < 65536 ? 2 
        : dataLength < 4294967296 ? 4 
        : 8;
   
        

    var serializedMetadata = temp.serializeArray(metadataTable);

    var sizeOfMetadataArrayInfo = writeConditional(serializedMetadata.length);

    var metadataOfMetadataArray = getArray.getMetadata(
        serializedMetadata
    );

    var offsetSizeMetadataArray = metadataOfMetadataArray.offsetSize;

    /**
     * make packed byte
     * with all size bytes (2 bits each 0 1 2 3 = 
     * 1 2 4 8) packed
     */
    var sizeOfMetadataArrayOffsetSizePacked = packedLength(
        offsetSizeMetadataArray
    );

    var sizeOfEmbeddedMetadataArrayLength = packedLength(
        sizeOfMetadataArrayInfo.size
    )

    var sizeOfHashTableLength = packedLength(
        lengthInfoOfHashTable.size
    );

    var packedOffsetSize = packedLength(
        offsetSize
    );

    var totalEntriesLength = writeConditional(
        keys.length
    );
    var byteSizeOfTotalEntriesLength = packedLength(
        totalEntriesLength.size
    );

    var packAll = (
            //first 2 bits reserved
            (byteSizeOfTotalEntriesLength << 4) |
            //0b00110000
            (sizeOfEmbeddedMetadataArrayLength << 2) |
            //0b00001100
            (sizeOfHashTableLength)
            //0b00000011
        )
    
    
    offsetSizePlaceholder.writeUInt8(packAll);
    
    var hashBufferEntrySize = (
        offsetSizeMetadataArray
    );
    // Hash table: fixed sized entries based
    //on index
    const hashBuffers = Buffer.alloc(
        hashTable.length * hashBufferEntrySize
    );
   
    hashTable.forEach((entry, index) => {
        if (entry) {
            
            var keyNumber = entry.keyNum;

            var offsetOfValueInMetadataArray = getArray.getOffsetFromIndex(
                serializedMetadata,
                keyNumber,
                metadataOfMetadataArray
            );

            var bufferInHashTable = Buffer.alloc(
                hashBufferEntrySize
            );

            var offset = 0;

            bufferInHashTable.writeUIntBE(
                offsetOfValueInMetadataArray,
                offset,
                offsetSizeMetadataArray
            );

           
            bufferInHashTable.copy(
                hashBuffers,
                index * hashBufferEntrySize
            )
            
            
        }
    });
    

  


  
    var offsetSizesPacked = 
        (packedOffsetSize << 2) | 
        //0b00001100
        (sizeOfMetadataArrayOffsetSizePacked);
        //0b00000011, 

    var footer = (Buffer.concat([

        Buffer.from([offsetSizesPacked]),

        totalEntriesLength.buffer,
        sizeOfMetadataArrayInfo.buffer,
        lengthInfoOfHashTable.buffer
        
    ]));
    

    

    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        (hashBuffers),
        serializedMetadata,
        footer
    ]);
}

module.exports = serializeJSON;