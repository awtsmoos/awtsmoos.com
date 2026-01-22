// B"H
/**
 * @file indexer_ops.js
 * @description Low-level Sync Index Operations.
 */
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const constants = require('../../constants.js');
const tokenizer = require('./tokenizer.js');
const HandleRegistry = require('../../core/handleRegistry.js');

module.exports = {
    extractTokens(val) {
        const parts = [];
        const stack = [val];
        let depth = 0;
        
        while (stack.length > 0) {
            if (depth++ > 200) break; // Safety
            const curr = stack.pop();
            
            if (curr === null || curr === undefined) continue;
            
            if (typeof curr === 'string') {
                parts.push(curr);
            } else if (typeof curr === 'number' || typeof curr === 'boolean') {
                parts.push(String(curr));
            } else if (typeof curr === 'object') {
                if (Buffer.isBuffer(curr)) continue;
                if (ArrayBuffer.isView(curr)) continue;
                if (curr instanceof Date) continue;
                if (curr instanceof RegExp) continue;

                // Arrays / Objects
                if (Array.isArray(curr)) {
                    for (let i = 0; i < curr.length; i++) stack.push(curr[i]);
                } else {
                    for (const k in curr) {
                        // Skip meta keys
                        if (!k.startsWith('__')) stack.push(curr[k]);
                    }
                }
            }
        }
        return tokenizer.tokenize(parts.join(' '));
    },

    addToken(db, indexHandle, token, ptr) {
        // Sync check existence
        const tokenList = indexHandle[token]; // Sync getter
        
        if (tokenList) {
            // Push to existing list
            tokenList.push(ptr);
        } else {
            // Create new list vessel
            indexHandle[token] = new db.List();
            
            // B"H: The 'new db.List()' is just a marker. 
            // We must retrieve the manifest LiveHandle from the DB to access methods like .push()
            const newList = indexHandle[token];
            
            if (newList && typeof newList.push === 'function') {
                newList.push(ptr);
            } else {
                // Should not happen if DB is healthy
                throw new Error(`B"H Fatal: Failed to manifest index list for token '${token}'`);
            }
        }
    },

    removeToken(db, indexHandle, token, ptrHexToRemove) {
        const tokenList = indexHandle[token];
        if (!tokenList) return;
        
        // Scan list synchronously
        // Need to find index.
        let idxToRemove = -1;
        
        // Access raw pointers efficiently via internal sequence engine
        const listInt = tokenList[constants.SYMBOLS.INTERNALS];
        if (!listInt) return;
        listInt.ensureResolved();
        
        // If not ptr, empty
        if (!listInt.ptr) return;
        
        const struct = SmartPointer.resolve(listInt.ptr, db.allocator);
        const seq = new Sequence(db.allocator, struct);
        const len = seq.length();
        
        for (let i = 0; i < len; i++) {
            const p = seq.getPtr(i);
            if (p && p.toString('hex') === ptrHexToRemove) {
                idxToRemove = i;
                break;
            }
        }
        
        if (idxToRemove !== -1) {
            tokenList.splice(idxToRemove, 1);
            
            // If empty, delete key from index map entirely to save space
            if (len === 1) { 
                indexHandle.delete(token);
            }
        }
    }
};