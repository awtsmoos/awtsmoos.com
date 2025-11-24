//B"H

/**
 * @method readConditional
 * @description Reads a value with specified size, adapting to the Awtsmoos’ precision.
 * @param {Buffer} buffer - Source buffer
 * @param {number} offset - Starting offset
 * @param {number} size - Known size in bytes
 * @returns {Promise<{amount: number, offset: number}>} - Value and new offset
 */
function readConditional(buffer, offset = 0, size = null) {
    if (size !== null) {
        let amount;
        if (size === 1)
            amount =  buffer.readUInt8(offset);
        else if (size === 2)
            amount =  buffer.readUInt16BE(offset);
        else if (size === 4)
            amount =  buffer.readUInt32BE(offset);
        else if (size === 8)
            amount =  readUInt64BE(buffer, offset);
        else
            throw new Error("Unsupported length size: " + size);
        
        return {
            amount,
            offset: offset + size,
            size
        };
    } else {
        var typeBuf =  buffer.readUInt8(offset);
        offset++;
        var size = 1;
        var am = null;
        switch(typeBuf) {
            case 0:
                am =  buffer.readUInt8(offset);
                offset++;
              //  console.trace("GOT",offset,am, buffer)
                break;
            case 1:
                am =  buffer.readUInt16BE(offset);
                offset += 2;
                size = 2;
                break;
            case 2:
                am =  buffer.readUInt32BE(offset);
                offset += 4;
                size = 4;
                break;
            case 3:
                am =  readUInt64BE(buffer, offset);
                offset += 8;
                size = 8;
                break;
            case 4:
                am =  buffer.readFloatBE(offset);
                offset += 4;
                size = 4;
                break;
            case 5:
                am =  buffer.readDoubleBE(offset);
                offset += 8;
                size = 8;
                break;
        }
        return {
            amount: am,
            offset,
            size
        };
    }

}

/**
 * 
 * @param {Buffer} buffer 
 * @param {UInt} offset 
 * @param {byte size to read (UInt)} size 
 * @returns uint 
 */
readConditional.readUIntBuffer = (buffer, offset, size) => {
    var red = readConditional(buffer, offset, size);
    return red.amount;
};

module.exports = readConditional;