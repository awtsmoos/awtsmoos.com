// B"H
/**
 * @file reader.js
 * @description
 *  The Sefirah of Binah - Discerning the identity within the binary abyss.
 *  REWRITTEN: Forces precise pointer wrapping to prevent "null-access" in collections.
 */

const constants = require('../../constants.js');

class Reader {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.resolver = new (require('./reader_resolve.js'))(this);
        this.iter = new (require('./reader_iter.js'))(this);
    }

    length() {
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return 0;
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            return (new (require('../../structure/sequence/index.js'))(this.db.allocator, structPtr)).length();
        }
        if (type === T.DICTIONARY || type === T.OBJECT) {
            const engine = new (require('../../structure/dictionary/index.js'))(this.db.allocator, structPtr);
            engine._init(); return engine.seq ? engine.seq.length() : 0;
        }
        if (type === T.MAP) {
             const engine = new (require('../../structure/map/index.js'))(this.db.allocator, structPtr);
             const root = engine.nodeIO.load(engine.ptr); return root ? (root.totalCount || 0) : 0;
        }
        return 0;
    }

    slice(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return [];
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        if (type !== T.SEQUENCE && type !== T.ARRAY && type !== T.SET) return [];
        const seq = new (require('../../structure/sequence/index.js'))(this.db.allocator, structPtr);
        const len = seq.length();
        let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));
        const res = [];
        for (let i = s; i < e; i++) {
            const ptr = seq.getPtr(i);
            const val = seq.get(i);
            res.push(this._wrapIfNeeded(val, i, ptr));
        }
        return res;
    }

    resolveSelf() { return this.resolver.resolveSelf(); }
    keys() { return this.iter.keys(); }
    values() { return this.iter.values(); }
    entries() { return this.iter.entries(); }
    iterator() { return this.iter.iterator(); }

    _wrapIfNeeded(val, key, ptr) {
        // B"H: If the value is NULL or UNDEFINED, return it as a pure spark.
        if (val === null || val === undefined) return val;
        
        const SmartPointer = require('../../utils/smartPointer.js');
        const isStructure = (val && val.isStructure === true);
        
        // Discerning the Type of the vessel.
        let type = isStructure ? val.type : (ptr ? SmartPointer.getType(ptr) : 0);
        
        const T = constants.VAL_TYPE;
        const isContainer = (
            type === T.MAP || type === T.SEQUENCE || type === T.DICTIONARY || 
            type === T.SET || type === T.OBJECT || type === T.ARRAY || type === T.JSON
        );

        if (isContainer) {
            const HandleRegistry = require('../../core/handleRegistry.js');
            // CRITICAL: Ensure the handle uses its true 16-byte binary seal as the anchor.
            const finalPtr = (ptr && Buffer.isBuffer(ptr)) ? ptr : SmartPointer.toBuffer(val.ptr || val);
            return HandleRegistry.createHandle(this.db, finalPtr, type, { parent: this.handle.self, key });
        }
        return val;
    }
}

module.exports = Reader;