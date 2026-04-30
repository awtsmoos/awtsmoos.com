
// B"H
/**
 * @file dictionary/index.js
 * @chapter The World of Names.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

class DictionaryEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.db = allocator.db;
        this.ptr = Buffer.isBuffer(ptr) ? SmartPointer.decode(ptr) : ptr;
        
        this.map = null;
        this.seq = null;
        this.initialized = false;
    }

    _init() {
        if (this.initialized || !this.ptr) return;
        const Manifestor = require('./logic/manifestor.js');
        Manifestor.initialize(this);
    }

    create() {
        const Creator = require('./logic/creator.js');
        const pLoc = Creator.create(this);
        this.ptr = pLoc;
        return SmartPointer.toBuffer(pLoc);
    }

    set(key, valPtr, options = {}) {
        this._init();
        if (!this.initialized) this.create();
        
        const Inscriber = require('./logic/inscriber.js');
        const pLoc = Inscriber.set(this, key, valPtr, options);
        this.ptr = pLoc;
        return SmartPointer.toBuffer(pLoc);
    }

    getPtr(key) {
        this._init();
        return this.map ? this.map.getPtr(key) : null;
    }

    seal() {
        return SmartPointer.toBuffer(this.ptr);
    }

    *keys() {
        this._init();
        if (!this.seq) return;
        yield* this.seq.keys();
    }
}

module.exports = DictionaryEngine;
