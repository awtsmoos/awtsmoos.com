
// B"H
/**
 * @file navigator.js
 * @description
 *  The Compass of the Awtsmoos.
 *  Traverses the physical structures to locate the exact coordinates
 *  of a given key or index. It channels the light through Sequences, 
 *  Maps, and Dictionaries, honoring their unique geometries.
 */
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const { readPointer48 } = require('../../utils/binary/helpers.js');
const keys = require('../../utils/binary/keys.js');
const HandleRegistry = require('../../core/registry/handle.js');

class Navigator {
    constructor(handle) { 
        this.handle = handle; 
        this.db = handle.db; 
    }
    
    /**
     * @description Forges a new Proxy portal pointing to a child entity.
     */
    navigate(k, p = null, t = null) { 
        return HandleRegistry.createHandle(this.db, p, t, { parent: this.handle.self, key: k }); 
    }
    
    /**
     * @description Resolves the structural anchor of the current vessel.
     */
    resolveStructPtr() {
        if (this.handle.ptr) {
            const dec = SmartPointer.decode(this.handle.ptr);
            if (dec && (dec.mode === constants.MODE_BLOCK || dec.mode === constants.MODE_HEAP)) {
                return { 
                    blockId: readPointer48(dec.payload, 0), 
                    length: (dec.mode === constants.MODE_BLOCK) ? dec.payload.readUInt32BE(6) : dec.payload.readUInt32BE(10), 
                    offset: (dec.mode === constants.MODE_BLOCK) ? dec.payload.readUInt32BE(10) : dec.payload.readUInt32BE(6), 
                    isChain: (dec.mode === constants.MODE_BLOCK) && dec.payload.readUInt8(14) === 1 
                };
            }
        }
        if (this.db.root && this.handle === HandleRegistry.getSoul(this.db.root) && this.db.rootPtrRaw) {
             const dec = SmartPointer.decode(this.db.rootPtrRaw);
             return { 
                 blockId: readPointer48(dec.payload, 0), 
                 length: dec.payload.readUInt32BE(6), 
                 offset: dec.payload.readUInt32BE(10), 
                 isChain: dec.payload.readUInt8(14) === 1 
             };
        }
        return null;
    }

    /**
     * @description 
     *  Seeks the exact physical location of a requested property.
     *  It maps the external Type ID to the true internal Engine,
     *  ensuring that native Maps/Sets are navigated correctly.
     */
    resolveKey(k) {
        const ptr = this.resolveStructPtr(); 
        if (!ptr) return null;
        
        let vp; 
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        
        // B"H: The Seder Hishtalshelus (Chain of Emanation).
        // We recognize the garments of JS_SET and JS_MAP as their true internal vessels
        // so that structural traversal functions seamlessly.
        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET || type === T.JS_SET) {
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
