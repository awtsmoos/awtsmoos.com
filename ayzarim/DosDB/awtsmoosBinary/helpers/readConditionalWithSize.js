//B"H

/**
 * @method readConditionalWithSize
 * @description Reads a value with specified size, adapting to the Awtsmoos’ precision.
 * @param {Buffer} buffer - Source buffer
 * @param {number} offset - Starting offset
 * @param {number} size - Known size in bytes
 * @returns {Promise<{amount: number, offset: number}>} - Value and new offset
 */
async function readConditionalWithSize(buffer, offset, size) {
    let amount;
    if (size === 1) amount = buffer.readUInt8(offset);
    else if (size === 2) amount = buffer.readUInt16BE(offset);
    else if (size === 4) amount = buffer.readUInt32BE(offset);
    else if (size === 8) amount = readUInt64BE(buffer, offset);
    else throw new Error("Unsupported length size: " + size);
    return { amount, offset: offset + size };
}

module.exports = readConditionalWithSize;