
// B"H
/**
 * @file navigator.js
 * @description
 *  The Compass of the Awtsmoos.
 *  Traverses the physical structures to locate the exact coordinates
 *  of a given key or index. 
 */
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const FlatObject = require('../../structure/flat/object.js');
const FlatArray = require('../../structure/flat/array.js');
const keys = require('../../utils/binary/keys.js');
const HandleRegistry = require('../../core/registry/handle.js');

class Navigator {
    constructor(handle) { 
        this.handle = handle; 
        this.db = handle.db; 
    }
    
    navigate(k, p = null, t = null) { 
        return HandleRegistry.createHandle(this.db, p, t, { parent: this.handle.self, key: k }); 
    }
    
    resolveStructPtr() {
        if (this.handle.ptr) {
            const dec = SmartPointer.decode(this.handle.ptr);
            if (dec) {
                return { offset: dec.offset, length: dec.length };
            }
        }
        if (this.db.root && this.handle === HandleRegistry.getSoul(this.db.root) && this.db.rootPtrRaw) {
             const dec = SmartPointer.decode(this.db.rootPtrRaw);
             if (dec) return { offset: dec.offset, length: dec.length };
        }
        return null;
    }

    resolveKey(k) {
        const ptr = this.resolveStructPtr(); 
        if (!ptr) return null;
        
        let vp; 
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        
        if (type === T.SMART_OBJECT) {
            const flat = new FlatObject(this.db.allocator, ptr);
            vp = flat.get(k);
        } else if (type === T.SMART_ARRAY) {
            const flat = new FlatArray(this.db.allocator, ptr);
            vp = flat.get(parseInt(k));
        } else if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET || type === T.JS_SET) {
            const idx = parseInt(k);
            if (!isNaN(idx)) {
                const engine = new Sequence(this.db.allocator, ptr);
                vp = engine.getPtr(idx);
            }
        } else {
            const ek = keys.encode(k);
            if (type === T.MAP || type === T.JS_MAP) {
                const engine = new MapEngine(this.db.allocator, ptr);
                vp = engine.getPtr(ek);
            } else {
                const engine = new Dictionary(this.db.allocator, ptr);
                vp = engine.getPtr(ek);
            }
        }
        return vp ? { ptr: vp, type: SmartPointer.getType(vp) } : null;
    }
}
module.exports = Navigator;
