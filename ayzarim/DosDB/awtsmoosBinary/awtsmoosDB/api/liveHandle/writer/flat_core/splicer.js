
// B"H
/**
 * @file splicer.js
 * @description Modifies sequential boundaries gracefully.
 */
const FlatArray = require('../../../../structure/flat/array/index.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');
const PointerUpdater = require('./pointerUpdater.js');

module.exports = class FlatSplicer {
    constructor(common) { this.common = common; }
    push(value, options) {
        const valPtr = options?.isPtr ? value : this.common.db.allocator.save(value);
        const engine = new FlatArray(this.common.db.allocator, this.common.handle.ptr);
        const res = engine.push(valPtr);
        PointerUpdater.update(res, this.common.handle);
        return engine.length();
    }
    splice(start, delCount, ...items) {
        const engine = new FlatArray(this.common.db.allocator, this.common.handle.ptr);
        let options = {};
        let rawItems = items;
        if (items.length > 0 && typeof items[items.length - 1] === 'object' && items[items.length - 1]._isAwtsmoosOptions) {
            options = items.pop();
        }
        const itemPtrs = rawItems.map(i => options.isPtr ? i : this.common.db.allocator.save(i));
        
        let removed = [];
        if (delCount > 0) {
            const count = engine.length();
            let s = start; 
            if(s < 0) s = Math.max(0, count + s); 
            if(s > count) s = count;
            const d = Math.max(0, Math.min(delCount, count - s));
            for(let i = 0; i < d; i++) {
                const p = engine.get(s + i);
                if (p) removed.push(SmartPointer.resolve(p, this.common.db.allocator));
            }
        }
        const res = engine.splice(start, delCount, itemPtrs);
        PointerUpdater.update(res, this.common.handle);
        return removed;
    }
};
