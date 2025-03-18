//B"H

var {
    writeToBuffer,


    writeConditional,

    hashKey
} = require("../../awtsmoosBinaryHelpers.js");


var {
    magicJSON,
    hashAmount

} = require("./../constants.js");

var serializeArray = null;
Object.defineProperties(module.exports, "serializeArray", {
    get() {
        if(!serializeArray) {
            serializeArray = require("./array.js")
        }
        return serializeArray;
    }
});

function serializeJSON(json) {
    if(Array.isArray(json)) {
        return serializeArray(json)
    }
    let bufferList = [];
    var magic = Buffer.from(magicJSON)
    bufferList.push(magic)

    let offset = magic.length;

    function writeData(obj) {
        let keys = Object.keys(obj);
        let hashTableSize = keys.length;
        let hashTable = new Array(hashTableSize).fill(null);
        let startOffset = offset;
        
        // Store hash table size
        let metaBuffer = writeConditional(hashTableSize)
        /*Buffer.alloc(4);
        metaBuffer.writeUInt32LE(hashTableSize, 0);*/
        bufferList.push(metaBuffer.buffer);
        offset += metaBuffer.offset;
        
        let hashTableBuffer = Buffer.alloc(hashTableSize * hashAmount);
        bufferList.push(hashTableBuffer);
        offset += hashTableBuffer.length;
        
        for (let key of keys) {
            let value = obj[key];
            let keyBuffer = Buffer.from(key, 'utf8');
            var keyLength = writeConditional(keyBuffer.length)
            /*
            let keyLength = Buffer.alloc(2);
            keyLength.writeUInt16LE(keyBuffer.length, 0);
            */
            let index = hashKey(key, hashTableSize);
          //  console.log("Hashing",index,key)
            while (hashTable[index] !== null) {
                index = (index + 1) % hashTableSize;
            }
         //   console.log("Hasht?",index,key)
            
            let keyOffset = offset;
            hashTable[index] = { key, position: keyOffset };


            bufferList.push(keyLength.buffer, keyBuffer);
            offset += keyLength.offset + 
                 keyBuffer.length;
            
            let valueBuffer;
          //  console.log("DOING value",value)
            if (Array.isArray(value)) {
                let arrayBuffer = serializeArray(value);
                
                var length = writeConditional(Buffer.byteLength(arrayBuffer))
            //    console.log("Array",value, arrayBuffer,length)
                valueBuffer = Buffer.concat([
                    Buffer.from([0x03]), 
                    length.buffer, 
                    arrayBuffer
                ]);
            } else if (typeof value === 'object' && value !== null) {
                var val  = serializeJSON(value);
                var length = writeConditional(Buffer.byteLength(val))
                valueBuffer = Buffer.concat([
                    Buffer.from([0x01]), length.buffer, val
                ]);
               
            //    console.log("WROTE value",value,valueBuffer,logBuffer(valueBuffer),valueBuffer.toString())
            } else if(typeof(value) == "string") {
                var valueString = Buffer.from(value, 'utf8');
                var valLength = writeConditional(valueString.length)
            //    console.log("LENTH",value,valLength.buffer,valueString)
                valueBuffer = Buffer.concat(
                    [Buffer.from([0x02]), 
                    valLength.buffer, 
                    valueString]
                );
               
            } else if(
                typeof(value) == "number" &&
                !isNaN(value)
            ) {
                let valueString = writeConditional(value);
           //     console.log("WRriting",valueString)
                var valLength = writeConditional(
                    
                    valueString.buffer.length
                )
            //    console.log("LENTH",value,valLength.buffer,valueString)
                valueBuffer = Buffer.concat(
                    [
                        Buffer.from([0x04]), 
                        valLength.buffer, 
                        valueString.buffer
                    ]
                );
            } else if(typeof(value) == "boolean") {
                if(value) {
                    value = 1;
                } else {
                    value = 0;
                }
                valueBuffer = Buffer.concat(
                    [
                        Buffer.from([0x05]), 
                        Buffer.from([0x01]), 
                        Buffer.from([value])
                    ]
                );
            } else if(value === undefined) {
                
                valueBuffer = Buffer.concat(
                    [
                        Buffer.from([0x06]), 
                        Buffer.from([0x00])
                        
                    ]
                );
            } else if(value === null) {
                valueBuffer = Buffer.concat(
                    [
                        Buffer.from([0x07]), 
                        Buffer.from([0x00])
                        
                    ]
                );
            } else if(value instanceof Buffer) {
                var valLength = writeConditional(
                    value.length
                )
                valueBuffer = Buffer.concat(
                    [
                        Buffer.from([0x08]), 
                        valLength.buffer,
                        value
                        
                    ]
                );
            }
            
            bufferList.push(valueBuffer);
            offset += valueBuffer.length;
            
            let keyIndex = Buffer.alloc(hashAmount);
            keyIndex.writeUInt32BE(keyOffset, 0);
            hashTableBuffer.set(keyIndex, index * hashAmount);
        }
        
        return startOffset;
    }

    

    writeData(json);
    return Buffer.concat(bufferList);
}

module.exports = serializeJSON;