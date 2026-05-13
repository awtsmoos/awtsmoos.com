
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
}

module.exports = DictionaryEngine;
