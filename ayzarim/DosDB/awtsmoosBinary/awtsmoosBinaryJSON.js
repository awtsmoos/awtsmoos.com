//B"H

// Binary JSON Serializer and Database in Node.js
// Uses Buffers for efficient binary storage with a hashmap
var {
    logBuffer,

    readFromBuffer,
    writeToBuffer,


    writeConditional,
    readConditional,

    hashKey
} = require("./awtsmoosBinaryHelpers.js")
var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants");
var binaryFileWrapper = require("./binaryFileClassWrapper.js");

function isAwtsmoosObject(buffer) {
    var mag = buffer.subarray(0,2).toString()
    if(
        mag != magicJSON &&
        mag != magicArray
    ) {
        return false;
    }
    return true;
}

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
            while (hashTable[index] !== null) {
                index = (index + 1) % hashTableSize;
            }
            
            let keyOffset = offset;
            hashTable[index] = { key, position: keyOffset };
            bufferList.push(keyLength.buffer, keyBuffer);
            offset += keyLength.offset + 
                 keyBuffer.length;
            
            let valueBuffer;
          //  console.log("DOING value",value)
            if (Array.isArray(value)) {
                let arrayBuffer = serializeArray(value);
                
                var length = writeConditional(arrayBuffer.length)
            //    console.log("Array",value, arrayBuffer,length)
                valueBuffer = Buffer.concat([
                    Buffer.from([0x03]), 
                    length.buffer, 
                    arrayBuffer
                ]);
            } else if (typeof value === 'object' && value !== null) {
                var val  = serializeJSON(value);
                var length = writeConditional(val.length)
                valueBuffer = Buffer.concat([
                    Buffer.from([0x01]), length.buffer, val
                ]);
               
            //    console.log("WROTE value",value,valueBuffer,logBuffer(valueBuffer),valueBuffer.toString())
            } else if(typeof(value) == "string") {
                let valueString = value;
                var valLength = writeConditional(valueString.length)
            //    console.log("LENTH",value,valLength.buffer,valueString)
                valueBuffer = Buffer.concat(
                    [Buffer.from([0x02]), 
                    valLength.buffer, 
                    Buffer.from(valueString, 'utf8')]
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
            keyIndex.writeUInt32LE(keyOffset, 0);
            hashTableBuffer.set(keyIndex, index * hashAmount);
        }
        
        return startOffset;
    }

    

    writeData(json);
    return Buffer.concat(bufferList);
}

function deserializeBinary(buffer) {
    

    function readData() {
        var magic = buffer.subarray(0, magicArray.length).toString();
        if(magic == magicArray) {
            return deserializeArray(buffer);
        } else if(magic != magicJSON) {
            return {
                awtsmoosError: "That type isn't right!"
            }
        }
        let offset = magic.length;
        let obj = {};
       // console.log("READING",offset, buffer,logBuffer(buffer),buffer.toString())
        var hashInfo = readConditional(buffer,offset)
        let hashTableSize = hashInfo.amount;
        //buffer.readUInt32LE(offset);
        offset = hashInfo.offset;
        let hashTable = new Array(hashTableSize);
        
        for (let i = 0; i < hashTableSize; i++) {
            let keyOffset = buffer.readUInt32LE(offset);
            offset += hashAmount;
            if (keyOffset !== 0) hashTable[i] = keyOffset;
        }
      //  console.log("hash table",hashTable)
     // console.log("Getting maybe",hashTable)
        for (let keyOffset of hashTable) {
            if (keyOffset) {
                var keyInfo = readConditional(buffer,keyOffset)
                let keyLength = keyInfo.amount;
                keyOffset = keyInfo.offset;
                //buffer.readUInt16LE(keyOffset);
                let key = buffer.toString('utf8', keyOffset, keyOffset + keyLength);
                var value = parseValueFromKey({
                    keyOffset,
                    keyLength,
                    buffer
                })
               
                obj[key] = value;
            }
        }
        return obj;
    }
    
    return readData();
}

