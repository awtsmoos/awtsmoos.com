//B"H


function writeConditional(amount) {
    var offset = 0;
    var typeBuffer;
    var amountBuffer;
    var size = 1;
    if(hasDecimal(amount)) {
        if(needsDoublePrecision(amount)) {
            typeBuffer = Buffer.alloc(1);
            typeBuffer.writeUInt8(5);

            size = 8;
            amountBuffer = Buffer.alloc(8);
            amountBuffer.writeDoubleBE(amount, 0);
            
        } else {
            typeBuffer = Buffer.alloc(1);
            typeBuffer.writeUInt8(4);

            size = 4;
            amountBuffer = Buffer.alloc(4);
            amountBuffer.writeFloatBE(amount, 0);
        }
    } else if(amount < 256) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(0);

     
        amountBuffer = Buffer.alloc(1);
        amountBuffer.writeUInt8(amount);

        
    } else if(amount >= 256 && amount < 65536) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(1, 0);

        size = 2;
        amountBuffer = Buffer.alloc(2);
        amountBuffer.writeUInt16BE(amount, 0);

      
    } else if(amount >= 65536 && amount <= 4294967296) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(2, 0);

        size = 4;
        amountBuffer = Buffer.alloc(4);
        amountBuffer.writeUInt32BE(amount, 0);
    } else if(
        amount >= 4294967296 && amount <= 18446744073709552000n
    ) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(3, 0);

        size = 8;
        amountBuffer = Buffer.alloc(8);
        writeUInt64BE(amountBuffer, amount, 0);
    }
    var buffer = Buffer.concat([
        typeBuffer,
        amountBuffer
    ])
    offset +=  buffer.length;
    return {buffer, offset, size}
}

module.exports = writeConditional;