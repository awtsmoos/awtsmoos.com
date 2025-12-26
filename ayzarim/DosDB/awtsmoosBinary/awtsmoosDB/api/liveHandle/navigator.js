// B"H
/**
 * @file navigator.js
 * @description
 *  The Sefirah of Chokhmah - The Spark of Discovery.
 *  Navigates the database structures to find specific keys and indices.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartBinary = require('../../utils/smartBinary.js');

class Navigator {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    /**
     * @description Creates a deferred handle.
     */
    navigate(key) {
        const HandleRegistry = require('../../core/handleRegistry.js');
        return HandleRegistry.createHandle(this.db, null, null, { parent: this.handle.self, key });
    }

    /**
     * @description Resolves the physical root or current pointer.
     */
    resolveStructPtr() {
        if (this.handle.ptr) {
            const decoded = SmartPointer.decode(this.handle.ptr);
            if (!decoded) return null;
            if (decoded.mode === constants.MODE_BLOCK) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
            }
            if (decoded.mode === constants.MODE_HEAP) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    offset: decoded.payload.readUInt32BE(6),
                    length: decoded.payload.readUInt32BE(10),
                    isChain: false, isHeap: true
                };
            }
        }
        if ((this.handle.context === null || this.handle.self === this.db.root) && this.db.rootPtrRaw) {
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

    /**
     * @description Resolves a key within the current physical vessel.
     */
    resolveKey(key) {
        const ptrInfo = SmartPointer.decode(this.handle.ptr);
        if (ptrInfo && ptrInfo.mode === constants.MODE_INLINE) {
             const payload = ptrInfo.payload;
             if (ptrInfo.type === constants.VAL_TYPE.SMART_OBJECT) {
                 const resBuf = SmartBinary.getObjectProperty(payload, String(key));
                 if (resBuf) return { ptr: resBuf, type: SmartPointer.getType(resBuf) };
                 return null;
             }
             if (ptrInfo.type === constants.VAL_TYPE.SMART_ARRAY) {
                 if (key === 'length') return { ptr: SmartPointer.encode(constants.VAL_TYPE.SMALL_INT, constants.MODE_INLINE, Buffer.from([payload.readUInt32BE(4)])), type: constants.VAL_TYPE.SMALL_INT };
                 const idx = parseInt(key);
                 if (!isNaN(idx)) {
                     const resBuf = SmartBinary.getArrayIndex(payload, idx);
                     if (resBuf) return { ptr: resBuf, type: SmartPointer.getType(resBuf) };
                 }
                 return null;
             }
        }

        const structPtr = this.resolveStructPtr();
        if (!structPtr) return null;

        let valPtr;
        const T = constants.VAL_TYPE;
        if (this.handle.type === T.SEQUENCE) {
            const seq = new Sequence(this.db.allocator, structPtr);
            if (key === 'length') return { ptr: SmartPointer.encode(T.SMALL_INT, constants.MODE_INLINE, Buffer.from([seq.length()])), type: T.SMALL_INT };
            const idx = parseInt(key);
            if (!isNaN(idx)) valPtr = seq.getPtr(idx);
        } else if (this.handle.type === T.MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            valPtr = map.getPtr(key);
        } else {
            const dict = new Dictionary(this.db.allocator, structPtr);
            valPtr = dict.map ? dict.map.getPtr(key) : undefined;
        }

        if (!valPtr) return null;
        return { ptr: valPtr, type: SmartPointer.getType(valPtr) };
    }
}
module.exports = Navigator;
