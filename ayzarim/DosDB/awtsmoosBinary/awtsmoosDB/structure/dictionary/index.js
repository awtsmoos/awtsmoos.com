
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

    /**
     * @method bulkLoadEntries
     * @description
     * Builds a dictionary from fresh entries in one pass: map once, sequence
     * once, wrapper once. The caller controls the entry group size.
     *
     * @param {Array<{key:string|Buffer,value:Buffer}>} entries - Dictionary entries.
     * @param {object} [options] - Builder options.
     * @returns {Buffer} Dictionary seal.
     */
    bulkLoadEntries(entries, options = {}) {
        const MapEngine = require('../map/index.js');
        const SequenceEngine = require('../sequence/index.js');
        const toKeyText = require('./logic/keyText.js');
        const toKeyBytes = require('./logic/keyBytes.js');

        const prepared = Array.from(entries || []).map(entry => {
            const text = toKeyText(entry.key);
            return {
                text,
                mapKey: toKeyBytes(text),
                value: SmartPointer.toBuffer(entry.value)
            };
        });

        const map = new MapEngine(this.allocator);
        const seq = new SequenceEngine(this.allocator);
        const sorted = prepared.slice().sort((a, b) => a.mapKey.compare(b.mapKey));
        const mapSeal = map.bulkLoadSorted(sorted.map(entry => ({ key: entry.mapKey, value: entry.value })), options.map || options);
        const orderPointers = prepared.map(entry => this.allocator.save(entry.text));
        const seqSeal = seq.bulkLoadPointers(orderPointers);

        const total = 4 + 1 + mapSeal.length + 1 + seqSeal.length;
        const loc = this.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total).fill(0);
        buf.write(constants.MAGIC_DIC, 0);
        let p = 4;
        buf.writeUInt8(mapSeal.length, p++);
        mapSeal.copy(buf, p);
        p += mapSeal.length;
        buf.writeUInt8(seqSeal.length, p++);
        seqSeal.copy(buf, p);
        this.db._writeChainSafe(loc, buf);

        this.map = map;
        this.seq = seq;
        this.initialized = true;
        this.ptr = { ...loc, type: constants.VAL_TYPE.DICTIONARY };
        return SmartPointer.toBuffer(this.ptr);
    }

    delete(key) {
        this._init();
        if (!this.initialized || !this.map || !this.seq) return false;

        const encodedKey = Buffer.from(String(key), 'utf8');
        const existed = this.map.getPtr(encodedKey);
        if (!existed) return false;

        const mapDeleted = this.map.delete(encodedKey);
        if (!mapDeleted) return false;

        const len = this.seq.length();
        let foundIndex = -1;
        for (let i = 0; i < len; i++) {
            if (String(this.seq.get(i)) === String(key)) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex >= 0) {
            this.seq.splice(foundIndex, 1);
        }

        const newMS = SmartPointer.toBuffer(this.map.ptr);
        const newSS = SmartPointer.toBuffer(this.seq.ptr);
        const total = 4 + 1 + newMS.length + 1 + newSS.length;
        const loc = this.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total).fill(0);
        buf.write(constants.MAGIC_DIC, 0);
        let p = 4;
        buf.writeUInt8(newMS.length, p++);
        newMS.copy(buf, p);
        p += newMS.length;
        buf.writeUInt8(newSS.length, p++);
        newSS.copy(buf, p);

        this.db._writeChainSafe(loc, buf);
        this.ptr = { ...loc, type: constants.VAL_TYPE.DICTIONARY };
        return true;
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
        const len = this.seq.length();
        for (let i = 0; i < len; i++) {
            yield this.seq.get(i);
        }
    }

    /**
     * @method entries
     * @description
     * Yields insertion-ordered key/value pairs by walking the order sequence and
     * resolving each key through the internal map.
     *
     * @param {object} [context] - Optional hydration context.
     * @yields {[string, *]} Dictionary entry.
     */
    *entries(context) {
        this._init();
        if (!this.map) return;

        const SmartPointer = require('../../utils/smartPointer/index.js');

        for (const key of this.keys()) {
            const ptr = this.map.getPtr(key);
            if (ptr) {
                yield [String(key), SmartPointer.resolve(ptr, this.allocator, context)];
            }
        }
    }
}

module.exports = DictionaryEngine;
