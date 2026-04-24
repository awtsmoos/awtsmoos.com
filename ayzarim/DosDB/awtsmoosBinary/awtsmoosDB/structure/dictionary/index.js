
// B"H
/**
 * @file index.js (DictionaryEngine)
 * @description
 *  =============================================================================
 *  CHAPTER 14: THE SCRIBE OF THE DICTIONARY (GEVURAH)
 *  =============================================================================
 *  The Dictionary is the vessel of boundaries and definitions. 
 *  It utilizes the MapEngine (B-Tree) for the deep sorting of keys, 
 *  and a Sequence to preserve the exact chronological order of their emanation.
 *  
 *  THE TIKKUN OF STABILITY:
 *  The Header is now FIXED at 32 bytes. This guarantees that a Dictionary's 
 *  physical pointer NEVER CHANGES, enabling perfect Circular References!
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class DictionaryEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        this.v1 = allocator?.v1 || allocator;
        this.db = this.v1?.db || (allocator?.db ? allocator.db : null);
        
        if (Buffer.isBuffer(ptr)) {
            const dec = SmartPointer.decode(ptr);
            if (dec) {
                this.ptr = { isStructure: true, type: dec.type, offset: dec.offset, length: dec.length, ptr };
            } else {
                this.ptr = ptr;
            }
        } else {
            this.ptr = ptr || null;
        }
        
        if (this.ptr) this.ptr.type = constants.VAL_TYPE.DICTIONARY;
        
        this.map = null; 
        this.seq = null;
    }

    create() {
        this.map = new MapEngine(this.allocator); 
        this.map.create(); 
        
        this.seq = new Sequence(this.allocator); 
        this.seq.create(); 
        
        // B"H: Allocate fixed 32 bytes to ensure pointer stability for Circular References
        const size = 32;
        const newLoc = this.v1.allocate(size);
        this.ptr = { offset: newLoc.offset, length: size, type: constants.VAL_TYPE.DICTIONARY }; 
        
        this._updateHeader(); 
        
        return SmartPointer.encode(constants.VAL_TYPE.DICTIONARY, this.ptr.offset, this.ptr.length);
    }

    _init() {
        if (this.map && this.seq) return;
        if (!this.ptr || this.ptr.offset === undefined) return;
        
        const cachedHeader = this.db.getCachedStructure(this.ptr);
        if (cachedHeader) { 
            this.map = cachedHeader.map; 
            this.seq = cachedHeader.seq; 
            return; 
        }
        
        const block = this.db._readChainSafe(this.ptr);
        if (!block || block.subarray(0, 4).toString() !== constants.MAGIC_DICT_DIR) return;
        
        const mLen = block.readUInt8(4);
        const mSeal = block.subarray(5, 5 + mLen);
        
        const sOff = 5 + mLen;
        const sLen = block.readUInt8(sOff);
        const sSeal = block.subarray(sOff + 1, sOff + 1 + sLen);
        
        this.map = new MapEngine(this.allocator, mSeal);
        this.seq = new Sequence(this.allocator, sSeal);
        
        this.db.cacheStructure(this.ptr, { map: this.map, seq: this.seq });
    }

    _updateHeader() {
        if (!this.map || !this.seq || !this.ptr) return;
        
        const mSeal = SmartPointer.toBuffer({ ...this.map.ptr, type: constants.VAL_TYPE.MAP });
        const sSeal = SmartPointer.toBuffer({ ...this.seq.ptr, type: constants.VAL_TYPE.SEQUENCE });
        
        // B"H: Fixed 32 bytes for ultimate stability
        const size = 32;
        const data = Buffer.alloc(size).fill(0);
        data.write(constants.MAGIC_DICT_DIR, 0);
        
        data.writeUInt8(mSeal.length, 4);
        mSeal.copy(data, 5);
        
        const sOff = 5 + mSeal.length;
        data.writeUInt8(sSeal.length, sOff);
        sSeal.copy(data, sOff + 1);

        // B"H: Tikkun! Fixed `!this.ptr.offset` trap. Check specifically for undefined.
        // Even if offset is 0, it is a valid divine coordinate!
        if (this.ptr.offset === undefined || this.ptr.length !== size) {
             const newLoc = (this.allocator.v1 || this.allocator).allocate(size);
             this.ptr = { offset: newLoc.offset, length: size, type: constants.VAL_TYPE.DICTIONARY };
        }
        
        this.db._writeChainSafe(this.ptr, data);
        this.db.cacheStructure(this.ptr, { map: this.map, seq: this.seq });
    }

    set(key, value, options = {}) {
        this._init(); 
        if (!this.map) this.create();
        
        const kBuf = keyEncoding.encode(key);
        
        const oldMapPtrHash = this.map.ptr ? `${this.map.ptr.offset}_${this.map.ptr.length}` : '';
        const oldSeqPtrHash = this.seq.ptr ? `${this.seq.ptr.offset}_${this.seq.ptr.length}` : '';
        
        const delta = this.map.set(kBuf, options.isPtr ? value : this.allocator.save(value), { ...options, isPtr: true });
        
        if (delta > 0) {
             const keyPtr = this.allocator.save(String(key));
             this.seq.push(keyPtr);
        }
        
        const newMapPtrHash = this.map.ptr ? `${this.map.ptr.offset}_${this.map.ptr.length}` : '';
        const newSeqPtrHash = this.seq.ptr ? `${this.seq.ptr.offset}_${this.seq.ptr.length}` : '';
        
        if (delta > 0 || oldMapPtrHash !== newMapPtrHash || oldSeqPtrHash !== newSeqPtrHash) {
            this._updateHeader();
        }
    }

    delete(key) {
        this._init(); 
        if (!this.map) return false;
        
        const kBuf = keyEncoding.encode(key);
        const res = this.map.delete(kBuf);
        
        if(res.success) this._updateHeader();
        return res.success;
    }

    getPtr(key) {
        this._init();
        return this.map ? this.map.getPtr(keyEncoding.encode(key)) : undefined;
    }

    get(key, ctx) {
        this._init();
        return this.map ? this.map.get(keyEncoding.encode(key), ctx) : undefined;
    }

    * keys() {
        this._init(); 
        if (!this.seq) return;
        
        for (let i = 0; i < this.seq.length(); i++) {
            yield SmartPointer.resolve(this.seq.getPtr(i), this.allocator);
        }
    }

    * entries(ctx) {
        for (const k of this.keys()) {
            yield [k, this.get(k, ctx)];
        }
    }
}
module.exports = DictionaryEngine;
