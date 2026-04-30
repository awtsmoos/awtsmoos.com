
// B"H
/**
 * @file builder.js
 * @chapter The Master Scribe of Existence
 */

const Anchor = require('../../anchor/stable.js');
const constants = require('../../../constants.js');
const BuilderLogic = require('./builder/logic/index.js');

class StructBuilder {
    constructor(allocator) {
        this.allocator = allocator;
        this.db = allocator.db;
        this.scribe = new (require('../primitive/scribe.js'))(allocator);
        this.logic = new BuilderLogic(this);
    }

    build(val, visited = new Map()) {
        if (this._isPrimitive(val)) {
            return this.scribe.save(val);
        }

        if (visited.has(val)) return visited.get(val);

        const targetType = this.logic.determineRitual(val);

        const anchor = new Anchor(this.db);
        const anchorSeal = anchor.create(targetType, null);
        visited.set(val, anchorSeal);

        const dataSeal = this.logic.executeRitual(targetType, val, visited);

        anchor.update(anchorSeal, targetType, dataSeal);

        return anchorSeal;
    }

    _isPrimitive(val) {
        if (val === null || val === undefined) return true;
        const t = typeof val;
        if (t !== 'object') return true;
        if (Buffer.isBuffer(val) || val instanceof Date) return true;
        return false;
    }
}

module.exports = StructBuilder;
