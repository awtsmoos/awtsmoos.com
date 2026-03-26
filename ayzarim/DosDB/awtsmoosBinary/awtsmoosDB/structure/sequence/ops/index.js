
// B"H
const SpliceOps = require('./splice.js');

/**
 * @class SequenceOps
 * @description
 *  The Sefirah of Hod - The Splendor of the Sequence.
 */
class SequenceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.spliceOps = new SpliceOps(sequence);
    }

    invalidate() {}

    splice(start, deleteCount, newItems, options = {}) {
        return this.spliceOps.splice(start, deleteCount, newItems, options);
    }

    replace(index, newItem, options = {}) {
        this.splice(index, 1, [newItem], options);
    }
}
module.exports = SequenceOps;
