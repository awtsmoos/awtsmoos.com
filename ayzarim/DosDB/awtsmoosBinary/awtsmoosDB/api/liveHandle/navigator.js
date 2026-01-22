// B"H
/**
 * @file navigator.js
 * @description Synchronous property discovery. Purged of verbose noise.
 */
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class Navigator {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    navigate(key, ptr = null, type = null) {
        const HandleRegistry = require('../../core/handleRegistry.js');
        return HandleRegistry.createHandle(this.db, ptr, type, { parent: this.handle.self, key });
    }

    resolveStructPtr() {
        if (this.handle.ptr) {
            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && (decoded.mode === constants.MODE_BLOCK || decoded.mode === constants.MODE_HEAP)) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    length: (decoded.mode === constants.MODE_BLOCK) ? decoded.payload.readUInt32BE(6) : decoded.payload.readUInt32BE(10),
                    offset: (decoded.mode === constants.MODE_BLOCK) ? decoded.payload.readUInt32BE(10) : decoded.payload.readUInt32BE(6),
                    isChain: (decoded.mode === constants.MODE_BLOCK) && decoded.payload.readUInt8(14) === 1
                };
            }
        }
        
        const HandleRegistry = require('../../core/handleRegistry.js');
        const isRoot = (!this.handle.context || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
        
        if (isRoot && this.db.rootPtrRaw) {
             const decoded = SmartPointer.decode(this.db.rootPtrRaw);
             return {
                 blockId: readPointer48(decoded.payload, 0),
                 length: decoded.payload.readUInt32BE(6),
                 offset: decoded.payload.readUInt32BE(10),
                 isChain: decoded.payload.readUInt8(14) === 1
             };
        }
        return null;
    }

    resolveKey(key) {
        const structPtr = this.resolveStructPtr();
        if (!structPtr) return null;

        let valPtr;
        const T = constants.VAL_TYPE;
        const type = this.handle.type;

        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            const seq = new Sequence(this.db.allocator, structPtr);
            const idx = parseInt(key);
            if (!isNaN(idx)) valPtr = seq.getPtr(idx);
        } else {
            const encodedKey = keyEncoding.encode(key);
            if (type === T.MAP) {
                const map = new MapEngine(this.db.allocator, structPtr);
                valPtr = map.getPtr(encodedKey);
            } else {
                const dict = new Dictionary(this.db.allocator, structPtr);
                valPtr = dict.getPtr(encodedKey);
            }
        }

        if (valPtr) {
             return { ptr: valPtr, type: SmartPointer.getType(valPtr) };
        }
        return null;
    }
}
module.exports = Navigator;