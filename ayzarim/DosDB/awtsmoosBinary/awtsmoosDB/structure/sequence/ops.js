
// B"H
const AppendOps = require('./ops_append.js');
const SpliceOps = require('./ops_splice.js');

class SequenceOps {
    constructor(sequence) {
        this.seq = sequence;
        this.nodeIO = sequence.nodeIO;
        this.appendOps = new AppendOps(sequence);
        this.spliceOps = new SpliceOps(sequence);
    }

    invalidate() {
        // No-op for now
    }

    async append(itemPtr) {
        return this.appendOps.append(itemPtr);
    }

    async splice(start, deleteCount, newItems, options = {}) {
        return this.spliceOps.splice(start, deleteCount, newItems, options);
    }

    async replace(index, newItem, options = {}) {
        await this.splice(index, 1, [newItem], options);
    }
}
module.exports = SequenceOps;
