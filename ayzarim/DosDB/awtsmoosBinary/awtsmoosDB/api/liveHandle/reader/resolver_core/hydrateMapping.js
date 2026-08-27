
// B"H
/**
 * @file hydrateMapping.js
 * @description 
 * Chapter 41: The Tapestry of Names.
 * This module resurrects Dictionaries, Maps, and Objects. 
 * 
 * TIKKUN OF VELOCITY: We utilize a pre-warmed 'ctx' to handle nesting. 
 * By separating 'hydrateStructure' as a passed argument, we effectively 
 * break the Node.js circular dependency seal.
 */

const constants = require('../../../../constants.js');
const Dictionary = require('../../../../structure/dictionary/index.js');
const MapEngine = require('../../../../structure/map/index.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const keyEncoding = require('../../../../utils/keyEncoding.js');

module.exports = {
    /**
     * @method hydrate
     * @description Materializes a binary mapping into a JS Object or Map.
     */
    hydrate(val, ctx, addrKey, hydrateStructureFn, db) {
        const T = constants.VAL_TYPE;
        const isMapType = (val.type === T.MAP || val.type === T.JS_MAP);
        const obj = isMapType ? new Map() : {}; 
        
        // Stake our claim in the Reshimu before recursion begins
        ctx.set(addrKey, obj);
        
        // Route 1: Flat Objects (Dense micro-vessels)
        if (val.type === T.SMART_OBJECT) {
            const flat = new FlatObject(db.allocator, val);
            for (const [k, v] of flat.entries(ctx)) {
                obj[k] = (v && v.isStructure) ? hydrateStructureFn(v, ctx, db) : v;
            }
            return obj;
        } 
        
        // Route 2: B-Tree Maps (Sorted celestial hierarchies)
        if (isMapType) {
            const me = new MapEngine(db.allocator, val);
            for (const item of me.range()) {
                const k = keyEncoding.decode(item.key);
                let v = SmartPointer.resolve(item.ptr, db.allocator, ctx);
                if (v && v.isStructure) v = hydrateStructureFn(v, ctx, db);
                
                if (obj instanceof Map) obj.set(k, v); else obj[k] = v;
            }
            return obj;
        }

        // Route 3: Dictionaries (Unordered standard vessels)
        const dict = new Dictionary(db.allocator, val);
        dict._init();
        let limit = 0;
        
        // Draw each name from the sequence of creation
        for (const k of dict.keys()) {
            if (limit++ > 50000) break; // Protecting the RAM
            const ptr = dict.getPtr(k);
            if (ptr) {
                let v = SmartPointer.resolve(ptr, db.allocator, ctx);
                if (v && v.isStructure) v = hydrateStructureFn(v, ctx, db);
                obj[k] = v;
            }
        }
        
        return obj;
    }
};
