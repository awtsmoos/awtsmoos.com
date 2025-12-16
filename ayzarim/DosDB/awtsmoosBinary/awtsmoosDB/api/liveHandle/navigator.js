
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const serializer = require('../../utils/serializer.js');

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

    // B"H: Asynchronous - Actually looks up the key in the Structure
    async resolveKey(key) {
        const path = this.handle.getPath();
        // this.log(`resolveKey [${path}] Looking for '${key}'...`);
        await this.handle.ensureResolved();
        
        // If parent handle has no pointer, it doesn't exist, so child can't exist.
        if (!this.handle.ptr && this.handle !== this.db.root) {
            this.log(`resolveKey [${path}] Parent Unresolved (Null Pointer). Cannot find '${key}'.`);
            return null;
        }

        let structPtr = null;
        
        // B"H: FIX - Manually decode pointer to get struct location.
        // Do NOT use SmartPointer.resolve() because it hydrates TYPE_CUSTOM_INSTANCE into a JS object,
        // preventing us from reading the raw block to find properties.
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
             this.log(`resolveKey [${path}] StructPtr is Null!`);
             return null;
        }

        let valPtr;
        
        // --- 1. Dictionary Lookup ---
        if (this.handle.type === constants.TYPE_DICTIONARY) {
            const encodedKey = keyEncoding.encode(key);
            const dict = new Dictionary(this.db.allocator, structPtr);
            valPtr = await dict.getPtr(encodedKey);
        } 
        // --- 2. Custom Instance Lookup ---
        else if (this.handle.type === constants.TYPE_CUSTOM_INSTANCE) {
            // A Custom Instance block contains: [NameStr][SourceStr][DictPtr(16 bytes)]
            // We need to extract the DictPtr to look up properties.
            
            // B"H: Read the raw block. structPtr points to the meta block.
            // Note: If MODE_HEAP, readBlockLocked/ChainSafe handles it differently usually, 
            // but CustomInstances are almost always MODE_BLOCK due to size.
            
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
                
                // Dict Pointer is next 16 bytes
                if (offset + 16 <= blockData.length) {
                    const dictPtrBuf = blockData.subarray(offset, offset + 16);
                    
                    // Decode this pointer to get the Dictionary Structure Location
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
        // --- 3. Map Lookup ---
        else if (this.handle.type === constants.TYPE_MAP) {
            const encodedKey = keyEncoding.encode(key);
            const map = new MapEngine(this.db.allocator, structPtr);
            valPtr = await map.getPtr(encodedKey);
            if (!valPtr) this.log(`resolveKey [${path}] Map Lookup '${encodedKey}' FAILED in B${structPtr.blockId}.`);
        }
        // --- 4. Sequence Lookup (Index Access) ---
        else if (this.handle.type === constants.TYPE_SEQUENCE) {
            const idx = parseInt(key);
            if (!isNaN(idx)) {
                const seq = new Sequence(this.db.allocator, structPtr);
                valPtr = await seq.getPtr(idx);
            }
        }
        // --- 5. JSON Blob (No structural navigation) ---
        else if (this.handle.type === constants.TYPE_JSON) {
            // Cannot navigate structurally into a JSON blob pointer.
            return null;
        }
        else {
            this.log(`resolveKey [${path}] Unknown Handle Type: ${this.handle.type} (StructPtr: ${JSON.stringify(structPtr)})`);
        }

        if (!valPtr) {
            // this.log(`resolveKey [${path}] Key '${key}' NOT FOUND in Block B${structPtr ? structPtr.blockId : '?'}. HandleType=${this.handle.type}`);
            return null;
        }

        const decoded = SmartPointer.decode(valPtr);
        if (decoded) {
            // this.log(`resolveKey [${path}] FOUND '${key}' -> Type ${decoded.type}`);
            return { ptr: valPtr, type: decoded.type };
        }
        
        return null;
    }
}
module.exports = Navigator;
