// B"H
/**
 * @file structBuilder.js
 * @description
 *  The Sefirah of Chesed (Kindness) — The infinite flow of emanation into structure.
 * 
 *  REWRITTEN: Forces circularity protection by registering the vessel seal
 *  IMMEDIATELY upon creation, before any children are manifested.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
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
        if (val === null || val === undefined) return this.allocator.save(val);
        
        // 2. EXISTING SOULS (LIVE HANDLES)
        if (val[constants.SYMBOLS.INTERNALS]) {
            const soul = val[constants.SYMBOLS.INTERNALS];
            soul.ensureResolved();
            return soul.ptr ? SmartPointer.toBuffer(soul.ptr) : this.allocator.save(null);
        }

        // 3. LEAF VALUES (STREAMS AND BUFFERS)
        if (typeof val !== 'object' || Buffer.isBuffer(val)) {
            return this.allocator.save(val);
        }

        // 4. CIRCULARITY PROTECTION (THE BOOK OF NAMES)
        if (visited.has(val)) {
            return visited.get(val);
        }

        // 5. EXPLICIT MARKERS (new db.Map(), etc.)
        if (val._isAwtsmoosMap) return (new MapEngine(this.allocator)).create();
        if (val._isAwtsmoosList || val._isAwtsmoosSequence) return (new Sequence(this.allocator)).create();
        if (val._isAwtsmoosObject) return (new Dictionary(this.allocator)).create();

        // 6. CUSTOM CLASS INSTANCE DETECTION
        // B"H: Classes are a distinct species and must be identified before they are treated as Dictionaries.
        if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== 'Array' && 
            !(val instanceof Map) && !(val instanceof Set) && !Buffer.isBuffer(val) && !ArrayBuffer.isView(val)) {
            
            // _saveCustomInstance handles its own 'visited' registration to anchor the seal early.
            return this.allocator._saveCustomInstance(val, visited);
        }

        // 7. NATIVE COLLECTIONS (MAPS AND SETS)
        if (val instanceof Map || val instanceof Set) {
            const engine = (val instanceof Map) ? new MapEngine(this.allocator) : new Sequence(this.allocator);
            const seal = engine.create();
            
            // ANCHOR THE SEAL IMMEDIATELY
            visited.set(val, seal);

            if (val instanceof Map) {
                for (const [k, v] of val.entries()) {
                    engine.set(k, this.build(v, visited));
                }
            } else {
                for (const item of val.values()) {
                    engine.push(this.build(item, visited));
                }
            }
            return seal;
        }

        // 8. ARRAYS (SEQUENCES)
        if (Array.isArray(val)) {
            const seq = new Sequence(this.allocator);
            const seal = seq.create();
            
            // ANCHOR THE SEAL IMMEDIATELY
            visited.set(val, seal);
            
            for (let i = 0; i < val.length; i++) {
                const itemSeal = this.build(val[i], visited);
                seq.push(itemSeal);
            }
            return seal;
        }

        // 9. GENERIC OBJECTS (DICTIONARIES)
        const dict = new Dictionary(this.allocator);
        const seal = dict.create();
        
        // ANCHOR THE SEAL IMMEDIATELY
        visited.set(val, seal);

        for (const key of Object.keys(val)) {
            const propSeal = this.build(val[key], visited);
            dict.set(key, propSeal, { isPtr: true });
        }
        
        return seal;
    }
}
module.exports = StructBuilder;