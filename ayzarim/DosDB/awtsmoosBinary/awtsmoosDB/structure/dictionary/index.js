
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
 *  THE TIKKUN OF SILENCE:
 *  Redundant Tree lookups and header rewrites have been banished. The Gatekeeper 
 *  now listens to the Prophecy of the Map, acting only when true expansion occurs.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class DictionaryEngine {
    /**
     * @constructor
     * @param {Object} allocator - The Infinite Provider of physical space.
     * @param {Buffer|Object} ptr - The 16-byte seal anchoring this Dictionary.
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
     * @method create
     * @description Manifests a new Dictionary from the absolute void (Ayin).
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
     * @method _init
     * @description Awakens the dormant structure from the disk.
     */
    _init() {
        if (this.map && this.seq) return;
        if (!this.ptr || this.ptr.blockId === undefined) return;
        
        const cachedHeader = this.db.getCachedStructure(this.ptr);
        if (cachedHeader) { 
            this.map = cachedHeader.map; 
            this.seq = cachedHeader.seq; 
            return; 
        }
        
        const block = this.db._readChainSafe({ ...this.ptr, length: 36 });
        if (!block || block.length < 36 || block.subarray(0, 4).toString() !== constants.MAGIC_DICT_DIR) return;
        
        const mSeal = Buffer.allocUnsafe(16); block.copy(mSeal, 0, 4, 20);
        const sSeal = Buffer.allocUnsafe(16); block.copy(sSeal, 0, 20, 36);
        
        mSeal[0] = (mSeal[0] & 0xC0) | (constants.VAL_TYPE.MAP & 0x3F);
        sSeal[0] = (sSeal[0] & 0xC0) | (constants.VAL_TYPE.SEQUENCE & 0x3F);
        
        this.map = new MapEngine(this.allocator, mSeal);
        this.seq = new Sequence(this.allocator, sSeal);
        
        this.db.cacheStructure(this.ptr, { map: this.map, seq: this.seq });
    }

    /**
     * @method _updateHeader
     * @description Seals the internal coordinates of the Map and Sequence into the master block.
     */
    _updateHeader() {
        if (!this.map || !this.seq || !this.ptr) return;
        const data = Buffer.alloc(36).fill(0);
        data.write(constants.MAGIC_DICT_DIR, 0);
        
        const mSeal = SmartPointer.toBuffer({ ...this.map.ptr, type: constants.VAL_TYPE.MAP });
        const sSeal = SmartPointer.toBuffer({ ...this.seq.ptr, type: constants.VAL_TYPE.SEQUENCE });
        
        mSeal.copy(data, 4); 
        sSeal.copy(data, 20);
        
        this.db._writeChainSafe(this.ptr, data);
        this.db.cacheStructure(this.ptr, { map: this.map, seq: this.seq });
    }

    /**
     * @method set
     * @description 
     *  Etches a new name and form into reality.
     *  THE TIKKUN: Relies on the Prophecy of the Map to know if the key is new, 
     *  and only updates the physical header if the foundations have shifted.
     */
    set(key, value, options = {}) {
        this._init(); 
        if (!this.map) this.create();
        
        const kBuf = keyEncoding.encode(key);
        
        // Capture the physical anchors before the change
        const oldMapPtrHash = this.map.ptr ? `${this.map.ptr.blockId}_${this.map.ptr.offset}_${this.map.ptr.length}` : '';
        const oldSeqPtrHash = this.seq.ptr ? `${this.seq.ptr.blockId}_${this.seq.ptr.offset}_${this.seq.ptr.length}` : '';
        
        // The Eye of Prophecy: The Map directly returns the magnitude of expansion
        const delta = this.map.set(kBuf, options.isPtr ? value : this.allocator.save(value), { ...options, isPtr: true });
        
        if (delta > 0) {
             // A new soul has been spoken; add it to the chronology
             const keyPtr = this.allocator.save(String(key));
             this.seq.push(keyPtr);
        }
        
        // Capture the physical anchors after the change
        const newMapPtrHash = this.map.ptr ? `${this.map.ptr.blockId}_${this.map.ptr.offset}_${this.map.ptr.length}` : '';
        const newSeqPtrHash = this.seq.ptr ? `${this.seq.ptr.blockId}_${this.seq.ptr.offset}_${this.seq.ptr.length}` : '';
        
        // The Patient Gatekeeper: Only etch the disk if the anchors shifted or a soul was added.
        // Because of padded allocation, the block dimensions often remain perfectly still.
        if (delta > 0 || oldMapPtrHash !== newMapPtrHash || oldSeqPtrHash !== newSeqPtrHash) {
            this._updateHeader();
        }
    }

    /**
     * @method delete
     * @description Withdraws the light of a specific name.
     */
    delete(key) {
        this._init(); 
        if (!this.map) return false;
        
        const kBuf = keyEncoding.encode(key);
        const res = this.map.delete(kBuf);
        
        if(res.success) this._updateHeader();
        return res.success;
    }

    /**
     * @method getPtr
     * @description A flash of insight that pierces the veil of the Dictionary to locate the physical anchor.
     */
    getPtr(key) {
        this._init();
        return this.map ? this.map.getPtr(keyEncoding.encode(key)) : undefined;
    }

    /**
     * @method get
     * @description Fully hydrates the vessel at the given key.
     */
    get(key, ctx) {
        this._init();
        return this.map ? this.map.get(keyEncoding.encode(key), ctx) : undefined;
    }

    /**
     * @method keys
     * @description Yields the chronological sequence of spoken names.
     */
    * keys() {
        this._init(); 
        if (!this.seq) return;
        
        for (let i = 0; i < this.seq.length(); i++) {
            yield SmartPointer.resolve(this.seq.getPtr(i), this.allocator);
        }
    }

    /**
     * @method entries
     * @description Faithful propagation of the cycle-detection context.
     */
    * entries(ctx) {
        for (const k of this.keys()) {
            yield [k, this.get(k, ctx)];
        }
    }
}
module.exports = DictionaryEngine;
