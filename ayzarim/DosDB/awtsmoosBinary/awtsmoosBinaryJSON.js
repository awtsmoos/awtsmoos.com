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
var fileBuffer = require("./fileBuffer.js");

var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants");
var binaryFileWrapper = require("./binaryFileClassWrapper.js");

async function isAwtsmoosObject(buffer) {
    if(typeof(buffer) == "string") {
        buffer = new fileBuffer(buffer);
    }
    var mag = await buffer.subarray(0,2).toString()
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
            keyIndex.writeUInt32BE(keyOffset, 0);
            hashTableBuffer.set(keyIndex, index * hashAmount);
        }
        
        return startOffset;
    }

    

    writeData(json);
    return Buffer.concat(bufferList);
}

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
        let hashTable = new Array(hashTableSize);
        
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

async function parseValueFromKey({
    keyOffset,
    keyLength,
    buffer
}={}) {
    let valueOffset = keyOffset + keyLength;
    let valueType = await buffer.readUInt8(valueOffset);
    valueOffset++;
    var valueLength;
    if(valueType == 0x05) {
        valueLength = {offset:valueOffset+1, amount:1};
    } else if(valueType == 0x06 || valueType == 0x07) {
        valueLength = {
            offset: valueOffset,
            amount: 0
        }
    } else valueLength = await readConditional(
        buffer,
        valueOffset
    )
    
    valueOffset = valueLength.offset;
    var value = await buffer.subarray(
        valueOffset, 
        valueOffset + valueLength.amount
    );
  //  console.log("Amount",buffer,value,valueOffset,valueLength)
    
    if (valueType === 0x01) {
        /**
         * object type
         */
        
        //buffer.readUInt32LE(valueOffset + 1);
        
        value = await deserializeBinary(value)
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
        value = await deserializeArray(value);
    } else if(
        valueType == 0x04
    ) {
        value = (await readConditional(value)).amount;
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


async function deserializeArray(arrayBuffer) {
    var magic = await arrayBuffer.subarray(0, magicArray.length).toString();
    if(magic != magicArray) {
        return {
            awtsmoosError: "That is not an awtsmoos array!"
        }
    }
    let arr = [];

    let length = await readConditional(arrayBuffer, magic.length);

    let currentOffset = length.offset;
    var sizeAmount = await readConditional(arrayBuffer, currentOffset);
    currentOffset = sizeAmount.offset;
  //  console.log("Array length: ",length)
    var elementSize = sizeAmount.amount;
    currentOffset += elementSize * length.amount * 2
    for (let i = 0; i < length.amount; i++) {
        if(isNaN(currentOffset)) {
            console.log("NAN", arrayBuffer,i,length);;
            return;
        }
        let valueLength = await readConditional(
            arrayBuffer,
            currentOffset
        );

        currentOffset = valueLength.offset;

        var type = await arrayBuffer.readUInt8(currentOffset);
        
        currentOffset++;
        var value;
        value = await arrayBuffer.subarray(
            currentOffset , 
            currentOffset  + valueLength.amount
        );
        var valUpdate  = await parseValueFromType({
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

async function parseValueFromType({
    value,
    type,
    currentOffset
}) {
    if(type == 1) {

        currentOffset += value.length
        value = await deserializeBinary(value)

    } else if(type == 2) {
        
        currentOffset += value.length
        value = value+""
    } else if (type == 3) {

        currentOffset += value.length
        value = await deserializeArray(value);
        
    } else if (type == 4) {
        var info = await readConditional(value)
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
       // wrap = new binaryFileWrapper(buffer);
       buffer = new fileBuffer(buffer);
    }
    if(wrap) {
        return await wrap.getKeys();
    }
    
   
    var magic = (await buffer.subarray(0, magicArray.length)).toString();
    let offset = magic.length;
  //  console.log("\n\n\n\n\nMAGIC,\n",magic)
    if(magic == magicJSON) {

        
        let obj = {};
        // console.log("READING",offset, buffer,logBuffer(buffer),buffer.toString())
        var hashInfo = await readConditional(buffer,offset)
        var hashTableSize = hashInfo.amount;
      //  console.log("\n\n\nHash info\n",hashInfo)
        //buffer.readUInt32LE(offset);
        offset = hashInfo.offset;
        let hashTable = new Array(hashTableSize);
        
        for (let i = 0; i < hashTableSize; i++) {
            let keyOffset = await buffer.readUInt32BE(offset);
            offset += hashAmount;
            if (keyOffset !== 0) hashTable[i] = keyOffset;
        }
       // console.log("\n\nHash table\n",hashTable)
        var keys = [];
        for (let keyOffset of hashTable) {
            if (keyOffset) {
                var keyInfo = await readConditional(buffer,keyOffset)
                let keyLength = keyInfo.amount;
                keyOffset = keyInfo.offset;
               // console.log("\n\n\nkey info\n",keyInfo)
                //buffer.readUInt16LE(keyOffset);
                let key = await buffer.subarray(keyOffset, keyOffset + keyLength);
               // console.log("\n\n\nkey\n",key)
                keys.push(key+"");
            }
        }
        return keys;




        
    } else if(magic == magicArray) {
        var arLengthInfo = await readConditional(buffer,offset);
        var arrayLength = arLengthInfo.amount;
        return Array.from({length:arrayLength}).map((q,i)=>i)

    }
    return keys;
}




function flipEndianness32bit(value) {
    // Convert the value to a 32-bit buffer
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);
  
    // Read it back as a Big Endian value
    const flippedValue = buffer.readUInt32LE(0);
  
    return flippedValue;
  }
async function getValueByKey(buffer, searchKey) {
 
    if(typeof(buffer) == "string") {
        buffer = new fileBuffer(buffer);
    }
   
    var magic = (await buffer.subarray(0, magicArray.length)).toString();

    var offset = magic.length;
    if(magic == magicJSON) {
        
        let offset = magic.length;
        let obj = {};
       // console.log("READING",offset, buffer,logBuffer(buffer),buffer.toString())
        var hashInfo = await readConditional(buffer,offset)
        let hashTableSize = hashInfo.amount;

        //buffer.readUInt32LE(offset);
        offset = hashInfo.offset;
        

        
        

       
        
        var foundKey = await getKeyByHashing({
            buffer,
            key: searchKey,
            hashTableSize,
            hashInfo,
            hashAmount
        });

        var hashOffset = foundKey.hash;
        var hashValueFromTable = await buffer.readUInt32BE(
            hashInfo.offset + hashOffset * hashAmount
        )
      //  console.log("\nHasht\n\n", "red",hashOffset,hashValueFromTable, foundKey, searchKey,"tab",hashTable)

        
        
        if (hashValueFromTable) {
            var keyInfo = await readConditional(buffer,hashValueFromTable)
            let keyLength = keyInfo.amount;
            var keyOffset = keyInfo.offset;
        
            let key = await buffer.toString('utf8', keyOffset, keyOffset + keyLength);
            if(key == searchKey) {
                
                var value = await parseValueFromKey({
                    keyOffset,
                    keyLength,
                    buffer
                })
                return value;

            }
            
        }
    
        return null;

    } else if(magic != magicArray) {
        return {
            real: magic,
            awtsmoosError: "Not a real file!"
        }
    }

    return await getArrayValueAtKey(buffer, searchKey, magic);
    
   
}

async function getKeyByHashing({
    buffer,
    key,
    hashTableSize,
    hashInfo,
    hashAmount
}) {
    var hasht = hashKey(key, hashTableSize);  // Calculate the initial hash
    var foundKey = null;

    while (true) {
        let readHash = await buffer.readUInt32BE(hashInfo.offset + hashAmount * hasht);
        
        // If the hash value is 0, that means it's an empty slot, stop looking
        if (readHash === 0) {
            break;
        }

        foundKey = await getKeyAtOffset({
            buffer,
            offset: readHash
        }) 

        // If found the correct key, return it
        if (foundKey === key) {
            return {
                key: foundKey,
                hash: hasht,
                inputKey: key
            };
        }

        // Handle collision: if the key at this slot doesn't match, move to the next slot
        hasht = (hasht + 1) % hashTableSize;  // Linear probing, move to next index
    }

    // If we exit the loop without finding the key, it means the key wasn't found
    return {
        key: null,
        hash: hasht,
        inputKey: key
    };
}

async function getKeyAtOffset({
    buffer,
    offset
}) {
    var keyInfo = await readConditional(buffer,offset)
    let keyLength = keyInfo.amount;
    offset = keyInfo.offset;

   return await buffer.toString('utf8', offset, offset + keyLength);
}

async function getArrayValueAtKey(buffer, searchKey, magic) {
    if(typeof(searchKey) != "number") {
        return console.log("NOT a key",searchKey);
    }
    var arrayBuffer = buffer;

    // Step 1: Read Length
    var length = await readConditional(arrayBuffer, magic.length);
    var currentOffset = length.offset;
    var lengthAmount = length.amount;


    // Step 2: Read Size Amount
    var sizeAmount = await readConditional(arrayBuffer, currentOffset);
    currentOffset = sizeAmount.offset;
    var elementSize = sizeAmount.amount;

    // Step 3: Compute Key Table Offsets
    var keyTableStart = currentOffset; // Key table starts here
  
    
    var valueOffset = await readFromBuffer(
        arrayBuffer,
        keyTableStart + searchKey * elementSize * 2 + elementSize /*get value offset*/,
        elementSize
    )
    var keyTableLength = lengthAmount * elementSize * 2 ;
  
    //console.log("value offset?",valueOffset,valueOffset,"keyTable length",keyTableLength)
    
    let valueLength = await readConditional(
        arrayBuffer,
        valueOffset
    );

   // console.log("Read it",valueLength)

    currentOffset = valueLength.offset;

    var type = await arrayBuffer.readUInt8(currentOffset);
    
    currentOffset++;
    var value;
    value = await arrayBuffer.subarray(
        currentOffset , 
        currentOffset  + valueLength.amount
    );
    var valUpdate  = await parseValueFromType({
        value,
        type,
        currentOffset
    })
    value = valUpdate.value;
    return value;
}

async function getValuesFromBinary(buffer, keys) {
    var wrap = null;
    if(typeof(buffer) == "string") {
      //  wrap = new binaryFileWrapper(buffer);
      buffer = new fileBuffer(buffer);
    }
    var obj = {};
    for(var w of keys) {
        obj[w] = wrap ? 
        await wrap.getValueByKey(w) : 
        await getValueByKey(buffer, w)
    }
    return obj;
}

async function mapBinary(buffer, mapObj) {
    if(typeof(buffer) == "string") /**
     * reading path from file and 
        not buffer in this case
     */ 
        buffer = new fileBuffer(buffer);
    /**
     * use functions getValueByKey(buffer,key) (
     * gets serialized json value at the key)
     * 
     * and getKeysFromBinary(buffer) to get root 
     * level keys
     * 
     * use custom functions and recursion to 
     * map the object without loading the 
     * entire thing into memeory
     * 
     * For example if the source BSON object would
     * serialize hypothetically to
     * {a:4, B:7, D: 8, C: {
     *  ok: "asdf", lol:6,
     * mo: 3
     * }}
     * and mapObj is {
     *  a: true,
     * D: {
     * equals: 8
     * },
     * C: {
     *  ok: {
     *      includes: "asd"
     *  },
     * lol:true
     * }
     * }
     * 
     * then result would be 
     * 
     * {a: 4, D: 8, C:{ok: "asdf", lol:6}}
     * 
     * BUT if the C.ok is "sdf" or 
     * does not contain "asd" OR if D is NOT equal to 8
     *  then the
     * ENTIRE result of the entir ething
     * is null
     * 
     * but the getKeysFromBinary 
     * and getValueByKey only work for
     * the root level which is working 
     * with a binary but once u start
     * parsing values then u get
     * SERIALZIED values including serialzied jss objects
     * so u can't use those functions after the ROOT
     * level only one time to get root level
     * values and if one of the reuslts is an object
     * then u have to use
     * other logic to recsurively map it 
     * 
     * 
     */

    // Function to recursively filter values according to the mapObj rules
    async function filterMap(currentValue, mapConfig) {
        if (typeof(currentValue) === 'object' && currentValue !== null) {
            // Recursively handle nested objects
            let result = {};
            for (let key in currentValue) {
                if (mapConfig[key]) {
                    let keyConfig = mapConfig[key];
                    let value = currentValue[key];

                    // Check if the value meets conditions in the mapObj for this key
                    let valid = true;

                    // Handle the "equals" condition if present
                    if (keyConfig.equals && value !== keyConfig.equals) {
                        valid = false;
                    }

                    // Handle the "includes" condition if present
                    if (keyConfig.includes && !value.includes(keyConfig.includes)) {
                        valid = false;
                    }

                    if (valid) {
                        result[key] = await filterMap(value, keyConfig); // Recurse for objects
                    } else {
                        return null; // If any condition fails, return null
                    }
                }
            }
            return result;
        } else {
            // Base case: it's a value (not an object)
            return currentValue;
        }
    }

    // Start by getting the root-level keys from the binary data
    var keys = await getKeysFromBinary(buffer);

    var filteredResult = {};
   // console.log("KEYS?",keys)
   if(!Array.isArray(keys)) {
    console.log("WHAT is this",keys)
    filteredResult.wtsmoosificationalism = {
        errorL: "What happened",
        keys
    }
    keys = []
   }
    for (let key of keys) {
        if (mapObj[key]) {
            const mapConfig = mapObj[key];
            let value = await getValueByKey(buffer, key);

            // If the value is an object, recurse into it
            if (typeof value === 'object' && value !== null) {
                filteredResult[key] = await filterMap(value, mapConfig);
            } else {
                // Directly check if the value matches the condition
                let valid = true;
                
                // Handle the "equals" condition if present
                if (mapConfig.equals && value !== mapConfig.equals) {
                    valid = false;
                }

                // Handle the "includes" condition if present
                if (mapConfig.includes && !value.includes(mapConfig.includes)) {
                    valid = false;
                }

                if (valid) {
                    filteredResult[key] = value;
                } else {
                    return null; // If any condition fails, return null
                }
            }
        }
    }

    return Object.keys(filteredResult).length === 0 ? null : filteredResult;

}

module.exports = { 
    getValueByKey, 
    logBuffer, 
    serializeJSON, 
    deserializeBinary,

    getKeysFromBinary, 
    getValuesFromBinary,
    mapBinary,
    fileBuffer,

    isAwtsmoosObject
};
