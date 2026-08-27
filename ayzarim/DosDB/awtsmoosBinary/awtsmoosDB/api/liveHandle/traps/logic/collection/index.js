
// B"H
/**
 * @file index.js (Collection Dispatcher)
 * @chapter The Procession of Tiferet
 * @description
 * Arrays are sequences. They follow a straight, infinite path.
 * We abolish all 'switch' and 'if' chains. Here is only the map.
 */

const LengthAction = require('./length/index.js');
const IteratorAction = require('./iterator/index.js');
const SequenceMethods = require('../../sequence/index.js');

class CollectionDispatcher {
    static dispatch(state, prop, receiver) {
        if (prop === 'length') return LengthAction.execute(state);
        if (prop === Symbol.iterator) return IteratorAction.execute(state);
        
        const methodMap = SequenceMethods.getMethods(state);
        
        if (Object.prototype.hasOwnProperty.call(methodMap, prop)) {
            return methodMap[prop];
        }
        
        return undefined;
    }
}

module.exports = CollectionDispatcher;
