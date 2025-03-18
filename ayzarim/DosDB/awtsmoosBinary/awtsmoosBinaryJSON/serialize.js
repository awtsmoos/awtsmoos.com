//B"H
var {
    writeToBuffer,


    writeConditional,

    hashKey
} = require("../awtsmoosBinaryHelpers.js");

var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants.js");

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


function serializeArray(arr) {
    let arrayBufferList = [];
    var magic = Buffer.from(magicArray)
    arrayBufferList.push(magic)
    let lengthBuffer = writeConditional(arr.length)
    
    arrayBufferList.push(lengthBuffer.buffer);
    arrayBufferList = Buffer.concat(
        arrayBufferList,
        
    )
    var buffersToPush = []
    for (let item of arr) {
        let itemBuffer;
        var isBuffer = item instanceof Buffer
        if(Array.isArray(item)) {
            
            var type = Buffer.alloc(1);
            type.writeUInt8(3);
            var arr  = serializeArray(item);

            var length = writeConditional(Buffer.byteLength(arr))
            /*Buffer.alloc(4);
            length.writeUInt32LE(arr.length, 0)*/
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                arr
            ]);
        } else if (
            item && !isBuffer &&
            typeof item === 'object' 
        ) {
            
            var type = Buffer.alloc(1);
            type.writeUInt8(1);
            var obj  = serializeJSON(item);
            var length = writeConditional(Buffer.byteLength(obj))
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                obj
            ]);
        } else if(
            typeof(item)
            == "number" &&
            !isNaN(item)
        ) {
            var type = Buffer.alloc(1);
            type.writeUInt8(4);
            let itemString = writeConditional(item);
            var length = writeConditional(itemString.
                buffer.length)
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                itemString.buffer
            ]);
        }  else if(
            typeof(item) 
            == "boolean" 
        ) {
            var type = Buffer.alloc(1);
            type.writeUInt8(5);
            let itemString = item ? 1 : 0;
            var length = writeConditional(1)
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                Buffer.from([itemString])
            ]);
        } else if(item === undefined) {
            var type = Buffer.alloc(1);
            type.writeUInt8(6);
            var length = writeConditional(0)
            itemBuffer = Buffer.concat([
                length.buffer,
                type
            ]);
        } else if(item === null) {
            var type = Buffer.alloc(1);
            type.writeUInt8(7);
            var length = writeConditional(0)
            itemBuffer = Buffer.concat([
                length.buffer,
                type
            ]);
        } else if(isBuffer) {
            var type = Buffer.alloc(1);
            type.writeUInt8(8);
            
            var length = writeConditional(item.length)
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                item
            ]);
        } else {

            var type = Buffer.alloc(1);
            type.writeUInt8(2);
            let itemString = Buffer.from(item)
            var length = writeConditional(itemString.length)
            itemBuffer = Buffer.concat([
                length.buffer,
                type,
                itemString
            ]);
           
        }
        
        buffersToPush.push(itemBuffer);
    }
    
    var biggestSize = lengthBuffer.size * 256;
    buffersToPush.forEach(q => {
        var adjusted = (buffersToPush.length) * 
            lengthBuffer.size +arrayBufferList.length 
            + q.length
        if(adjusted > biggestSize) {
            biggestSize = adjusted;
        }
    });
    var byteSizeInfo = writeConditional(biggestSize)
    var byteSize =byteSizeInfo.size
    var byteSizeBuffer = writeConditional(byteSize)
    var keyBuffer = Buffer.alloc(
        (buffersToPush.length) * 
        byteSize * 2
    );
    var off =0// byteSizeInfo.offset;
    var curLength = byteSize +
        arrayBufferList.length 
        + (keyBuffer.length
        )
    buffersToPush.forEach((q,i,a) => {
        
        writeToBuffer(
            keyBuffer, 
            i, 
            byteSize,
            off
        );
        off += byteSize;
        
        //if(i > 0) curLength--
        writeToBuffer(
            keyBuffer, 
            curLength, 
            byteSize,
            off
        );
        curLength += q.length;
     //   console.log("LENGTH:",q,q.length)
        off += byteSize

    });
  //  console.log(buffersToPush,logBuffer(keyBuffer))
    buffersToPush = Buffer.concat(buffersToPush)
  //  console.log("Buffers",buffersToPush)
    var arBuf = Buffer.concat([
        arrayBufferList,
        byteSizeBuffer.buffer,
        keyBuffer,
        buffersToPush
    ]);
  
  //  console.log("finished array", logBuffer(arBuf))
    return arBuf
}

module.exports = {
    serializeArray,
    serializeJSON
}