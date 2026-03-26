
// B"H
/**
 * @file common.js
 * @class WriterCommon
 * @description
 *  =============================================================================
 *  CHAPTER 16: THE SHARED SCRIBE UTILITIES (NETZACH)
 *  =============================================================================
 *  "Netzach represents the power to overcome obstacles and ensure the 
 *  persistence of the Divine flow."
 * 
 *  This module provides common functionalities utilized by the specialized 
 *  Map and Sequence scribes. It manages the physical resolution of pointers 
 *  and extracts geometric vectors for spatial indexing.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const { readPointer48 } = require('../../../utils/binary/helpers.js');
const HandleRegistry = require('../../../core/registry/handle.js');

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
            const dec = SmartPointer.decode(this.handle.ptr); 
            if (!dec) return null;
            if (dec.mode === constants.MODE_BLOCK) return { blockId: readPointer48(dec.payload, 0), length: dec.payload.readUInt32BE(6), offset: dec.payload.readUInt32BE(10), isChain: dec.payload.readUInt8(14) === 1 };
            if (dec.mode === constants.MODE_HEAP) return { blockId: readPointer48(dec.payload, 0), offset: dec.payload.readUInt32BE(6), length: dec.payload.readUInt32BE(10), isHeap: true };
        }
        if (this.db.root && this.handle === HandleRegistry.getSoul(this.db.root) && this.db.rootPtrRaw) {
             const dec = SmartPointer.decode(this.db.rootPtrRaw);
             return { blockId: readPointer48(dec.payload, 0), length: dec.payload.readUInt32BE(6), offset: dec.payload.readUInt32BE(10), isChain: dec.payload.readUInt8(14) === 1 };
        }
        return null;
    }

    getEngine(ptr, type) {
        const hash = ptr ? `${ptr.blockId}:${ptr.offset}:${ptr.length}` : 'null';
        if (this._cachedEngine && this._cachedStructPtrHash === hash) return this._cachedEngine;
        
        let e = null; 
        const T = constants.VAL_TYPE;
        if (type === T.SEQUENCE || type === constants.TYPE_SEQUENCE) e = new Sequence(this.db.allocator, ptr);
        else if (type === T.MAP || type === constants.TYPE_MAP) e = new MapEngine(this.db.allocator, ptr);
        else if (type === T.DICTIONARY || type === constants.TYPE_DICTIONARY || type === T.OBJECT) e = new Dictionary(this.db.allocator, ptr);
        
        if (!e) return null; 
        this._cachedEngine = e; 
        this._cachedStructPtrHash = hash; 
        return e;
    }

    invalidateEngine() { this._cachedEngine = null; }

    checkAutoCompact(e, type) {
        if (!e || !e.ptr) return; const p = e.ptr;
        this.handle._updatePointer(SmartPointer.block(type, p.blockId, p.length, p.isChain, p.offset));
        this._cachedStructPtrHash = `${p.blockId}:${p.offset}:${p.length}`;
    }

    getSearchIndex(path) { return this.db.sysCache.search.has(path); }
    getVectorIndex(path) { return this.db.sysCache.vector.has(path); }

    /**
     * @method extractVector
     * @description Liberates the geometric embedding from a JS entity.
     */
    extractVector(val) { 
        if (!val || typeof val !== 'object') return null;
        // B"H: Wisdom recognizes many forms of the same coordinate.
        const v = val.vector || val.embedding || val.vec;
        if (!v) return null;
        return (v instanceof Float32Array || Array.isArray(v)) ? v : null;
    }

    checkGraphCleanup(ptr) { if (this.db.graph) this.db.graph.deleteNode(ptr); }
}
module.exports = WriterCommon;
