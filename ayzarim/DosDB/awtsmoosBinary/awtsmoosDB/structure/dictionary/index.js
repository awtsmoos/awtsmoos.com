// B"H
/**
 * @file index.js
 * @description The Sefirah of Gevurah - The Ordered Dictionary.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');

class DictionaryEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.ptr = ptr;
        this.map = null;
        this.seq = null;
        this.db = allocator.v1.db;
    }

    create() {
        this.map = new MapEngine(this.allocator);
        const mapPtrBuf = this.map.create();
        this.seq = new Sequence(this.allocator);
        const seqPtrBuf = this.seq.create();
        
        const ptr = this.allocator.v1.allocate(constants.BLOCK_SIZE);
        const dictData = Buffer.alloc(36);
        dictData.write(constants.MAGIC_DICT_DIR, 0);
        mapPtrBuf.copy(dictData, 4);
        seqPtrBuf.copy(dictData, 20);
        
        this.db._writeChainSafe(ptr, dictData);
        this.ptr = ptr;
        return SmartPointer.block(constants.VAL_TYPE.DICTIONARY, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    _init() {
        if (!this.ptr) return;
        const block = this.db._readChainSafe(this.ptr);
        const mapPtrBuf = block.subarray(4, 20);
        const seqPtrBuf = block.subarray(20, 36);

        const mapRes = SmartPointer.resolve(mapPtrBuf, this.allocator);
        const seqRes = SmartPointer.resolve(seqPtrBuf, this.allocator);

        this.map = new MapEngine(this.allocator, mapRes);
        this.seq = new Sequence(this.allocator, seqRes);
    }

    set(key, value, options = {}) {
        this._init();
        const existing = this.map.getPtr(key);
        const valPtr = options.isPtr ? value : this.allocator.save(value);
        
        this.map.set(key, valPtr, { ...options, isPtr: true });
        if (existing === undefined) this.seq.push(key);
    }

    get(key) {
        this._init();
        return this.map.get(key);
    }

    delete(key) {
        this._init();
        const res = this.map.delete(key);
        if (!res.success) return false;
        
        const len = this.seq.length();
        for (let i = 0; i < len; i++) {
            if (this.seq.get(i) === key) {
                this.seq.splice(i, 1);
                break;
            }
        }
        return true;
    }
}
module.exports = DictionaryEngine;
