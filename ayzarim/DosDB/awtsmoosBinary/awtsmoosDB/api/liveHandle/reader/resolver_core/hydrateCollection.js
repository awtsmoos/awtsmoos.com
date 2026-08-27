
// B"H
/**
 * @file hydrateCollection.js
 * @description
 * Chapter 42: The Stream of Unity.
 * Arrays and Sets are sequences of sparks without explicit names (keys).
 * We rehydrate them by walking the B-Tree of counts.
 */

const constants = require('../../../../constants.js');
const Sequence = require('../../../../structure/sequence/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

module.exports = {
    /**
     * @method hydrate
     * @description Materializes a binary sequence into a JS Array or Set.
     */
    hydrate(val, ctx, addrKey, hydrateStructureFn, db) {
        const T = constants.VAL_TYPE;
        const isSet = (val.type === T.SET || val.type === T.JS_SET);
        const collection = isSet ? new Set() : []; 
        
        // Stake the claim
        ctx.set(addrKey, collection);
        
        // Route 1: Flat Arrays
        if (val.type === T.SMART_ARRAY) {
            const arr = new FlatArray(db.allocator, val);
            const len = arr.length();
            for(let i = 0; i < len; i++) {
                let item = SmartPointer.resolve(arr.get(i), db.allocator, ctx);
                if (item && item.isStructure) item = hydrateStructureFn(item, ctx, db);
                
                if (isSet) collection.add(item); else collection.push(item);
            }
            return collection;
        }

        // Route 2: B-Tree Sequences
        const seq = new Sequence(db.allocator, val); 
        const len = seq.length(); 
        const maxLen = Math.min(len, 20000); 
        
        for(let i = 0; i < maxLen; i++) {
            let item = seq.get(i, ctx); 
            if (item && item.isStructure) item = hydrateStructureFn(item, ctx, db);
            
            if (isSet) collection.add(item); else collection.push(item);
        }
        
        return collection;
    }
};
