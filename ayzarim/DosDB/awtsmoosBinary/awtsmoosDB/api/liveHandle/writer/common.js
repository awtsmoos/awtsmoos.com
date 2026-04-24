
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
 *  Map and Sequence scribes. It manages the physical resolution of exact-byte 
 *  pointers and extracts geometric vectors for spatial indexing.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
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
            return { offset: dec.offset, length: dec.length };
        }
        if (this.db.root && this.handle === HandleRegistry.getSoul(this.db.root) && this.db.rootPtrRaw) {
             const dec = SmartPointer.decode(this.db.rootPtrRaw);
             if (dec) return { offset: dec.offset, length: dec.length };
        }
        return null;
    }

    getEngine(ptr, type) {
        const hash = ptr ? `${ptr.offset}:${ptr.length}` : 'null';
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
        this.handle._updatePointer(SmartPointer.encode(type, p.offset, p.length));
        this._cachedStructPtrHash = `${p.offset}:${p.length}`;
    }

    getSearchIndex(path) { return this.db.sysCache.search.has(path); }
    getVectorIndex(path) { return this.db.sysCache.vector.has(path); }

    extractVector(val) { 
        if (!val || typeof val !== 'object') return null;
        const v = val.vector || val.embedding || val.vec;
        if (!v) return null;
        return (v instanceof Float32Array || Array.isArray(v)) ? v : null;
    }

    checkGraphCleanup(ptr) { if (this.db.graph) this.db.graph.deleteNode(ptr); }
}
module.exports = WriterCommon;
