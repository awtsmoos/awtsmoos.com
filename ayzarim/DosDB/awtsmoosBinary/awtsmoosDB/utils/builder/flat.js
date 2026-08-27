
// B"H
/**
 * @file flat.js
 * @description Contracts simple objects and arrays into highly-dense Flat structures.
 */
const FlatObject = require('../../structure/flat/object/index.js');
const FlatArray = require('../../structure/flat/array/index.js');
const SmartPointer = require('../smartPointer/index.js');

module.exports = {
    handleFlatStructures(val, builder, visited) {
        if (Array.isArray(val)) {
            const flat = new FlatArray(builder.allocator);
            flat.create();
            
            const state = { building: true, vessel: flat };
            visited.set(val, state);
            
            for (let i = 0; i < val.length; i++) {
                const itemSeal = builder.build(val[i], visited);
                const res = flat.push(itemSeal);
                if (res && res.shattered) flat.ptr = res.ptr; 
            }
            
            state.building = false;
            return SmartPointer.toBuffer(flat.ptr);
        }

        const flatObj = new FlatObject(builder.allocator);
        flatObj.create();
        
        const state = { building: true, vessel: flatObj };
        visited.set(val, state);

        for (const key of Object.keys(val)) {
            const propSeal = builder.build(val[key], visited);
            const res = flatObj.set(key, propSeal);
            if (res && res.shattered) flatObj.ptr = res.ptr;
        }
        
        state.building = false;
        return SmartPointer.toBuffer(flatObj.ptr);
    }
};
