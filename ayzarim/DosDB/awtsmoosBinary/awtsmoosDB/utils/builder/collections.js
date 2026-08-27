
// B"H
/**
 * @file collections.js
 * @description Transmutes native JS collections into exact-byte B-Trees.
 */
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const constants = require('../../constants.js');
const SmartPointer = require('../smartPointer/index.js');

module.exports = {
    handleNativeCollections(val, builder, visited) {
        const allocator = builder.allocator;
        const engine = (val instanceof Map) ? new MapEngine(allocator) : new Sequence(allocator);
        engine.create();
        
        const targetType = (val instanceof Map) ? constants.VAL_TYPE.MAP : constants.VAL_TYPE.SET;
        engine.ptr.type = targetType;
        
        const state = { building: true, vessel: engine };
        visited.set(val, state);

        if (val instanceof Map) {
            for (let [k, v] of val.entries()) {
                engine.set((typeof k === 'bigint') ? k.toString() : k, builder.build(v, visited), { isPtr: true });
            }
        } else {
            for (let item of val.values()) {
                engine.push(builder.build(item, visited), { isPtr: true });
            }
        }
        
        state.building = false;
        return SmartPointer.toBuffer(engine.ptr);
    }
};
