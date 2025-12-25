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
        this._cachedMutationCount = -1;
    }

    async resolveStructPtr() {
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
                    isChain: false,
                    isHeap: true
                };
            }
        } 
        
        const isRoot = (this.handle.context === null || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
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

    async getEngine(structPtr, type) {
        const ptrHash = structPtr ? `${structPtr.blockId}:${structPtr.offset}` : 'null';
        const currentMutation = this.db.mutationCount || 0;
        
        if (this._cachedEngine && this._cachedStructPtrHash === ptrHash && this._cachedMutationCount === currentMutation) {
            return this._cachedEngine;
        }
        
        let engine;
        if (type === constants.TYPE_SEQUENCE) engine = new Sequence(this.db.allocator, structPtr);
        else if (type === constants.TYPE_MAP) engine = new MapEngine(this.db.allocator, structPtr);
        else if (type === constants.TYPE_DICTIONARY) engine = new Dictionary(this.db.allocator, structPtr);
        else return null; 
        
        this._cachedEngine = engine;
        this._cachedStructPtrHash = ptrHash;
        this._cachedMutationCount = currentMutation;
        return engine;
    }

    invalidateEngine() {
        this._cachedEngine = null;
        this._cachedStructPtrHash = null;
        this._cachedMutationCount = -1;
    }

    /**
     * @description Triggers a pointer update bubble. Crucial for hierarchical consistency.
     */
    async checkAutoCompact(engine, type) {
        const newPtr = SmartPointer.block(type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
        // B"H: Always update pointer to ensure bubble-up hierarchy is synced to current db.mutationCount
        await this.handle._updatePointer(newPtr);
    }

    _ptrsEqual(p1, p2) {
        if (!p1 || !p2) return p1 === p2;
        if (p1.blockId !== undefined) {
             if (Buffer.isBuffer(p2)) {
                 const decoded = SmartPointer.decode(p2);
                 const bid = readPointer48(decoded.payload, 0);
                 const off = decoded.payload.readUInt32BE(10);
                 return p1.blockId === bid && p1.offset === off;
             }
        }
        if (Buffer.isBuffer(p1) && Buffer.isBuffer(p2)) return p1.compare(p2) === 0;
        return false;
    }

    async getSearchIndex(path) {
        if (!this.db.sysCache.loaded) return false;
        return this.db.sysCache.search.has(path);
    }

    async getVectorIndex(path) {
        if (!this.db.sysCache.loaded) return false;
        return this.db.sysCache.vector.has(path);
    }

    extractVector(value) {
        if (!value || typeof value !== 'object') return null;
        return value.vector || value.embedding || value.vec || null;
    }

    async checkGraphCleanup(ptrBuf) {
        if (this.db.graph) {
             await this.db.graph.deleteNode(ptrBuf);
        }
    }
}
module.exports = WriterCommon;