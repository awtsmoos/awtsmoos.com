
// B"H
/**
 * @file deleter.js
 * @description Removes elements directly from the pure exact-byte structures.
 */
const constants = require('../../../../constants.js');
const FlatObject = require('../../../../structure/flat/object/index.js');
const PointerUpdater = require('./pointerUpdater.js');

module.exports = class FlatDeleter {
    constructor(common, splicer) { 
        this.common = common; 
        this.splicer = splicer;
    }
    delete(key) {
        if (this.common.handle.type === constants.VAL_TYPE.SMART_OBJECT) {
            const engine = new FlatObject(this.common.db.allocator, this.common.handle.ptr);
            const res = engine.delete(key);
            PointerUpdater.update(res, this.common.handle);
        } else {
            this.splicer.splice(parseInt(key), 1);
        }
    }
};
