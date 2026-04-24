
// B"H
/**
 * @file structBuilder.js
 * @description
 *  The Sefirah of Chesed (Kindness) — The infinite flow of emanation into structure.
 * 
 *  REWRITTEN: Forces circularity protection by registering the vessel seal
 *  IMMEDIATELY upon creation, before any children are manifested.
 *  Uses pure, direct paths to bypass corrupted legacy module gateways.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const FlatObject = require('../structure/flat/object/index.js');
const FlatArray = require('../structure/flat/array/index.js');
const SmartPointer = require('./smartPointer.js');
const fs = require('fs');

class StructBuilder {
    constructor(allocator) { 
        this.allocator = allocator; 
    }

    _log(msg) {
        if (this.allocator.db && this.allocator.db.debug) {
            try { fs.writeSync(2, `\x1b[33mB"H [BUILDER] ${msg}\x1b[0m\n`); } catch(e) {}
        }
    }

    /**
     * @description Recursively builds database vessels from native JS values.
     */
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

        // 3. LEAF VALUES (STREAMS AND BUFFERS)
        const isLeaf = Buffer.isBuffer(val) || 
                       ArrayBuffer.isView(val) || 
                       val instanceof ArrayBuffer || 
                       val instanceof Date || 
                       val instanceof RegExp || 
                       val instanceof Error;
                       
        if (isLeaf) return this.allocator.primitiveSaver.save(val);
        
        // 4. CIRCULARITY PROTECTION (THE BOOK OF NAMES)
        if (visited.has(val)) {
            const state = visited.get(val);
            if (state.building && typeof state.vessel.shatter === 'function') {
                // B"H: The Tikkun of the Cycle.
                // If a Flat vessel loops back on itself, it must elevate (shatter)
                // into a stable B-Tree before returning its physical pointer to the child.
                // This guarantees the child receives a permanent, unshifting Dictionary coordinate.
                if (!state.vessel.isShattered) {
                    state.vessel.shatter();
                }
            }
            return SmartPointer.toBuffer(state.vessel.ptr);
        }

        // 5. EXPLICIT MARKERS (new db.Map(), etc.)
        if (val._isAwtsmoosMap) {
            const engine = new MapEngine(this.allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: engine });
            return seal;
        }
        
        if (val._isAwtsmoosList || val._isAwtsmoosSequence) {
            const engine = new Sequence(this.allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: engine });
            return seal;
        }
        
        if (val._isAwtsmoosObject) {
            const engine = new Dictionary(this.allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: engine });
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
            
            const state = { building: true, vessel: engine };
            visited.set(val, state);

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
            
            state.building = false;
            return finalSeal;
        }

        // 8. ARRAYS (FLAT PACKED)
        if (Array.isArray(val)) {
            const flat = new FlatArray(this.allocator);
            flat.create();
            
            const state = { building: true, vessel: flat };
            visited.set(val, state);
            
            for (let i = 0; i < val.length; i++) {
                const itemSeal = this.build(val[i], visited);
                const res = flat.push(itemSeal);
                if (res && res.shattered) flat.ptr = res.ptr; 
            }
            
            state.building = false;
            return SmartPointer.toBuffer(flat.ptr);
        }

        // 9. GENERIC OBJECTS (FLAT PACKED)
        const flatObj = new FlatObject(this.allocator);
        flatObj.create();
        
        const state = { building: true, vessel: flatObj };
        visited.set(val, state);

        for (const key of Object.keys(val)) {
            const propSeal = this.build(val[key], visited);
            const res = flatObj.set(key, propSeal);
            if (res && res.shattered) flatObj.ptr = res.ptr;
        }
        
        state.building = false;
        return SmartPointer.toBuffer(flatObj.ptr);
    }
}
module.exports = StructBuilder;
