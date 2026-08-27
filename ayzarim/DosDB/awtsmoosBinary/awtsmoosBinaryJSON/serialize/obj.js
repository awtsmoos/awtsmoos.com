// B"H

//FILE serialize/obj.js
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav into Atzilus,
// this code weaves a JSON tapestry with a hash table, a divine map of renewal.


const { magicJSON } = require("./../constants.js");
var serializeValue = require("./serializeValue.js");
var temp = {};



var makeHashTableFromMetadata = require("./makeHashTableFromMetadata.js")
var getSerializedMetadata = require("./getSerializedMetadata.js")

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
    let offset = header.reduce((sum, buf) => sum + buf.length, 0);

    
    var metadataTable = [];
    // Data: Key-value pairs, sparks of the Awtsmoos

    
    for (let key of keys) {
        
        const value = json[key];
        const valueBufferInfo = serializeValue(value, false); 

       
        const valueDataBuffer = valueBufferInfo.data;
        
        
        


        
        var metadataEntry = ({
            key,
            typeLengthByte: valueBufferInfo.typeLengthByte,
            valueLengthInfo: valueBufferInfo.valueLengthInfo,
 
            offsetOfValueInMain: offset
        });

        metadataTable.push(
            metadataEntry
        );

        offsets.push(offset);
        dataBuffers.push(valueDataBuffer);
        offset += valueDataBuffer.length;

        
    }


   
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);

        
   
    var {
        hashBuffers,
        serializedMetadata,
        offsetSizeMetadataArray,
        hashTableSize
    } = makeHashTableFromMetadata(
        metadataTable
        
    )

    var {
        footer,
        packedHeaderSizes: packAll
    } = getSerializedMetadata({
        serializedMetadataLength: serializedMetadata.length,
        offsetSizeMetadataArray,
        dataLength,
        totalKeys: keys.length,
        hashTableSize
    });

    

    offsetSizePlaceholder.writeUInt8(packAll);

    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        hashBuffers,
        serializedMetadata,
        footer
    ]);
}

module.exports = serializeJSON;