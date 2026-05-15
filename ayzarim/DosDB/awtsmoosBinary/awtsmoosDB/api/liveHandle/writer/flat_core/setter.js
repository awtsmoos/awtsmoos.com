
// B"H
/**
 * @file setter.js
 * @description Instantiates flat objects securely.
 */
const FlatObject = require('../../../../structure/flat/object/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');
const PointerUpdater = require('./pointerUpdater.js');
const constants = require('../../../../constants.js');

module.exports = class FlatSetter {
    constructor(common) { this.common = common; }
    set(key, value, options) {
        const valPtr = options?.isPtr ? value : this.common.db.allocator.save(value);
        const type = this.common.handle.type === constants.VAL_TYPE.ANCHOR
            ? this.common.resolveAnchorInnerType()
            : this.common.handle.type;
        if (type === constants.VAL_TYPE.SMART_ARRAY) {
            const index = Number(key);
            if (!Number.isSafeInteger(index) || index < 0) throw new Error(`B"H: invalid array index ${key}`);
            const structPtr = this.common.resolveStructPtr();
            const arr = new FlatArray(this.common.db.allocator, structPtr);
            const len = arr.length();
            if (index < len) {
                const res = arr.splice(index, 1, [valPtr]);
                PointerUpdater.update(res, this.common.handle);
                return;
            }
            if (index === len) {
                const res = arr.push(valPtr);
                PointerUpdater.update(res, this.common.handle);
                return;
            }
            if (index > len && this.common.db.sparseArrays) {
                this.common.db.sparseArrays.setPtr(this.common.handle, index, valPtr);
                return;
            }
        }
        const engine = new FlatObject(this.common.db.allocator, this.common.handle.ptr);
        const res = engine.set(key, valPtr);
        PointerUpdater.update(res, this.common.handle);
    }
};
