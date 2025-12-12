
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
    }

    async create() {
        this.map = new MapEngine(this.allocator);
        const mapPtr = await this.map.create();
        this.seq = new Sequence(this.allocator);
        const seqPtr = await this.seq.create();
        const header = Buffer.alloc(constants.BLOCK_SIZE);
        header.write(constants.MAGIC_DICT_DIR, 0);
        mapPtr.copy(header, 4); seqPtr.copy(header, 20);
        
        // Allocate block for Dictionary Header (Size 4KB typically)
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        await this.allocator.v1.db._writeChainSafe(ptr, header);
        this.ptr = ptr;
        
        // Pass offset to block pointer
        return SmartPointer.block(constants.TYPE_DICTIONARY, this.ptr.blockId, this.ptr.length, this.ptr.isChain, this.ptr.offset);
    }

    async _init() {
        if (!this.ptr) return;
        if (this.map && this.seq) return;
        
        try {
            const block = await this.allocator.v1.db._readChainSafe(this.ptr);
            if (!block) throw new Error(`Dictionary Block ${this.ptr.blockId} missing`);
            
            const magic = block.toString('utf8', 0, 4);
            if (magic !== constants.MAGIC_DICT_DIR) {
                 const hex = block.subarray(0, 32).toString('hex');
                 if (hex.startsWith("00000000")) {
                     throw new Error(`B"H: Dictionary Corruption Detected at B${this.ptr.blockId}. Block is zeroed out. This usually happens if a WAL file from a previous run was applied to a fresh DB file. Please delete .wal files when deleting .db files.`);
                 }
                 throw new Error(`Invalid Dictionary Signature at ${this.ptr.blockId}:${this.ptr.offset||0}. Expected ${constants.MAGIC_DICT_DIR}, got '${magic.replace(/\0/g, '\\0')}' (Hex: ${hex})`);
            }

            const mapRes = await SmartPointer.resolve(block.subarray(4, 20), this.allocator);
            if (mapRes) this.map = new MapEngine(this.allocator, { blockId: mapRes.blockId, offset: mapRes.offset, length: mapRes.length, isChain: mapRes.isChain });
            
            const seqRes = await SmartPointer.resolve(block.subarray(20, 36), this.allocator);
            if (seqRes) this.seq = new Sequence(this.allocator, { blockId: seqRes.blockId, offset: seqRes.offset, length: seqRes.length, isChain: seqRes.isChain });
        } catch(e) {
            console.error(`B"H - Dictionary Init Failed: ${e.message}`);
            throw e;
        }
    }

    async destroy() {
        if (!this.ptr) return;
        try { await this._init(); } catch(e) { return; }
        if (this.map) await this.map.destroy();
        if (this.seq) await this.seq.destroy();
        await this.allocator.v1.free(this.ptr);
    }

    async _saveHeader() {
        const header = Buffer.alloc(constants.BLOCK_SIZE);
        header.write(constants.MAGIC_DICT_DIR, 0);
        SmartPointer.block(constants.TYPE_MAP, this.map.ptr.blockId, this.map.ptr.length, this.map.ptr.isChain, this.map.ptr.offset).copy(header, 4);
        SmartPointer.block(constants.TYPE_SEQUENCE, this.seq.ptr.blockId, this.seq.ptr.length, this.seq.ptr.isChain, this.seq.ptr.offset).copy(header, 20);
        await this.allocator.v1.db._writeChainSafe(this.ptr, header);
    }

    async set(key, value, options = {}) {
        if (!this.map) await this._init();
        const existing = await this.map.get(key);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        let valPtr = (isPtr) ? value : ((Buffer.isBuffer(value) && value.length === 16) ? value : await this.allocator.save(value));
        
        await this.map.set(key, valPtr, { isPtr: true, skipFree });
        if (existing === undefined) await this.seq.push(key);
        await this._saveHeader();
    }

    async get(key, context) {
        if (!this.map) await this._init();
        return this.map.get(key, context);
    }

    async getPtr(key) {
        if (!this.map) await this._init();
        return this.map.getPtr(key);
    }

    async delete(key) {
        if (!this.map) await this._init();
        const existing = await this.map.get(key);
        if (existing === undefined) return false;
        await this.map.delete(key);
        const len = await this.seq.length();
        for(let i=0; i<len; i++) {
            const k = await this.seq.get(i);
            if (k === key) { await this.seq.splice(i, 1); break; }
        }
        await this._saveHeader();
        return true;
    }

    async stats() {
        if (!this.map) await this._init();
        const mapStats = await this.map.stats();
        const seqStats = await this.seq.stats();
        return { count: seqStats.count, size: mapStats.size + seqStats.size, capacity: seqStats.capacity };
    }

    async* keys() {
        if (!this.seq) await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) yield await this.seq.get(i);
    }

    async* values() {
        if (!this.seq) await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) yield await this.map.get(await this.seq.get(i));
    }

    async* entries() {
        if (!this.seq) await this._init();
        const len = await this.seq.length();
        for(let i=0; i<len; i++) {
            const k = await this.seq.get(i);
            yield [k, await this.map.get(k)];
        }
    }
}
module.exports = DictionaryEngine;
