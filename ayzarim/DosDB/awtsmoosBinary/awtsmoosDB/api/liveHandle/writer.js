// B"H
/**
 * @file writer.js
 * @description The Immediate Scribe of the Interface.
 */

const constants = require('../../constants.js');
const Sequence = require('../../structure/sequence/index.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    set(key, value, options = {}) {
        const structPtr = this.handle.nav.resolveStructPtr();
        let engine;
        
        if (this.handle.type === constants.VAL_TYPE.SEQUENCE) {
            engine = new Sequence(this.db.allocator, structPtr);
            engine.set(key, value, options);
        } else if (this.handle.type === constants.VAL_TYPE.MAP) {
            engine = new MapEngine(this.db.allocator, structPtr);
            engine.set(key, value, options);
        } else {
            engine = new Dictionary(this.db.allocator, structPtr);
            engine.set(key, value, options);
        }
        
        const SmartPointer = require('../../utils/smartPointer.js');
        const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
        this.handle._updatePointer(newPtr);
    }

    push(value) {
        const structPtr = this.handle.nav.resolveStructPtr();
        const engine = new Sequence(this.db.allocator, structPtr);
        engine.push(value);
        
        const SmartPointer = require('../../utils/smartPointer.js');
        const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
        this.handle._updatePointer(newPtr);
    }

    delete(key) {
        const structPtr = this.handle.nav.resolveStructPtr();
        let engine;
        if (this.handle.type === constants.VAL_TYPE.SEQUENCE) engine = new Sequence(this.db.allocator, structPtr);
        else if (this.handle.type === constants.VAL_TYPE.MAP) engine = new MapEngine(this.db.allocator, structPtr);
        else engine = new Dictionary(this.db.allocator, structPtr);
        
        engine.delete(key);
        const SmartPointer = require('../../utils/smartPointer.js');
        const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
        this.handle._updatePointer(newPtr);
    }
}
module.exports = Writer;
