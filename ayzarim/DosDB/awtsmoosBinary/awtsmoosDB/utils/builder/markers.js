
// B"H
/**
 * @file markers.js
 * @description Translates explicit Awtsmoos markers into structures.
 */
const Dictionary = require('../../structure/dictionary/index.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const SmartPointer = require('../smartPointer/index.js');

module.exports = {
    handleMarkers(val, allocator, visited) {
        if (val._isAwtsmoosMap) {
            const engine = new MapEngine(allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: { ptr: SmartPointer.decode(seal) } });
            return seal;
        }
        
        if (val._isAwtsmoosList || val._isAwtsmoosSequence) {
            const engine = new Sequence(allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: { ptr: SmartPointer.decode(seal) } });
            return seal;
        }
        
        if (val._isAwtsmoosObject) {
            const engine = new Dictionary(allocator);
            const seal = engine.create();
            visited.set(val, { building: false, vessel: { ptr: SmartPointer.decode(seal) } });
            return seal;
        }
        return null;
    }
};
