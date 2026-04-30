
// B"H
/**
 * @file index.js (Flat Key Logic)
 */
const constants = require('../../../../../constants.js');

class FlatSeeker {
    static seek(db, type, coords, key) {
        if (type === constants.VAL_TYPE.SMART_OBJECT) {
            const FlatObject = require('../../../../../structure/flat/object/index.js');
            const engine = new FlatObject(db.allocator, coords);
            return engine.get(key);
        }
        const FlatArray = require('../../../../../structure/flat/array/index.js');
        const engine = new FlatArray(db.allocator, coords);
        return engine.get(parseInt(key));
    }
}

module.exports = FlatSeeker;
