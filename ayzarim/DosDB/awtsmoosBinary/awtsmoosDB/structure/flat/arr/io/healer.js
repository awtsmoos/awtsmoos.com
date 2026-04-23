
// B"H
const constants = require('../../../../constants.js');

class ArrayHealer {
    static heal(flatArray) {
        if (!flatArray.ptr || flatArray.ptr.blockId === undefined) {
            this.createRoot(flatArray);
        }
        
        let buf = flatArray.allocator.db._readChainSafe(flatArray.ptr);
        
        if (!buf) {
            this.createRoot(flatArray);
            buf = flatArray.allocator.db._readChainSafe(flatArray.ptr);
            if (!buf) {
                buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
                buf.write("FLTA", 0);
                buf.writeUInt32BE(0, 4);
            }
        }
        return buf;
    }

    static createRoot(flatArray) {
        flatArray.ptr = flatArray.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        buf.write("FLTA", 0);
        buf.writeUInt32BE(0, 4); 
        flatArray.allocator.db._writeChainSafe(flatArray.ptr, buf);
        flatArray.ptr.type = constants.VAL_TYPE.SMART_ARRAY;
    }
}
module.exports = ArrayHealer;
