
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const serializer = require('../../utils/serializer.js');
const SmartBinary = require('../../utils/smartBinary.js');

class Navigator {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    log(msg) {
        // console.log(`[TRACE Navigator] ${msg}`);
    }

    // B"H: Synchronous - Returns a Deferred Handle immediately
    navigate(key) {
        const LH = require('./index.js');
        return new LH(this.db, null, null, { parent: this.handle, key });
    }

    _encodeNumber(num) {
        const buf = Buffer.alloc(8);
        buf.writeDoubleBE(num, 0);
        return buf;
    }

    // B"H: Asynchronous - Actually looks up the key in the Structure
    async resolveKey(key) {
        const path = this.handle.getPath();
        await this.handle.ensureResolved();
        
        if (!this.handle.ptr && this.handle !== this.db.root) {
            this.log(`resolveKey [${path}] Parent Unresolved (Null Pointer). Cannot find '${key}'.`);
            return null;
        }

        // --- 1. Smart Binary (Inline) Handling ---
        // If the handle points to a Smart Object/Array (Inline Buffer), we resolve purely in memory.
        const ptrInfo = SmartPointer.decode(this.handle.ptr);
        if (ptrInfo && ptrInfo.mode === constants.MODE_INLINE) {
             const payload = ptrInfo.payload;
             
             if (ptrInfo.type === constants.TYPE_SMART_OBJECT) {
                 const resultBuf = SmartBinary.getObjectProperty(payload, String(key));
                 if (resultBuf) {
                     // Found! Return as a LiveHandle pointing to this buffer
                     // NOTE: We wrap it as an INLINE pointer? 
                     // Wait, resultBuf might be *another* encoded value.
                     // SmartBinary stores raw serialized values.
                     // We need to decode it to check if it's another structure or primitive?
                     // But LiveHandle expects a Pointer Buffer.
                     // Since `resultBuf` comes from `serializeValue`, it IS a pointer (Inline or Block).
                     // Perfect.
                     const decodedSub = SmartPointer.decode(resultBuf);
                     return { ptr: resultBuf, type: decodedSub ? decodedSub.type : constants.TYPE_BUFFER };
                 }
                 return null;
             }
             
             if (ptrInfo.type === constants.TYPE_SMART_ARRAY) {
                 if (key === 'length') {
                     const count = payload.readUInt32BE(4);
                     const ptr = SmartPointer.inline(constants.TYPE_NUMBER, this._encodeNumber(count));
                     return { ptr, type: constants.TYPE_NUMBER };
                 }
                 const idx = parseInt(key);
                 if (!isNaN(idx)) {
                     const resultBuf = SmartBinary.getArrayIndex(payload, idx);
                     if (resultBuf) {
                         const decodedSub = SmartPointer.decode(resultBuf);
                         return { ptr: resultBuf, type: decodedSub ? decodedSub.type : constants.TYPE_BUFFER };
                     }
                 }
                 return null;
             }
        }

        // --- 2. Block Structure Handling ---
        let structPtr = null;
        
        if (this.handle.ptr) {
             const decoded = SmartPointer.decode(this.handle.ptr);
             if (decoded && decoded.mode === constants.MODE_BLOCK) {
                 structPtr = {
                     blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6),
                     offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             } else if (decoded && decoded.mode === constants.MODE_HEAP) {
                 structPtr = {
                     blockId: readPointer48(decoded.payload, 0),
                     offset: decoded.payload.readUInt32BE(6),
                     length: decoded.payload.readUInt32BE(10),
                     isChain: false,
                     isHeap: true
                 };
             }
        } else if (this.handle === this.db.root && this.db.rootPtrRaw) {
             const decoded = SmartPointer.decode(this.db.rootPtrRaw);
             structPtr = {
                 blockId: readPointer48(decoded.payload, 0),
                 length: decoded.payload.readUInt32BE(6),
                 offset: decoded.payload.readUInt32BE(10),
                 isChain: decoded.payload.readUInt8(14) === 1
             };
        }

        if (!structPtr) {
             return null;
        }

        let valPtr;
        
        // --- Dictionary Lookup ---
        if (this.handle.type === constants.TYPE_DICTIONARY) {
            let dict = await this.handle.writer.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
            if (!dict) dict = new Dictionary(this.db.allocator, structPtr);
            const encodedKey = keyEncoding.encode(key);
            valPtr = await dict.getPtr(encodedKey);
        } 
        // --- Custom Instance Lookup ---
        else if (this.handle.type === constants.TYPE_CUSTOM_INSTANCE) {
            // (Existing Logic)
            let blockData;
            if (structPtr.isHeap) {
                const blk = await this.db.allocator.readBlock(structPtr.blockId);
                blockData = blk ? blk.subarray(structPtr.offset, structPtr.offset + structPtr.length) : null;
            } else {
                blockData = await this.db._readChainSafe(structPtr);
            }

            if (blockData) {
                let offset = 0;
                const nameInfo = serializer.readString(blockData, offset);
                offset += nameInfo.bytesRead;
                const sourceInfo = serializer.readString(blockData, offset);
                offset += sourceInfo.bytesRead;
                
                if (offset + 16 <= blockData.length) {
                    const dictPtrBuf = blockData.subarray(offset, offset + 16);
                    const dictDecoded = SmartPointer.decode(dictPtrBuf);
                    if (dictDecoded && dictDecoded.mode === constants.MODE_BLOCK) {
                        const dictStruct = {
                            blockId: readPointer48(dictDecoded.payload, 0),
                            length: dictDecoded.payload.readUInt32BE(6),
                            offset: dictDecoded.payload.readUInt32BE(10),
                            isChain: dictDecoded.payload.readUInt8(14) === 1
                        };
                        const encodedKey = keyEncoding.encode(key);
                        const dict = new Dictionary(this.db.allocator, dictStruct);
                        valPtr = await dict.getPtr(encodedKey);
                    }
                }
            }
        }
        // --- Map Lookup ---
        else if (this.handle.type === constants.TYPE_MAP) {
            if (key === 'size') {
                let map = await this.handle.writer.common.getEngine(structPtr, constants.TYPE_MAP);
                if(!map) map = new MapEngine(this.db.allocator, structPtr);
                const stats = await map.stats();
                const ptr = SmartPointer.inline(constants.TYPE_NUMBER, this._encodeNumber(stats.count));
                return { ptr, type: constants.TYPE_NUMBER };
            }
            let map = await this.handle.writer.common.getEngine(structPtr, constants.TYPE_MAP);
            if (!map) map = new MapEngine(this.db.allocator, structPtr);
            const encodedKey = keyEncoding.encode(key);
            valPtr = await map.getPtr(encodedKey);
        }
        // --- Sequence Lookup ---
        else if (this.handle.type === constants.TYPE_SEQUENCE) {
            let seq = await this.handle.writer.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
            if (!seq) seq = new Sequence(this.db.allocator, structPtr);
            if (key === 'length') {
                const len = await seq.length();
                const ptr = SmartPointer.inline(constants.TYPE_NUMBER, this._encodeNumber(len));
                return { ptr, type: constants.TYPE_NUMBER };
            }
            const idx = parseInt(key);
            if (!isNaN(idx)) {
                valPtr = await seq.getPtr(idx);
            }
        }

        if (!valPtr) return null;
        const decoded = SmartPointer.decode(valPtr);
        if (decoded) return { ptr: valPtr, type: decoded.type };
        return null;
    }
}
module.exports = Navigator;
