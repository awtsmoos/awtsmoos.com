// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Geburah - The Construct of the Dictionary.
 *  Maintains key-value pairs while preserving insertion order.
 *  Uses an internal Map (for fast lookup) and Sequence (for order).
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class DictionaryEngine {
    /**
     * @description Constructs the Dictionary vessel.
     * @param {AllocatorV2} allocator - The Scribe of the blocks.
     * @param {object} ptr - The 16-byte structure descriptor.
     */
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
        // B"H: Normalization of pointer
        if (ptr && typeof ptr === 'object') {
            this.ptr = ptr;
        } else if (typeof ptr === 'number') {
            this.ptr = { blockId: ptr, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        } else {
            this.ptr = null;
        }
        this.map = null;
        this.seq = null;
        this.isDirty = false; 
        this.lastDbMutation = -1;
        this.db = allocator.v1.db;
    }

    /**
     * @description Creates a new Dictionary structure in the physical realm.
     */
    async create() {
        this.map = new MapEngine(this.allocator);
        const mapPtrBuf = await this.map.create();
        this.seq = new Sequence(this.allocator);
        const seqPtrBuf = await this.seq.create();
        
        // Allocate a fixed block for the Dictionary Header (36 bytes used)
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        
        const dictData = Buffer.alloc(36);
        dictData.write(constants.MAGIC_DICT_DIR, 0);
        mapPtrBuf.copy(dictData, 4);
        seqPtrBuf.copy(dictData, 20);
        
        await this.db._writeChainSafe(ptr, dictData);
        this.ptr = ptr;
        this.lastDbMutation = this.db.mutationCount;
        
        return SmartPointer.block(constants.TYPE_DICTIONARY, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    /**
     * @description Ensures the internal Map and Sequence are manifested and synchronized.
     */
    async _init(force = false) {
        if (!this.ptr) return;
        const currentMutation = this.db.mutationCount || 0;
        
        // B"H: Strict dirty check + mutation count
        if (!force && this.map && this.seq && !this.isDirty && this.lastDbMutation === currentMutation) return;

        // Read the 36-byte header
        // B"H: Ensure we read enough bytes for the header signature + pointers
        const readPtr = { ...this.ptr, length: Math.max(36, this.ptr.length) };
        const block = await this.db._readChainSafe(readPtr);
        
        if (!block) throw new Error(`Dictionary B${this.ptr.blockId} missing`);
        
        const magic = block.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_DICT_DIR) {
             // Fallback for empty/zeroed blocks (corruption recovery)
             if (magic === '\0\0\0\0') {
                 // Attempt repair? Or just throw.
                 throw new Error(`Dictionary B${this.ptr.blockId} is zeroed/empty.`);
             }
             throw new Error(`Invalid Dictionary Signature at B${this.ptr.blockId} (${magic})`);
        }

        const mapPtrBuf = block.subarray(4, 20);
        const seqPtrBuf = block.subarray(20, 36);

        const mapRes = await SmartPointer.resolve(mapPtrBuf, this.allocator);
        const seqRes = await SmartPointer.resolve(seqPtrBuf, this.allocator);

        // B"H: Update internal engines if pointers changed on disk
        if (mapRes) {
            if (!this.map || this.map.ptr.blockId !== mapRes.blockId || this.map.ptr.length !== mapRes.length) {
                this.map = new MapEngine(this.allocator, mapRes);
            }
        }
        
        if (seqRes) {
            if (!this.seq || this.seq.ptr.blockId !== seqRes.blockId || this.seq.ptr.length !== seqRes.length) {
                this.seq = new Sequence(this.allocator, seqRes);
            }
        }

        this.lastDbMutation = currentMutation;
        if(force) this.isDirty = false;
    }

    async destroy() {
        if (!this.ptr) return;
        try { await this._init(); } catch(e) { 
            await this.allocator.v1.free(this.ptr);
            return;
        }
        if (this.map) await this.map.destroy();
        if (this.seq) await this.seq.destroy();
        await this.allocator.v1.free(this.ptr);
    }

    /**
     * @description Persists the current pointers of the internal Map and Sequence.
     */
    async _saveHeader() {
        if (!this.map || !this.seq) return;
        const dictData = Buffer.alloc(36);
        dictData.write(constants.MAGIC_DICT_DIR, 0);
        
        SmartPointer.block(constants.TYPE_MAP, this.map.ptr.blockId, this.map.ptr.length, this.map.ptr.isChain, this.map.ptr.offset).copy(dictData, 4);
        SmartPointer.block(constants.TYPE_SEQUENCE, this.seq.ptr.blockId, this.seq.ptr.length, this.seq.ptr.isChain, this.seq.ptr.offset).copy(dictData, 20);
        
        await this.db._writeChainSafe(this.ptr, dictData);
        this.lastDbMutation = this.db.mutationCount;
        this.isDirty = false;
    }

    /**
     * @description Sets a key-value pair, maintaining order and uniqueness.
     */
    async set(key, value, options = {}) {
        await this._init();
        
        if (!this.map || !this.seq) throw new Error("Dictionary not initialized");

        const existing = await this.map.getPtr(key);
        
        const isPtr = !!options.isPtr;
        // B"H: Auto-detect pointer buffer if isPtr not explicitly set to prevent double-wrapping
        let valPtr;
        if (isPtr) {
            valPtr = value;
        } else if (Buffer.isBuffer(value) && value.length === 16) {
             valPtr = value;
        } else {
             valPtr = await this.allocator.save(value);
        }
        
        const oldMapPtr = { ...this.map.ptr };
        await this.map.set(key, valPtr, { ...options, isPtr: true });
        
        this.isDirty = true;

        // B"H: CRITICAL FIX - Check length changes too!
        if (this.map.ptr.blockId !== oldMapPtr.blockId || 
            this.map.ptr.offset !== oldMapPtr.offset || 
            this.map.ptr.length !== oldMapPtr.length) {
            await this._saveHeader();
        }

        if (existing === undefined) {
            const oldSeqPtr = { ...this.seq.ptr };
            await this.seq.push(key);
            
            if (this.seq.ptr.blockId !== oldSeqPtr.blockId || 
                this.seq.ptr.offset !== oldSeqPtr.offset ||
                this.seq.ptr.length !== oldSeqPtr.length) {
                await this._saveHeader();
            }
        }
    }

    async get(key, context) {
        await this._init();
        if(!this.map) return undefined;
        return await this.map.get(key, context);
    }

    async getPtr(key) {
        await this._init();
        if(!this.map) return undefined;
        return await this.map.getPtr(key);
    }

    /**
     * @description Removes a key from both the map and the sequence.
     */
    async delete(key) {
        await this._init();
        if(!this.map) return false;
        
        const res = await this.map.delete(key);
        if (!res.success) return false;
        
        this.isDirty = true;
        
        const len = await this.seq.length();
        for (let i = 0; i < len; i++) {
            const k = await this.seq.get(i);
            if (k === key) {
                await this.seq.splice(i, 1);
                break;
            }
        }
        await this._saveHeader();
        return true;
    }

    async stats() {
        await this._init();
        const ms = await this.map.stats();
        const ss = await this.seq.stats();
        return { count: ms.count, size: ms.size + ss.size, capacity: ms.capacity + ss.capacity };
    }

    async *keys() {
        await this._init();
        if(!this.seq) return;
        const len = await this.seq.length();
        for (let i = 0; i < len; i++) yield await this.seq.get(i);
    }

    async *values() {
        for await (const k of this.keys()) yield await this.get(k);
    }

    async *entries(context) {
        await this._init();
        if(!this.seq) return;
        const len = await this.seq.length();
        for (let i = 0; i < len; i++) {
            const k = await this.seq.get(i);
            // B"H: Pass context correctly
            yield [k, await this.map.get(k, context)];
        }
    }
}
module.exports = DictionaryEngine;