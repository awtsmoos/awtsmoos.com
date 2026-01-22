// B"H
/**
 * @file iterator.js
 * @description 
 *  Separated Iterator logic for DictionaryEngine.
 *  Handles Key retrieval from Sequence layer.
 */

const keyEncoding = require('../../utils/keyEncoding.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[35mB"H [DICT_ITER] ${msg}\x1b[0m\n`); } catch(e) {}
}

module.exports = {
    * keys(engine) {
        if (!engine.seq) return;
        const len = engine.seq.length();
        // log(`Enumerating ${len} keys`);
        
        for(let i=0; i<len; i++) {
            const ptr = engine.seq.getPtr(i);
            if (!ptr) continue;
            
            // Resolve pointer to Key value (String)
            // Use allocator directly to avoid overhead of recursive 'resolve' if mostly primitives
            const resolver = engine.allocator || engine.v1;
            const SmartPointer = require('../../utils/smartPointer.js');
            const key = SmartPointer.resolve(ptr, resolver);
            
            if (key !== undefined) yield key;
        }
    },

    * entries(engine, context) {
        for (const k of this.keys(engine)) {
            const encodedKey = keyEncoding.encode(k);
            const ptr = engine.map.getPtr(encodedKey);
            if (ptr) {
                const SmartPointer = require('../../utils/smartPointer.js');
                // Use existing context if recursion needed for values
                const val = SmartPointer.resolve(ptr, engine.allocator, context);
                yield [k, val];
            } else {
                yield [k, undefined];
            }
        }
    }
};