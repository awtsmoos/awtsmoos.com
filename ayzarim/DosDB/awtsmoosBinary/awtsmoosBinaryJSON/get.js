//B"H

var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants.js");


var {
    parseValueFromKey
} = require("./deserialize.js")


var {
    readFromBuffer,
    readConditional,

    hashKey
} = require("../awtsmoosBinaryHelpers.js")

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

module.exports = {
    getKeysFromBinary,
    getValuesFromBinary,
    getArrayValueAtKey,
    getKeyByHashing,
    getValueByKey,
    parseValueFromKey
}