
/**
 * @file scribe.js
 * @chapter The Chisel of atoms
 * @description
 * Pure JavaScript primitives (Strings, Numbers, Bools) are the atoms.
 * They need specific garments to reside in physical disk space.
 * 
 * This scribe takes a JS value and determines its binary form,
 * applying Omni-Compression to strings containing the chaos character.
 */

const constants = require('../../../constants.js');
const Pointer = require('../../../utils/pointer/crown.js');
const Omni = require('../../../utils/compression/omni.js');

class PrimitiveScribe {
    constructor(allocator) {
        this.allocator = allocator;
        this.pager = allocator.pager;
    }

    /**
     * @description Materializes a primitive value and returns its coordinate crown.
     */
    save(val) {
        const T = constants.VAL_TYPE;
        let buf = Buffer.alloc(0);
        let type = T.NULL;

        if (typeof val === 'string') {
            if (val.indexOf('\x07') !== -1) {
                buf = Omni.pack(val);
                type = T.STRING_OMNI;
            } else {
                buf = Buffer.from(val, 'utf8');
                type = T.STRING;
            }
        } else if (typeof val === 'number') {
            buf = Buffer.allocUnsafe(8);
            buf.writeDoubleBE(val);
            type = T.NUMBER;
        } else if (typeof val === 'boolean') {
            buf = Buffer.from([val ? 1 : 0]);
            type = T.BOOLEAN;
        } else if (val instanceof Date) {
            buf = Buffer.allocUnsafe(8);
            buf.writeDoubleBE(val.getTime());
            type = T.DATE;
        } else if (Buffer.isBuffer(val)) {
            buf = val;
            type = T.BUFFER;
        } else if (typeof val === 'function') {
            let fnSource = '';
            try {
                fnSource = Function.prototype.toString.call(val);
            } catch (_err) {
                try {
                    fnSource = String(val);
                } catch (_err2) {
                    fnSource = 'function(){ return undefined; }';
                }
            }
            buf = Buffer.from(fnSource, 'utf8');
            type = T.FUNCTION;
        }

        const loc = this.allocator.allocate(buf.length);
        this.pager.writeExact(loc.offset, buf);
        return Pointer.encode(type, loc.offset, buf.length);
    }
}

module.exports = PrimitiveScribe;