function parseValueFromKey({
    keyOffset,
    keyLength,
    buffer
}={}) {
    let valueOffset = keyOffset + keyLength;
    let valueType = buffer.readUInt8(valueOffset);
    valueOffset++;
    var valueLength;
    if(valueType == 0x05) {
        valueLength = {offset:valueOffset+1, amount:1};
    } else if(valueType == 0x06 || valueType == 0x07) {
        valueLength = {
            offset: valueOffset,
            amount: 0
        }
    } else valueLength = readConditional(
        buffer,
        valueOffset
    )
    
    valueOffset = valueLength.offset;
    var value = buffer.subarray(
        valueOffset, 
        valueOffset + valueLength.amount
    );
  //  console.log("Amount",buffer,value,valueOffset,valueLength)
    
    if (valueType === 0x01) {
        /**
         * object type
         */
        
        //buffer.readUInt32LE(valueOffset + 1);
        
        value = deserializeBinary(value)
     //   console.log("Data",value,"length",valueLength,valueOffset)
        //  value = readDataAt(nestedOffset);
    } else if (valueType === 0x02) {
        /**
         * regular type
         */
        
        value = value.toString();
        try {
            value = JSON.parse(value)
        } catch(e) {

        }
        //console.log("Doing",keyOffset,hashTable, key, value,logBuffer(value))
        //value = deserializeBinary(value)
    } else if (valueType === 0x03) {
        
    //    console.log("Getting array", value, logBuffer(value),value+"")
        value = deserializeArray(value);
    } else if(
        valueType == 0x04
    ) {
        value = readConditional(value).amount;
    } else if(
        valueType == 0x05
    ) {
       // console.log("VAL",value,value.readUInt8(0),valueLength,buffer)
            value = !!value.readUInt8(0);
        
    } else if(
        valueType == 0x06
    ) {
       // console.log("VAL",value,value.readUInt8(0),valueLength,buffer)
            value = undefined;
        
    } else if(
        valueType == 0x07
    ) {
       // console.log("VAL",value,value.readUInt8(0),valueLength,buffer)
            value = null
        
    } else if(
        valueType == 0x08
    ) {
        //nothing
    }
    return value;
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

            var length = writeConditional(arr.length)
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
            var length = writeConditional(obj.length)
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
    console.log(byteSize,"bite ised",biggestSize)
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


function deserializeArray(arrayBuffer) {
    var magic = arrayBuffer.subarray(0, magicArray.length).toString();
    if(magic != magicArray) {
        return {
            awtsmoosError: "That is not an awtsmoos array!"
        }
    }
    let arr = [];

    let length = readConditional(arrayBuffer, magic.length);

    let currentOffset = length.offset;
    var sizeAmount = readConditional(arrayBuffer, currentOffset);
    currentOffset = sizeAmount.offset;
  //  console.log("Array length: ",length)
    var elementSize = sizeAmount.amount;
    currentOffset += elementSize * length.amount * 2
    for (let i = 0; i < length.amount; i++) {
        if(isNaN(currentOffset)) {
            console.log("NAN", arrayBuffer,i,length);;
            return;
        }
        let valueLength = readConditional(
            arrayBuffer,
            currentOffset
        );

        currentOffset = valueLength.offset;

        var type = arrayBuffer.readUInt8(currentOffset);
        
        currentOffset++;
        var value;
        value = arrayBuffer.subarray(
            currentOffset , 
            currentOffset  + valueLength.amount
        );
        var valUpdate  = parseValueFromType({
            value,
            type,
            currentOffset
        })
        value = valUpdate.value;
        if(!isNaN(valUpdate.currentOffset))
            currentOffset = valUpdate.currentOffset
        arr.push(value);
      
       // console.log("Pushed",arr,value,currentOffset,type,valueLength)
    }
    return arr;
}

function parseValueFromType({
    value,
    type,
    currentOffset
}) {
    if(type == 1) {

        currentOffset += value.length
        value = deserializeBinary(value)

    } else if(type == 2) {
        
        currentOffset += value.length
        value = value+""
    } else if (type == 3) {

        currentOffset += value.length
        value = deserializeArray(value);
        
    } else if (type == 4) {
        var info = readConditional(value)
        value = info.amount;
        currentOffset += info.offset
    } else if(type == 5) {
  //      console.log("VAL",value)
        value = !!value.readUInt8(0);
        currentOffset += 1

    } else if(type == 6) {
        value = undefined;
    } else if(type == 7) {
        value = null;
    } else if(type == 8) {
        currentOffset += value.length
        value = Buffer.from(value)
    }
    return {value,currentOffset};
}



async function getKeysFromBinary(buffer) {
    
    var wrap = null;
    if(typeof(buffer) == "string") {
        wrap = new binaryFileWrapper(buffer);
      
    }
    if(wrap) {
        return await wrap.getKeys();
    }
    let offset = 0;
    let keys = [];
    var magic = buffer.subarray(0, magicJSON.length).toString();
    offset = magic.length;
    if(magic == magicJSON) {
        var hashInfo = readConditional(buffer,offset)
        let hashTableSize = hashInfo.amount;
    // let hashTableSize = buffer.readUInt32LE(offset);
        offset = hashInfo.offset;
        
        for (let i = 0; i < hashTableSize; i++) {
            let keyOffset = buffer.readUInt32LE(offset);
            offset += hashAmount;
            if (keyOffset !== 0) {
                var keyInfo = readConditional(buffer, keyOffset)
                let keyLength = keyInfo.amount;
                keyOffset = keyInfo.offset;
                let key = buffer.toString('utf8', keyOffset, keyOffset + keyLength);
                keys.push(key);
            }
        }
        
    } else if(magic == magicArray) {
        var arLengthInfo = readConditional(buffer,offset);
        var arrayLength = arLengthInfo.amount;
        return Array.from({length:arrayLength}).map((q,i)=>i)

    }
    return keys;
}





async function getValueByKey(buffer, key) {
    var wrap = null;
    if(typeof(buffer) == "string") {
        wrap = new binaryFileWrapper(buffer);
      
    }
    if(wrap) {
        return await wrap.getValueByKey(key);
    }
    var magic = buffer.subarray(0, magicArray.length).toString();

    var offset = magic.length;
    if(magic == magicJSON) {
        var hashInfo = readConditional(buffer,offset)
        let hashTableSize = hashInfo.amount;
        offset = hashInfo.offset;
        let index = hashKey(key, hashTableSize);
        for (let i = 0; i < hashTableSize; i++) {
            let keyOffset = buffer.readUInt32LE(offset);
            offset += hashAmount;
            if (keyOffset == 0) continue;
            if(index == i) {
                var keyInfo = readConditional(buffer,keyOffset)
                let keyLength = keyInfo.amount;
                keyOffset = keyInfo.offset;

                let storedKey = buffer.toString('utf8', keyOffset, keyOffset + keyLength);
                if (storedKey === key) {
                    var value = parseValueFromKey({
                        keyOffset,
                        keyLength,
                        buffer
                    })
                    return value;
                }
                return {error: {
                    storedKey, key
                }}
                break;
            } 
            return {error: {
                index,keyOffset,hashInfo: hashInfo.amount,
                idx: hashInfo.offset,key,hashTableSize
            }}
        }
    } else if(magic != magicArray) {
        return {
            awtsmoosError: "Not a real file!"
        }
    }
    var arLengthInfo = readConditional(buffer, offset);

    offset = arLengthInfo.offset;
    var lng = arLengthInfo.amount;
    var sizeReading = readConditional(buffer, offset)
    
    var size = sizeReading.amount;
    offset = sizeReading.offset;
    var keyOffset = buffer.subarray(
        offset + size * 2 * key,
        offset + size * 2 * (key + 1)
    );
   // console.log(logBuffer(keyOffset),size,sizeReading)

    var offsetAmount = keyOffset.subarray(
        size, size+1
    )
    var val = readFromBuffer(offsetAmount);
    var bufSize = readConditional(buffer, val);
    offset = bufSize.offset;
    
    var type = buffer.readUInt8(offset);
    offset++;
    var valAmount = buffer.subarray(
        offset,
        offset+bufSize.amount
    )
    var parst =  parseValueFromType({
        value: valAmount,
        type,
        currentOffset: offset
    })

    return parst.value
    
   
}



async function getValuesFromBinary(buffer, keys) {
    var wrap = null;
    if(typeof(buffer) == "string") {
        wrap = new binaryFileWrapper(buffer);
      
    }
    var obj = {};
    for(var w of keys) {
        obj[w] = wrap ? 
        await wrap.getValueByKey(w) : 
        getValueByKey(buffer, w)
    }
    return obj;
}

async function mapBinary(path, mapObj) {
    var p = new binaryFileWrapper(path);
    return await p.mapBinary(mapObj);
}
module.exports = { 
    getValueByKey, 
    logBuffer, 
    serializeJSON, 
    deserializeBinary,

    getKeysFromBinary, 
    getValuesFromBinary,
    mapBinary,
    
    isAwtsmoosObject
};
