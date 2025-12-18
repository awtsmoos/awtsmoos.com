


// B"H
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const { readPointer48 } = require('../../../utils/binaryHelpers.js');

class WriterCommon {
    constructor(writer) {
        this.writer = writer;
        this.handle = writer.handle;
        this.db = writer.db;
        this._cachedEngine = null;
        this._cachedStructPtrHash = null;
    }

    async resolveStructPtr() {
        if (this.handle.ptr) {
            // B"H: FIX - Do NOT fully resolve. We need the pointer metadata, not the JS object.
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
            
            return null; // Inline pointers don't have block structs
        } else if (this.handle === this.db.root && this.db.rootPtrRaw) {
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
        
        if (this._cachedEngine && this._cachedStructPtrHash === ptrHash) {
            return this._cachedEngine;
        }
        
        let engine;
        if (type === constants.TYPE_SEQUENCE) engine = new Sequence(this.db.allocator, structPtr);
        else if (type === constants.TYPE_MAP) engine = new MapEngine(this.db.allocator, structPtr);
        else if (type === constants.TYPE_DICTIONARY) engine = new Dictionary(this.db.allocator, structPtr);
        else return null; 
        
        this._cachedEngine = engine;
        this._cachedStructPtrHash = ptrHash;
        return engine;
    }

    invalidateEngine() {
        if (this._cachedEngine && this._cachedEngine.destroy && typeof this._cachedEngine.destroy === 'function') {
             // Optional cleanup
        }
        this._cachedEngine = null;
        this._cachedStructPtrHash = null;
    }

    async checkAutoCompact(engine, type) {
        const newPtr = engine.ptr;
        let oldPtr = null;
        
        if (this.handle.ptr) {
             const decoded = SmartPointer.decode(this.handle.ptr);
             if (decoded.mode === constants.MODE_BLOCK) {
                 oldPtr = {
                     blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6),
                     offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             }
        } 

        const hasChanged = !oldPtr || 
                           newPtr.blockId !== oldPtr.blockId ||
                           newPtr.length !== oldPtr.length ||
                           newPtr.offset !== oldPtr.offset;

        if (hasChanged) {
            const newPtrBuf = SmartPointer.block(type, newPtr.blockId, newPtr.length, newPtr.isChain, newPtr.offset);
            await this.handle._updatePointer(newPtrBuf);
            
            const newHash = `${newPtr.blockId}:${newPtr.offset}`;
            this._cachedStructPtrHash = newHash;
        }
    }

    async checkGraphCleanup(ptr) {
        if (!ptr) return;
        const hasGraph = await this.db.has(this.db.root, "__graph__");
        if (!hasGraph) return;
        try {
            await this.db.graph.deleteNode(ptr);
        } catch(e) {
            if(this.db.debug) console.warn("B\"H Graph Cleanup warning: " + e.message);
        }
    }

    extractVector(value) {
        if (!value || typeof value !== 'object') return null;
        const candidates = ['vector', 'embedding', 'vec'];
        for(const c of candidates) {
            if (value[c] && (Array.isArray(value[c]) || value[c] instanceof Float32Array)) {
                return value[c];
            }
        }
        return null;
    }
    
    // B"H: Optimization - Use System Cache
    async getVectorIndex(path) {
        if (!this.db.sysCache.loaded) return null; // Preload ensures this is populated
        if (this.db.sysCache.vector.has(path)) {
            return await this.db.vector.getIndex(path);
        }
        return null;
    }
    
    // B"H: Optimization - Use System Cache
    async getSearchIndex(path) {
        if (!this.db.sysCache.loaded) return false;
        return this.db.sysCache.search.has(path);
    }
}

module.exports = WriterCommon;