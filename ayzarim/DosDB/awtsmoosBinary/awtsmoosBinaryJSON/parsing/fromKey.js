//B"H



var 
    readConditional
 = require("../helpers/readConditional.js")

 function parseValueFromKey({
    keyOffset,
    keyLength,
    buffer
}={}) {
    let valueOffset = keyOffset + keyLength;
    let valueType =  buffer.readUInt8(valueOffset);
    valueOffset++;
    var valueLength;
    if(valueType == 0x05) {
        valueLength = {offset:valueOffset+1, amount:1};
    } else if(valueType == 0x06 || valueType == 0x07) {
        valueLength = {
            offset: valueOffset,
            amount: 0
        }
    } else valueLength =  readConditional(
        buffer,
        valueOffset
    )
    
    valueOffset = valueLength.offset;
    var value =  buffer.subarray(
        valueOffset, 
        valueOffset + valueLength.amount
    );
 
    if (valueType === 0x01) {
        /**
         * object type
         */
        
        
        value =  deserializeBinary(value)
    } else if (valueType === 0x02) {
        /**
         * regular type
         */
        
        value = value.toString();
        try {
            value = JSON.parse(value)
        } catch(e) {

        }
    } else if (valueType === 0x03) {
        
        value =  deserializeArray(value);
    } else if(
        valueType == 0x04
    ) {
        value = ( readConditional(value)).amount;
    } else if(
        valueType == 0x05
    ) {
            value = true
        
    } else if(valueType == 0x00) {
        value = false;    
    } else if(
        valueType == 0x06
    ) {
        
            value = undefined;
        
    } else if(
        valueType == 0x07
    ) {
        
            value = null
        
    } else if(
        valueType == 0x08
    ) {
        //nothing. technically buffer, but still
    }
    return value;
}

module.exports = parseValueFromKey;