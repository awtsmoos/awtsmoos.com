//B"H

var { hashKey } = require("../helpers/hashing/misc.js");

var serializeMetadataEntry = require("./serializeMetadataEntry");
var getArray = require("../deserialize/getArray.js")
var temp = {};


var serializeArray = null;
Object.defineProperty(temp, "serializeArray", {
    get() {
        if (!serializeArray) serializeArray = require("./array.js");
        return serializeArray;
    }
});

function makeHashTableFromMetadata(metadataTable) {

    var serialized = metadataTable[0] instanceof Buffer ?
    metadataTable : 
    metadataTable.map(serializeMetadataEntry)
    
    var serializedMetadata = temp.serializeArray(serialized);

    var metadataOfMetadataArray = getArray.getMetadata(
        serializedMetadata
    );


    

    var offsetSizeMetadataArray = metadataOfMetadataArray.offsetSize;

    const hashTableSize = metadataTable.length * 2;//avoid collisions
    const hashTable = new Array(hashTableSize).fill(null);

    metadataTable.forEach((q, i) => {
        var key = q.key;
        var offset = q.offsetOfValueInMain;
        var keyNum = i;

        const hashIndex = hashKey(key, hashTableSize);
        let index = hashIndex;
        while (hashTable[index] !== null) 
            index = (index + 1) % hashTableSize;

        hashTable[index] = {
            key,
            

            offset,
            keyNum
        };
    });

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
            var offsetOfValueInMetadataArray
            try {
               
                offsetOfValueInMetadataArray = getArray.getOffsetFromIndex(
                    serializedMetadata,
                    keyNumber,
                    metadataOfMetadataArray
                );
            } catch(e) {
                console.log("LOL",keyNumber, metadataOfMetadataArray)

                console.log("ISSUE",e);
                throw "LOL";
            }

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

    return {
        hashBuffers,
        serializedMetadata,
        hashTableSize,
        offsetSizeMetadataArray
    };
}

module.exports = makeHashTableFromMetadata