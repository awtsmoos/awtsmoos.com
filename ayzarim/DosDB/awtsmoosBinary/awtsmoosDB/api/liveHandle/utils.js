// B"H
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

const TYPE_RAW = 1;
const TYPE_BTREE = 2;
const TYPE_COLLECTION = 3;
const SB_ROOT_PTR_OFFSET = 64;

function _writePtr(buf, offset, ptr) {
    if (!ptr) throw new Error("B\"H: Cannot write null pointer");
    writePointer48(buf, ptr.blockId, offset);
    buf.writeUInt32BE(ptr.offset, offset + 6);
    buf.writeUInt32BE(ptr.length, offset + 10);
    buf.writeUInt8(ptr.isChain ? 1 : 0, offset + 14);
}

function _readPtr(buf, offset) {
    if (!buf || offset >= buf.length) return null;
    if (offset + 15 > buf.length) return null;

    const blockId = readPointer48(buf, offset);
    const o = buf.readUInt32BE(offset + 6);
    const l = buf.readUInt32BE(offset + 10);
    const c = buf.readUInt8(offset + 14);
    
    if (l === 0) return null;
    if (blockId === 0 && o === 0) return null;

    return { blockId, offset: o, length: l, isChain: c === 1 };
}

module.exports = {
    TYPE_RAW,
    TYPE_BTREE,
    TYPE_COLLECTION,
    SB_ROOT_PTR_OFFSET,
    _writePtr,
    _readPtr
};
