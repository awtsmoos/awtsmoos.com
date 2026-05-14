
// B"H
/**
 * @file extractor.js
 * @module TokenExtractor
 * @description
 *  =============================================================================
 *  CHAPTER 9: SHVIRAT HAKEILIM (THE SHATTERING OF THE VESSELS)
 *  =============================================================================
 *  "And the earth was astonishingly empty, and darkness was on the face of the deep..." (Genesis 1:2)
 *  
 *  Before order can be established in the Book of Names (the Index), the massive 
 *  unified structures (Objects, Arrays) must be shattered into their constituent 
 *  sparks (Tokens). 
 * 
 *  This module is entirely Data-Based. It utilizes a `TypeHandlers` Map to route 
 *  the extraction logic based on the 'typeof' the entity. No infinite 'if/else' 
 *  chains shall defile this sacred space. 
 *  
 *  CRUCIAL REVELATION: When the system passes a `LiveHandle` proxy to this extractor, 
 *  the proxy disguises itself as a 'function'. We now pierce this veil. If the 
 *  entity possesses the holy `__resolve__` method, we invoke it, flooding the 
 *  stack with the fully hydrated JSON object, ensuring every hidden word is found.
 */

const tokenizer = require('./tokenizer.js');

/**
 * @const TypeHandlers
 * @description A holy mapping of JavaScript fundamental types to their extraction rites.
 */
const TypeHandlers = {
    'string': (val, parts, stack) => {
        parts.push(val);
    },
    'number': (val, parts, stack) => {
        parts.push(String(val));
    },
    'boolean': (val, parts, stack) => {
        parts.push(String(val));
    },
    'object': (val, parts, stack) => {
        // Inorganic matter like Buffers, Dates, and RegExps do not yield searchable text directly
        if (Buffer.isBuffer(val) || ArrayBuffer.isView(val) || val instanceof Date || val instanceof RegExp) {
            return;
        }

        if (Array.isArray(val)) {
            if (val.every(item => typeof item === 'number')) {
                return;
            }

            for (let i = 0; i < val.length; i++) {
                stack.push(val[i]);
            }
        } else {
            // Descend into the Dictionary
            for (const k in val) {
                if (!k.startsWith('__')) { // Ignore internal magical properties
                    stack.push(val[k]);
                }
            }
        }
    },
    'function': (val, parts, stack) => {
        // B"H: The Revelation of the Hidden Light.
        // A LiveHandle Proxy masquerades as an empty function. We must command it 
        // to reveal its true internal state via __resolve__(), drawing its essence 
        // back into the physical realm for indexing.
        if (val && typeof val.__resolve__ === 'function') {
            stack.push(val.__resolve__());
        }
    },
    'undefined': () => {},
    'symbol': () => {}
};

class TokenExtractor {
    /**
     * @method extract
     * @description Traverses a complex object, extracting all text sparks.
     * @param {*} val The object (or LiveHandle) to shatter.
     * @returns {Set<string>} A unique set of purified tokens.
     */
    static extract(val) {
        const parts = [];
        const stack = [val];
        let depth = 0;
        
        // B"H: The Loop of Emanation
        while (stack.length > 0) {
            // Tzimtzum: Constrain the infinite recursion to prevent stack shattering
            if (depth++ > 200) break; 
            
            const curr = stack.pop();
            if (curr === null || curr === undefined) continue;
            
            const type = typeof curr;
            const handler = TypeHandlers[type];
            
            if (handler) {
                handler(curr, parts, stack);
            }
        }
        
        // Pass the gathered sparks to the Scribe of Words
        return tokenizer.tokenize(parts.join(' '));
    }
}

module.exports = TokenExtractor;
