//B"H

var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./../constants.js");


var {
    readConditional
} = require("../../awtsmoosBinaryHelpers.js");



var deserializeArray = null;
Object.defineProperties(module.exports, "deserializeArray", {
    get() {
        if(!deserializeArray) {
            deserializeArray = require("./array.js")
        }
        return deserializeArray;
    }
});

async function deserializeBinary(buffer) {
    

    async function readData() {
        var magic = (await buffer.subarray(0, magicArray.length)).toString();
        if(magic == magicArray) {
            return await deserializeArray(buffer);
        } else if(magic != magicJSON) {
            return {
                awtsmoosError: "That type isn't right!"
            }
        }
        let offset = magic.length;
        let obj = {};
       // console.log("READING",offset, buffer,logBuffer(buffer),buffer.toString())
        var hashInfo = await readConditional(buffer,offset)
        let hashTableSize = hashInfo.amount;
        //buffer.readUInt32LE(offset);
        offset = hashInfo.offset;
        var hashTable;
        try {
            hashTable = new Array(hashTableSize);
        } catch(e) {
            console.log("HASH issue",hashTableSize,hashInfo, offset,buffer)
            return {
                error: {
                    message: "Issue in hash table",
                    hashTableSize,
                    hashInfo 
                }
            }
        }
        for (let i = 0; i < hashTableSize; i++) {
            let keyOffset = await buffer.readUInt32BE(offset);
            offset += hashAmount;
            hashTable[i] = keyOffset;
     //       if (keyOffset !== 0) 
        }
       // console.log("hash table",hashTable)
     // console.log("Getting maybe",hashTable)
        for (let keyOffset of hashTable) {
            if (keyOffset) {
                var keyInfo = await readConditional(buffer,keyOffset)
                let keyLength = keyInfo.amount;
                keyOffset = keyInfo.offset;
                //buffer.readUInt16LE(keyOffset);
                let key = await buffer.toString('utf8', keyOffset, keyOffset + keyLength);
                var value = await parseValueFromKey({
                    keyOffset,
                    keyLength,
                    buffer
                })
               
                obj[key] = value;
            }
        }
        return obj;
    }
    
    return await readData();
}

module.exports = deserializeBinary;