// B"H
const SpliceOps = require('./ops_splice.js');

/**
 * @class SequenceOps
 * @description
 *  The Sefirah of Hod - The Splendor of the Sequence.
 *  Mediates the transformations of the list vessels synchronously.
 *  In the realm of the Awtsmoos, there is no delay; 
 *  Speech and Action are unified in every instant of creation.
 */
class SequenceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.spliceOps = new SpliceOps(sequence);
    }

    invalidate() {
        // No-op for now
    }

    /**
     * @description Spliced the binary void to insert or remove vessels.
     */
    splice(start, deleteCount, newItems, options = {}) {
        return this.spliceOps.splice(start, deleteCount, newItems, options);
    }

    /**
     * @description Replaces a specific vessel with a new manifestation.
     */
    replace(index, newItem, options = {}) {
        this.splice(index, 1, [newItem], options);
    }
}
module.exports = SequenceOps;