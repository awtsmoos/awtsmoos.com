// B"H
/**
 * @file index.js (DictionaryEngine)
 * @description 
 *  The Scribe of the Dictionary — Establishing the boundaries of the home.
 * 
 *  REWRITTEN: Ensures perfect type tagging for sub-engine pointers and 
 *  coordinates insertion-order keys.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class DictionaryEngine {
    /**
     * @description Constructs the engine to manage the ADIC header.
     */
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);
        
        if (Buffer.isBuffer(ptr) && ptr.length === 16) {
            this.ptr = SmartPointer.resolve(ptr, this.allocator);
        } else {
            this.ptr = ptr || null;
        }

        if (this.ptr) this.ptr.type = constants.VAL_TYPE.DICTIONARY;
        
        this.map = null; 
        this.seq = null;
    }

    /**
     * @description Manifests the two children of the Dictionary: The Map (Alphabetical) and the Sequence (Order).
     */
    create() {
        this.map = new MapEngine(this.allocator); 
        this.map.create(); 
        this.seq = new Sequence(this.allocator); 
        this.seq.create(); 
        
        this.ptr = this.v1.allocate(36); 
        this.ptr.type = constants.VAL_TYPE.DICTIONARY;
        
        this._updateHeader(); 
        
        return SmartPointer.block(constants.VAL_TYPE.DICTIONARY, this.ptr.blockId, this.ptr.length, !!this.ptr.isChain, this.ptr.offset);
    }

    /**
     * @description Awakens the sub-engines from the binary ADIC header.
     */
    _init() {
        if (this.map && this.seq) return;
        if (!this.ptr || this.ptr.blockId === undefined) return;
        
        const block = this.db._readChainSafe({ ...this.ptr, length: 36 });
        
        if (!block || block.length < 36 || block.subarray(0, 4).toString() !== constants.MAGIC_DICT_DIR) {
            return;
        }

        const mSeal = Buffer.alloc(16); block.copy(mSeal, 0, 4, 20);
        const sSeal = Buffer.alloc(16); block.copy(sSeal, 0, 20, 36);

        // Authoritatively tag the seals as container structures.
        mSeal[0] = (mSeal[0] & 0xC0) | (constants.VAL_TYPE.MAP & 0x3F);
        sSeal[0] = (sSeal[0] & 0xC0) | (constants.VAL_TYPE.SEQUENCE & 0x3F);

        this.map = new MapEngine(this.allocator, mSeal);
        this.seq = new Sequence(this.allocator, sSeal);
    }

    /**
     * @description Persists the current sub-engine addresses into the header block.
     */
    _updateHeader() {
        if (!this.map || !this.seq || !this.ptr) return;
        
        const data = Buffer.alloc(36).fill(0);
        data.write(constants.MAGIC_DICT_DIR, 0);
        
        const mPtrDesc = { ...this.map.ptr, type: constants.VAL_TYPE.MAP };
        const sPtrDesc = { ...this.seq.ptr, type: constants.VAL_TYPE.SEQUENCE };
        
        const mSeal = SmartPointer.toBuffer(mPtrDesc);
        const sSeal = SmartPointer.toBuffer(sPtrDesc);
        
        mSeal.copy(data, 4);
        sSeal.copy(data, 20);
        
        this.db._writeChainSafe(this.ptr, data);
    }

    /**
     * @description Sets a key, ensuring it is tracked in the sequence for order.
     */
    set(key, value, options = {}) {
        this._init(); 
        if (!this.map) this.create();
        
        const kBuf = keyEncoding.encode(key);
        
        if (!this.map.getPtr(kBuf)) {
             const keyPtr = this.allocator.save(String(key));
             this.seq.push(keyPtr);
        }
        
        const ptrVal = options.isPtr ? value : this.allocator.save(value);
        this.map.set(kBuf, ptrVal, { ...options, isPtr: true });
        
        this._updateHeader();
    }

    /**
     * @description Deletes a key and updates the header if the root moved.
     */
    delete(key) {
        this._init();
        if (!this.map) return false;
        const kBuf = keyEncoding.encode(key);
        
        const res = this.map.ops.delete(this.map.nodeIO.load(this.map.ptr), kBuf);
        if(res.success) {
            if (res.newPtr) this.map.ptr = { ...res.newPtr, type: constants.VAL_TYPE.MAP };
            this._updateHeader();
        }
        return res.success;
    }

    /**
     * @description Retrieves a living value.
     */
    get(key, ctx) {
        this._init();
        return this.map ? this.map.get(keyEncoding.encode(key), ctx) : undefined;
    }

    /**
     * @description Retrieves a physical pointer seal.
     */
    getPtr(key) {
        this._init();
        return this.map ? this.map.getPtr(keyEncoding.encode(key)) : undefined;
    }

    /**
     * @description Yields the ordered keys.
     */
    * keys() {
        this._init(); if (!this.seq) return;
        for (let i = 0; i < this.seq.length(); i++) {
            yield SmartPointer.resolve(this.seq.getPtr(i), this.allocator);
        }
    }

    /**
     * @description Yields the ordered entries.
     */
    * entries(ctx) {
        for (const k of this.keys()) {
            yield [k, this.get(k, ctx)];
        }
    }
}
module.exports = DictionaryEngine;