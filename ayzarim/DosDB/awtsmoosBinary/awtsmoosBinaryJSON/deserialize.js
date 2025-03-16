//B"H


var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants.js");


var {
    readConditional
} = require("../awtsmoosBinaryHelpers.js");


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

        var valueLength;
        try {
            valueLength = await readConditional(
                arrayBuffer,
                currentOffset
            );
        } catch(e) {
            console.log("ARRAY issue", e,currentOffset,arrayBuffer);
            throw new Error("What are u even")
        }

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
console.log(
    "byne",deserializeBinary
)



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
        try {
            var info = await readConditional(value)
            value = info.amount;
            currentOffset += info.offset
        } catch(e) {
            console.log(
                "ISSUE! reading. want to nkow",
                value,
                e
            )
            throw new Error("Wow..")
        }
    } else if(type == 5) {
  //      console.log("VAL",value)
        value = !!value.readUInt8(0);
        currentOffset += 1

    } else if(type == 6) {
        value = undefined;
    } else if(type == 7) {
        value = null;
    } else if(type == 8) {
        currentOffset += value.length;


        value = Buffer.from(value)
    }
    return {value,currentOffset};
}


module.exports = {
    deserializeBinary,
    deserializeArray,

    parseValueFromKey,
    parseValueFromType
}