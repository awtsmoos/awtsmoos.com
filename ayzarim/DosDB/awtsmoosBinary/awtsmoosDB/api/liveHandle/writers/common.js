// B"H
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');
const HandleRegistry = require('../../../core/handleRegistry.js');

class WriterCommon {
    constructor(writer) {
        this.writer = writer;
        this.handle = writer.handle; 
        this.db = writer.db;
        this._cachedEngine = null;
        this._cachedStructPtrHash = null;
    }

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
                    isHeap: true
                };
            }
        }
        
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

    // B"H: Synchronous Factory with Robust Hashing
    getEngine(structPtr, type) {
        const ptrHash = structPtr ? `${structPtr.blockId}:${structPtr.offset}:${structPtr.length}` : 'null';
        if (this._cachedEngine && this._cachedStructPtrHash === ptrHash) return this._cachedEngine;
        
        let engine = null;
        const T = constants.VAL_TYPE;
        
        // Flexible matching
        if (type === T.SEQUENCE || type === constants.TYPE_SEQUENCE) {
            engine = new Sequence(this.db.allocator, structPtr);
        }
        else if (type === T.MAP || type === constants.TYPE_MAP) {
            engine = new MapEngine(this.db.allocator, structPtr);
        }
        else if (type === T.DICTIONARY || type === constants.TYPE_DICTIONARY || type === T.OBJECT) {
            engine = new Dictionary(this.db.allocator, structPtr);
        }
        
        if (!engine) return null;
        
        this._cachedEngine = engine;
        this._cachedStructPtrHash = ptrHash;
        return engine;
    }

    invalidateEngine() {
        this._cachedEngine = null;
    }

    checkAutoCompact(engine, type) {
        if (!engine || !engine.ptr) return;
        
        const blockId = engine.ptr.blockId;
        const length = engine.ptr.length;
        const isChain = engine.ptr.isChain;
        const offset = engine.ptr.offset;
        
        // Ensure type header is correct
        const newPtr = SmartPointer.block(type, blockId, length, isChain, offset);
        
        this.handle._updatePointer(newPtr);
        
        const newHash = `${blockId}:${offset}:${length}`;
        if (this._cachedStructPtrHash !== newHash) {
             this._cachedStructPtrHash = newHash;
        }
    }

    getSearchIndex(path) { return this.db.sysCache.search.has(path); }
    getVectorIndex(path) { return this.db.sysCache.vector.has(path); }
    extractVector(val) { return val && (val.vector || val.embedding); }
    checkGraphCleanup(ptr) { if (this.db.graph) this.db.graph.deleteNode(ptr); }
}
module.exports = WriterCommon;