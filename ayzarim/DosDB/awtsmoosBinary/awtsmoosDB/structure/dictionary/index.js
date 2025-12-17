
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const MapEngine = require('../map/index.js');
const Sequence = require('../sequence/index.js');

class DictionaryEngine {
    constructor(allocator, ptr = null) {
        this.allocator = allocator;
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
    }

    async create() {
        this.map = new MapEngine(this.allocator);
        const mapPtr = await this.map.create();
        this.seq = new Sequence(this.allocator);
        const seqPtr = await this.seq.create();
        
        // B"H: Reverted to full block allocation for stability
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        
        const dictData = Buffer.alloc(36);
        dictData.write(constants.MAGIC_DICT_DIR, 0);
        mapPtr.copy(dictData, 4);
        seqPtr.copy(dictData, 20);
        
        await this.allocator.v1.db._writeChainSafe(ptr, dictData);
        
        this.ptr = ptr;
        
        return SmartPointer.block(constants.TYPE_DICTIONARY, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    async _init(force = false) {
        if (!this.ptr) return;
        
        if (!force && this.map && this.seq) return;
        if (!force && this.isDirty && this.map && this.seq) return;

        const readLen = 36;
        const ptrToRead = { ...this.ptr, length: readLen };
        const block = await this.allocator.v1.db._readChainSafe(ptrToRead);
        
        if (!block) throw new Error(`Dictionary Block ${this.ptr.blockId} missing`);
        
        const magic = block.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_DICT_DIR) {
                const hex = block.subarray(0, 32).toString('hex');
                if (hex.startsWith("00000000")) {
                    throw new Error(`B"H: Dictionary Corruption at B${this.ptr.blockId}. Block zeroed.`);
                }
                throw new Error(`Invalid Dictionary Signature at ${this.ptr.blockId}. Expected DDIR, got ${magic}`);
        }

        const mapRes = await SmartPointer.resolve(block.subarray(4, 20), this.allocator);
        if (mapRes) {
            if (!this.map || this.map.ptr.blockId !== mapRes.blockId || this.map.ptr.offset !== mapRes.offset) {
                this.map = new MapEngine(this.allocator, { blockId: mapRes.blockId, offset: mapRes.offset, length: mapRes.length, isChain: mapRes.isChain });
            }
        }
        
        const seqRes = await SmartPointer.resolve(block.subarray(20, 36), this.allocator);
        if (seqRes) {
            if (!this.seq || this.seq.ptr.blockId !== seqRes.blockId || this.seq.ptr.offset !== seqRes.offset) {
                this.seq = new Sequence(this.allocator, { blockId: seqRes.blockId, offset: seqRes.offset, length: seqRes.length, isChain: seqRes.isChain });
            }
        }
        
        if (force) this.isDirty = false;
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

    async _saveHeader() {
        if (!this.map || !this.seq) return;
        const dictData = Buffer.alloc(36);
        dictData.write(constants.MAGIC_DICT_DIR, 0);
        SmartPointer.block(constants.TYPE_MAP, this.map.ptr.blockId, this.map.ptr.length, this.map.ptr.isChain, this.map.ptr.offset).copy(dictData, 4);
        SmartPointer.block(constants.TYPE_SEQUENCE, this.seq.ptr.blockId, this.seq.ptr.length, this.seq.ptr.isChain, this.seq.ptr.offset).copy(dictData, 20);
        
        await this.allocator.v1.db._writeChainSafe(this.ptr, dictData);
        this.isDirty = false;
    }

    async set(key, value, options = {}) {
        await this._init(); 
        const existing = await this.map.get(key);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        let valPtr = (isPtr) ? value : ((Buffer.isBuffer(value) && value.length === 16) ? value : await this.allocator.save(value));
        
        const oldMapPtr = { ...this.map.ptr }; 
        await this.map.set(key, valPtr, { isPtr: true, skipFree });
        
        this.isDirty = true;
        
        // B"H: Strict check on object identity and value
        if (this.map.ptr.blockId !== oldMapPtr.blockId || 
            this.map.ptr.offset !== oldMapPtr.offset ||
            this.map.ptr.length !== oldMapPtr.length) { 
            await this._saveHeader();
        }

        if (existing === undefined) {
            const oldSeqPtr = { ...this.seq.ptr };
            await this.seq.push(key);
            this.isDirty = true;
            
            if (this.seq.ptr.blockId !== oldSeqPtr.blockId || 
                this.seq.ptr.offset !== oldSeqPtr.offset ||
                this.seq.ptr.length !== oldSeqPtr.length) { 
                await this._saveHeader();
            }
        }
    }

    async get(key, context) {
        await this._init();
        return this.map.get(key, context);
    }

    async getPtr(key) {
        await this._init();
        return this.map.getPtr(key);
    }

    async delete(key) {
        await this._init();
        const existing = await this.map.get(key);
        if (existing === undefined) return false;
        
        await this.map.delete(key);
        this.isDirty = true;
        
        const len = await this.seq.length();
        for(let i=0; i<len; i++) {
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
        const mapStats = await this.map.stats();
        const seqStats = await this.seq.stats();
        return { count: seqStats.count, size: mapStats.size + seqStats.size, capacity: seqStats.capacity };
    }

    async* keys() {
        await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) yield await this.seq.get(i);
    }

    async* values() {
        await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) yield await this.map.get(await this.seq.get(i));
    }

    async* entries() {
        await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) {
            const k = await this.seq.get(i);
            yield [k, await this.map.get(k)];
        }
    }
}
module.exports = DictionaryEngine;
