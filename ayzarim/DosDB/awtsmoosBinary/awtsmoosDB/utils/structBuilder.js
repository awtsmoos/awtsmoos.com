// B"H
/**
 * @file structBuilder.js
 * @description Recursively manifests complex JS objects into persistent vessels synchronously.
 */

const constants = require('../constants.js');
const Dictionary = require('../structure/dictionary/index.js');
const Sequence = require('../structure/sequence/index.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
    }

    /**
     * @description Synchronously builds the database structures for an object.
     * The Awtsmoos creates the tree from the top down.
     */
    build(val) {
        if (val === null || val === undefined || typeof val !== 'object' || Buffer.isBuffer(val)) {
            return this.allocator.save(val);
        }

        // Handle Maps/Sets as Sequences
        if (val instanceof Map || val instanceof Set) {
            const seq = new Sequence(this.allocator);
            seq.create();
            const items = val instanceof Map ? Array.from(val.entries()) : Array.from(val.values());
            for (const item of items) {
                seq.push(this.build(item));
            }
            return seq.ptr;
        }

        // Handle Arrays as Sequences
        if (Array.isArray(val)) {
            const seq = new Sequence(this.allocator);
            seq.create();
            for (const item of val) {
                seq.push(this.build(item));
            }
            return seq.ptr;
        }

        // Handle Objects as Dictionaries
        const dict = new Dictionary(this.allocator);
        dict.create();
        const keys = Object.keys(val);
        for (const key of keys) {
            dict.set(key, this.build(val[key]), { isPtr: true });
        }
        return dict.ptr;
    }
}

module.exports = StructBuilder;