
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
        const type = this.common.handle.type === constants.VAL_TYPE.ANCHOR
            ? this.common.resolveAnchorInnerType()
            : this.common.handle.type;
        if (type === constants.VAL_TYPE.SMART_OBJECT) {
            const structPtr = this.common.resolveStructPtr();
            const engine = new FlatObject(this.common.db.allocator, structPtr);
            const res = engine.delete(key);
            PointerUpdater.update(res, this.common.handle);
        } else {
            const index = Number(key);
            if (this.common.db.sparseArrays && this.common.db.sparseArrays.has(this.common.handle, index)) {
                this.common.db.sparseArrays.delete(this.common.handle, index);
                return;
            }
            this.splicer.splice(index, 1);
        }
    }
};
