
// B"H
/**
 * @file serialization/array.js
 * @description
 *  The Sefirah of Tiferet - The Sequence of Creation.
 *  Serializes an array into binary items with a high-speed index table.
 */

const constants = require("../../../constants.js");
const { writeConditional } = require("../../../utils/binary/helpers.js");

let valueSerializer = null;

function serializeArray(arr) {
    if (!valueSerializer) valueSerializer = require("./value.js");

    const parts = [Buffer.from(constants.MAGIC_ARRAY)];
    const configByteBuf = Buffer.alloc(1);
    parts.push(configByteBuf);

    const dataBuffers = [];
    for (let i = 0; i < arr.length; i++) {
        dataBuffers.push(valueSerializer(arr[i], true));
    }

    let currentOffset = constants.MAGIC_ARRAY.length + 1;
    const offsets = [];
    for (let i = 0; i < dataBuffers.length; i++) {
        offsets.push(currentOffset);
        currentOffset += dataBuffers[i].length;
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
