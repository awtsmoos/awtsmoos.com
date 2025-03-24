//B"H



var {
    readConditional
} = require("../../awtsmoosBinaryHelpers.js");

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
            value = true
        
    } else if(valueType == 0x00) {
        value = false;    
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

module.exports = parseValueFromKey;