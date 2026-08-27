
// B"H
/**
 * @file array.js
 * @description
 *  The Sefirah of Tiferet - The Sequence of Creation.
 *  Serializes an array into binary items with an index table.
 */

const constants = require("../../../constants.js");
const { writeConditional } = require("../../../utils/binaryHelpers.js");

function serializeArray(arr) {
    // Requires directly inline to dodge the circular dragons of Chaos
    const serializeValue = require("./serializeValue.js");

    const parts = [Buffer.from(constants.MAGIC_ARRAY)];
    const configByteBuf = Buffer.alloc(1);
    parts.push(configByteBuf);

    const dataBuffers = [];
    for (let item of arr) {
        dataBuffers.push(serializeValue(item, true));
    }

    let currentOffset = constants.MAGIC_ARRAY.length + 1;
    const offsets = [];
    for (let buf of dataBuffers) {
        offsets.push(currentOffset);
        currentOffset += buf.length;
    }

    const offsetSize = currentOffset < 256 ? 1 : currentOffset < 65536 ? 2 : 4;
    const lenInfo = writeConditional(arr.length);
    
    const getIndex = (sz) => {
        if (sz === 1) return 0; if (sz === 2) return 1;
        if (sz === 4) return 2; return 3; 
    };

    const packed = (getIndex(lenInfo.size) << 2) | getIndex(offsetSize);
    configByteBuf.writeUInt8(packed, 0);

    const indexTable = Buffer.alloc(arr.length * offsetSize);
    for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i]; const pos = i * offsetSize;
        if (offsetSize === 1) indexTable.writeUInt8(off, pos);
        else if (offsetSize === 2) indexTable.writeUInt16BE(off, pos);
        else if (offsetSize === 4) indexTable.writeUInt32BE(off, pos);
    }

    return Buffer.concat([
        Buffer.concat(parts),
        Buffer.concat(dataBuffers),
        indexTable,
        lenInfo.buffer
    ]);
}

module.exports = serializeArray;
