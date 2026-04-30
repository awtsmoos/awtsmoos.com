
// B"H
/**
 * @file setter.js
 * @description Instantiates flat objects securely.
 */
const FlatObject = require('../../../../structure/flat/object/index.js');
const PointerUpdater = require('./pointerUpdater.js');

module.exports = class FlatSetter {
    constructor(common) { this.common = common; }
    set(key, value, options) {
        const valPtr = options?.isPtr ? value : this.common.db.allocator.save(value);
        const engine = new FlatObject(this.common.db.allocator, this.common.handle.ptr);
        const res = engine.set(key, valPtr);
        PointerUpdater.update(res, this.common.handle);
    }
};
