//B"H

/**
 * @method readConditionalWithSize
 * @description Reads a value with specified size, adapting to the Awtsmoos’ precision.
 * @param {Buffer} buffer - Source buffer
 * @param {number} offset - Starting offset
 * @param {number} size - Known size in bytes
 * @returns {Promise<{amount: number, offset: number}>} - Value and new offset
 */
async function readConditional(buffer, offset = 0, size = null) {
    if (size !== null) {
        let amount;
        if (size === 1)
            amount = await buffer.readUInt8(offset);
        else if (size === 2)
            amount = await buffer.readUInt16BE(offset);
        else if (size === 4)
            amount = await buffer.readUInt32BE(offset);
        else if (size === 8)
            amount = await readUInt64BE(buffer, offset);
        else
            throw new Error("Unsupported length size: " + size);
        
        return {
            amount,
            offset: offset + size,
            size
        };
    } else {
        var typeBuf = await buffer.readUInt8(offset);
        offset++;
        var size = 1;
        var am = null;
        switch(typeBuf) {
            case 0:
                am = await buffer.readUInt8(offset);
                offset++;
                break;
            case 1:
                am = await buffer.readUInt16BE(offset);
                offset += 2;
                size = 2;
                break;
            case 2:
                am = await buffer.readUInt32BE(offset);
                offset += 4;
                size = 4;
                break;
            case 3:
                am = await readUInt64BE(buffer, offset);
                offset += 8;
                size = 8;
                break;
            case 4:
                am = await buffer.readFloatBE(offset);
                offset += 4;
                size = 4;
                break;
            case 5:
                am = await buffer.readDoubleBE(offset);
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
module.exports = readConditional;