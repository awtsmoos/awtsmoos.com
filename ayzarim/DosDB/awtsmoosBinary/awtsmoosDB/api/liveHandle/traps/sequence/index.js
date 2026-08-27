
// B"H
/**
 * @file index.js (Sequence Map)
 * @description
 * Chapter 40: The Stream of Sequence.
 * 
 * Just as life is a series of events following one after another, the Sequence 
 * vessel represents a continuous flow. This module defines the "Verbs" that 
 * can act upon the sequence: push, pop, slice, splice.
 *
 * "The word that comes out of My mouth shall not return to Me void, 
 * but it shall accomplish what I please." (Isaiah 55:11)
 */

const PushOp = require('./push/index.js');
const PopOp = require('./pop/index.js');
const ShiftOp = require('./shift/index.js');
const UnshiftOp = require('./unshift/index.js');
const SpliceOp = require('./splice/index.js');
const SliceOp = require('./slice/index.js');
const IterationOps = require('./iteration/index.js');

/**
 * @class SequenceMethods
 * @description Orchestrates the methods available to sequential handles.
 */
class SequenceMethods {
    /**
     * @method getMethods
     * @description Collects the actions available for a specific sequence soul.
     * 
     * @param {Object} state - The handle state.
     * @returns {Object} A map of string names to callable Bestowing Actions.
     */
    static getMethods(state) {
        return {
            'push': PushOp.execute(state),
            'pop': PopOp.execute(state),
            'shift': ShiftOp.execute(state),
            'unshift': UnshiftOp.execute(state),
            'splice': SpliceOp.execute(state),
            'slice': SliceOp.execute(state),
            'keys': () => state.reader.keys(),
            'keys': () => state.reader.keys(),
            'forEach': IterationOps.forEach(state),
            'map': IterationOps.map(state),
            'filter': IterationOps.filter(state)
        };
    }
}

module.exports = SequenceMethods;
