
// B"H
/**
 * @file structBuilder.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MASTER BUILDER OF VESSELS (CHESED & GEVURAH)
 *  =============================================================================
 *  "He suspends the earth upon nothingness." (Job 26:7)
 * 
 *  Every thought of the user is abstract, hovering in the void of JavaScript memory.
 *  The StructBuilder is the Architect. It receives the formless intent and 
 *  contracts it (Tzimtzum) into a physical boundary.
 * 
 *  THE TIKKUN OF THE ACCORDION:
 *  Generic Objects `{}` and Arrays `[]` are now instantly contracted into the 
 *  lightning-fast, zero-overhead FlatObject and FlatArray. They will only 
 *  shatter into massive B-Trees if they exceed their bounds.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const FlatObject = require('../structure/flat/object.js');
const FlatArray = require('../structure/flat/array.js');
const SmartPointer = require('./smartPointer.js');

class StructBuilder {
    constructor(allocator) { 
        this.allocator = allocator; 
    }

    build(val, visited = new Map()) {
        // 1. VOID AND PRIMITIVES
        if (val === null || val === undefined || typeof val !== 'object') {
            return this.allocator.primitiveSaver.save(val);
        }
        
        // 2. EXISTING SOULS (LIVE HANDLES)
        if (val[constants.SYMBOLS.INTERNALS]) {
            const soul = val[constants.SYMBOLS.INTERNALS]; 
            soul.ensureResolved();
            return soul.ptr ? SmartPointer.toBuffer(soul.ptr) : this.allocator.primitiveSaver.save(null);
        }

        // 3. LEAF VALUES
        const isLeaf = Buffer.isBuffer(val) || 
                       ArrayBuffer.isView(val) || 
                       val instanceof ArrayBuffer || 
                       val instanceof Date || 
                       val instanceof RegExp || 
                       val instanceof Error;
                       
        if (isLeaf) return this.allocator.primitiveSaver.save(val);
        
        // 4. CIRCULARITY PROTECTION
        if (visited.has(val)) return visited.get(val);

        // 5. EXPLICIT MARKERS
        if (val._isAwtsmoosMap) {
            const engine = new MapEngine(this.allocator);
            const seal = engine.create();
            visited.set(val, seal);
            return seal;
        }
        
        if (val._isAwtsmoosList || val._isAwtsmoosSequence) {
            const engine = new Sequence(this.allocator);
            const seal = engine.create();
            visited.set(val, seal);
            return seal;
        }
        
        if (val._isAwtsmoosObject) {
            const engine = new Dictionary(this.allocator);
            const seal = engine.create();
            visited.set(val, seal);
            return seal;
        }

        // 6. CUSTOM CLASS INSTANCE DETECTION
        if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== 'Array' && 
            !(val instanceof Map) && !(val instanceof Set)) {
            return this.allocator._saveCustomInstance(val, visited);
        }

        // 7. NATIVE COLLECTIONS (MAPS AND SETS)
        if (val instanceof Map || val instanceof Set) {
            const engine = (val instanceof Map) ? new MapEngine(this.allocator) : new Sequence(this.allocator);
            engine.create();
            
            const targetType = (val instanceof Map) ? constants.VAL_TYPE.MAP : constants.VAL_TYPE.SET;
            const tempSeal = SmartPointer.toBuffer(engine.ptr); 
            tempSeal[0] = (tempSeal[0] & 0xC0) | (targetType & 0x3F);
            
            visited.set(val, tempSeal);
            
            if (val instanceof Map) {
                for (let [k, v] of val.entries()) {
                    engine.set((typeof k === 'bigint') ? k.toString() : k, this.build(v, visited), { isPtr: true });
                }
            } else {
                for (let item of val.values()) {
                    engine.push(this.build(item, visited), { isPtr: true });
                }
            }
            
            const finalSeal = SmartPointer.toBuffer(engine.ptr); 
            finalSeal[0] = (finalSeal[0] & 0xC0) | (targetType & 0x3F);
            visited.set(val, finalSeal); 
            return finalSeal;
        }

        // 8. ARRAYS (FLAT PACKED)
        if (Array.isArray(val)) {
            const flat = new FlatArray(this.allocator);
            flat.create();
            
            // Temporary seal for circularity prevention
            visited.set(val, SmartPointer.toBuffer(flat.ptr));
            
            for (let item of val) {
                const itemSeal = this.build(item, visited);
                const res = flat.push(itemSeal);
                if (res.shattered) flat.ptr = res.ptr; 
            }
            
            const finalSeal = SmartPointer.toBuffer(flat.ptr);
            visited.set(val, finalSeal);
            return finalSeal;
        }

        // 9. GENERIC OBJECTS (FLAT PACKED)
        const flatObj = new FlatObject(this.allocator);
        flatObj.create();
        
        // Temporary seal for circularity prevention
        visited.set(val, SmartPointer.toBuffer(flatObj.ptr));

        for (const key of Object.keys(val)) {
            const propSeal = this.build(val[key], visited);
            const res = flatObj.set(key, propSeal);
            if (res.shattered) flatObj.ptr = res.ptr;
        }
        
        const finalSealObj = SmartPointer.toBuffer(flatObj.ptr);
        visited.set(val, finalSealObj);
        return finalSealObj;
    }
}
module.exports = StructBuilder;
