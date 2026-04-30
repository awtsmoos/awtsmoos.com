
// B"H
/**
 * @file index.js (Sequence Key Logic)
 */
class SequenceSeeker {
    static seek(db, coords, key) {
        const idx = parseInt(key);
        if (isNaN(idx)) return null;
        const Sequence = require('../../../../../structure/sequence/index.js');
        const engine = new Sequence(db.allocator, coords);
        return engine.getPtr(idx);
    }
}

module.exports = SequenceSeeker;
