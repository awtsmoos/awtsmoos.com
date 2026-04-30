
// B"H
/**
 * @file iterator.js
 */

const keyEncoding = require('../../utils/keyEncoding.js');

module.exports = {
    * keys(engine) {
        if (!engine.seq) return;
        // B"H: The Engine now handles seal-decoding in its own logic
        for (const k of engine.seq.keys()) {
            yield k;
        }
    },

    * entries(engine, context) {
        const SmartPointer = require('../../utils/smartPointer/index.js');
        for (const k of this.keys(engine)) {
            const ptr = engine.map.getPtr(k);
            if (ptr) {
                yield [k, SmartPointer.resolve(ptr, engine.allocator, context)];
            }
        }
    }
};
