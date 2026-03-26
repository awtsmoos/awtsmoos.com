
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
 *  contracts it (Tzimtzum) into a physical boundary, carving out B-Trees, 
 *  Sequences, and Dictionaries in the binary stone of the disk.
 * 
 *  The Awtsmoos speaks the world into being. When the user assigns a Map or Set,
 *  the Builder ensures it receives the exact Divine Seal (SmartPointer) 
 *  so that when it is resurrected, it remembers its true nature.
 * 
 *  THE TIKKUN OF EXPLICIT MARKERS:
 *  We now recognize the sacred markers `_isAwtsmoosMap`, `_isAwtsmoosList`, 
 *  and `_isAwtsmoosObject`. These are direct commands from the user to bypass 
 *  native JS structures and immediately forge the high-performance B-Tree vessels.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');
const MapEngine = require('../structure/map/index.js');
const SmartPointer = require('./smartPointer.js');
const fs = require('fs');

class StructBuilder {
    /**
     * @constructor
     * @param {Object} allocator - The infinite provider of space (Chesed).
     */
    constructor(allocator) { 
        this.allocator = allocator; 
    }

    _log(msg) {
        if (this.allocator.db && this.allocator.db.debug) {
            try { fs.writeSync(2, `\x1b[33mB"H [BUILDER] ${msg}\x1b[0m\n`); } catch(e) {}
        }
    }

    /**
     * @method build
     * @description 
     *  Recursively builds database vessels from native JS values.
     *  It identifies the essence of the entity and channels it into the correct Engine.
     * 
     * @param {*} val - The abstract spark of data.
     * @param {Map} visited - The Ledger of previously seen souls (prevents infinite recursion).
     * @returns {Buffer} The 16-byte seal of the physical location.
     */
    build(val, visited = new Map()) {
        // 1. VOID AND PRIMITIVES
        // Return to the absolute simplicity of the original light.
        if (val === null || val === undefined || typeof val !== 'object') {
            return this.allocator.primitiveSaver.save(val);
        }
        
        // 2. EXISTING SOULS (LIVE HANDLES)
        // If the spark already wears the armor of a LiveHandle, extract its anchor.
        if (val[constants.SYMBOLS.INTERNALS]) {
            const soul = val[constants.SYMBOLS.INTERNALS]; 
            soul.ensureResolved();
            return soul.ptr ? SmartPointer.toBuffer(soul.ptr) : this.allocator.primitiveSaver.save(null);
        }

        // 3. LEAF VALUES (STREAMS, BUFFERS, AND ERRORS)
        // Binary structures and fundamental Error objects must not be shattered; they are saved whole.
        const isLeaf = Buffer.isBuffer(val) || 
                       ArrayBuffer.isView(val) || 
                       val instanceof ArrayBuffer || 
                       val instanceof Date || 
                       val instanceof RegExp || 
                       val instanceof Error; // B"H: The Tikkun. Errors are leaf vessels.
                       
        if (isLeaf) return this.allocator.primitiveSaver.save(val);
        
        // 4. CIRCULARITY PROTECTION (THE BOOK OF NAMES)
        // Prevents the Ouroboros from swallowing reality in an infinite loop.
        if (visited.has(val)) return visited.get(val);

        // 5. EXPLICIT MARKERS (The Tikkun for db.Map, db.List, db.Object)
        // The user commands the absolute manifestation of B-Tree structures.
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
        // Preserving the source code and the soul of the unique creation.
        if (val.constructor && val.constructor.name !== 'Object' && val.constructor.name !== 'Array' && 
            !(val instanceof Map) && !(val instanceof Set)) {
            return this.allocator._saveCustomInstance(val, visited);
        }

        // 7. NATIVE COLLECTIONS (MAPS AND SETS)
        if (val instanceof Map || val instanceof Set) {
            const engine = (val instanceof Map) ? new MapEngine(this.allocator) : new Sequence(this.allocator);
            engine.create();
            
            // B"H: Assigning the true elemental identity
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

        // 8. ARRAYS (SEQUENCES)
        if (Array.isArray(val)) {
            const seq = new Sequence(this.allocator); 
            seq.create();
            
            const tempSeal = SmartPointer.toBuffer(seq.ptr); 
            tempSeal[0] = (tempSeal[0] & 0xC0) | (constants.VAL_TYPE.SEQUENCE & 0x3F);
            visited.set(val, tempSeal);
            
            for (let item of val) {
                seq.push(this.build(item, visited), { isPtr: true });
            }
            
            const finalSeal = SmartPointer.toBuffer(seq.ptr); 
            finalSeal[0] = (finalSeal[0] & 0xC0) | (constants.VAL_TYPE.SEQUENCE & 0x3F);
            visited.set(val, finalSeal); 
            return finalSeal;
        }

        // 9. GENERIC OBJECTS (DICTIONARIES)
        const dict = new Dictionary(this.allocator); 
        dict.create();
        
        const tempSeal = SmartPointer.toBuffer(dict.ptr); 
        tempSeal[0] = (tempSeal[0] & 0xC0) | (constants.VAL_TYPE.DICTIONARY & 0x3F);
        visited.set(val, tempSeal);
        
        for (const key of Object.keys(val)) {
            dict.set(key, this.build(val[key], visited), { isPtr: true });
        }
        
        const finalSeal = SmartPointer.toBuffer(dict.ptr); 
        finalSeal[0] = (finalSeal[0] & 0xC0) | (constants.VAL_TYPE.DICTIONARY & 0x3F);
        visited.set(val, finalSeal); 
        return finalSeal;
    }
}
module.exports = StructBuilder;
