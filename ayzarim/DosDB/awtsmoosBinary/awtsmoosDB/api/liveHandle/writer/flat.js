
// B"H
/**
 * @file flat.js
 * @class FlatWriter
 * @description
 *  Directs mutations to the highly-optimized FlatObject and FlatArray engines.
 */

const FlatObject = require('../../../structure/flat/object.js');
const FlatArray = require('../../../structure/flat/array.js');
const constants = require('../../../constants.js');

class FlatWriter {
    constructor(common) { 
        this.common = common; 
        this.db = common.db; 
        this.handle = common.handle; 
    }
    
    _checkPointerUpdate(res) {
        if (res && res.ptr) {
            const SmartPointer = require('../../../utils/smartPointer.js');
            const buf = Buffer.isBuffer(res.ptr) ? res.ptr : SmartPointer.toBuffer(res.ptr);
            
            if (!this.handle.ptr || Buffer.compare(this.handle.ptr, buf) !== 0) {
                const decoded = SmartPointer.decode(buf);
                if (decoded) {
                    this.handle.type = decoded.type;
                }
                this.handle._updatePointer(buf);
            }
        }
    }
    
    set(key, value, options) {
        const valPtr = options?.isPtr ? value : this.db.allocator.save(value);
        const engine = new FlatObject(this.db.allocator, this.handle.ptr);
        const res = engine.set(key, valPtr);
        this._checkPointerUpdate(res);
    }
    
    push(value, options) {
        const valPtr = options?.isPtr ? value : this.db.allocator.save(value);
        const engine = new FlatArray(this.db.allocator, this.handle.ptr);
        const res = engine.push(valPtr);
        this._checkPointerUpdate(res);
        return engine.length();
    }
    
    splice(start, delCount, ...items) {
        const engine = new FlatArray(this.db.allocator, this.handle.ptr);
        
        let options = {};
        let rawItems = items;
        if (items.length > 0 && typeof items[items.length - 1] === 'object' && items[items.length - 1]._isAwtsmoosOptions) {
            options = items.pop();
            rawItems = items;
        }

        const itemPtrs = rawItems.map(i => options.isPtr ? i : this.db.allocator.save(i));
        
        let removed = [];
        if (delCount > 0) {
            const count = engine.length();
            let s = start; 
            if(s < 0) s = Math.max(0, count + s); 
            if(s > count) s = count;
            
            const d = Math.max(0, Math.min(delCount, count - s));
            const SmartPointer = require('../../../utils/smartPointer.js');
            
            for(let i = 0; i < d; i++) {
                const p = engine.get(s + i);
                if (p) removed.push(SmartPointer.resolve(p, this.db.allocator));
            }
        }
        
        const res = engine.splice(start, delCount, itemPtrs);
        this._checkPointerUpdate(res);
        
        return removed;
    }
    
    delete(key) {
        if (this.handle.type === constants.VAL_TYPE.SMART_OBJECT) {
            const engine = new FlatObject(this.db.allocator, this.handle.ptr);
            const res = engine.delete(key);
            this._checkPointerUpdate(res);
        } else {
            this.splice(parseInt(key), 1);
        }
    }
}

module.exports = FlatWriter;
