
// B"H
/**
 * @file flat.js
 * @description
 *  Delegates to the highly shattered mutation sub-angels.
 */
const FlatSetter = require('./flat_core/setter.js');
const FlatSplicer = require('./flat_core/splicer.js');
const FlatDeleter = require('./flat_core/deleter.js');

class FlatWriter {
    constructor(common) { 
        this.setter = new FlatSetter(common);
        this.splicer = new FlatSplicer(common);
        this.deleter = new FlatDeleter(common, this.splicer);
    }
    set(key, value, options) { this.setter.set(key, value, options); }
    push(value, options) { return this.splicer.push(value, options); }
    splice(start, delCount, ...items) { return this.splicer.splice(start, delCount, ...items); }
    delete(key) { this.deleter.delete(key); }
}
module.exports = FlatWriter;
