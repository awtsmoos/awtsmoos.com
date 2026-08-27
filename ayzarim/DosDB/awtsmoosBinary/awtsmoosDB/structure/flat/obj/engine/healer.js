
// B"H
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectHealer {
    static heal(flat) {
        if (!flat.ptr || flat.ptr.blockId === undefined) this.birth(flat);
        let buf = flat.allocator.db._readChainSafe(flat.ptr);
        if (!buf) {
            this.birth(flat);
            buf = flat.allocator.db._readChainSafe(flat.ptr);
            if (!buf) {
                buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
                buf.write("FLTO", 0);
                buf.writeUInt16BE(0, 4);
            }
        }
        return buf;
    }
    static birth(flat) {
        flat.ptr = flat.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        buf.write("FLTO", 0);
        buf.writeUInt16BE(0, 4);
        flat.allocator.db._writeChainSafe(flat.ptr, buf);
        flat.ptr.type = constants.VAL_TYPE.SMART_OBJECT;
    }
}
module.exports = ObjectHealer;
