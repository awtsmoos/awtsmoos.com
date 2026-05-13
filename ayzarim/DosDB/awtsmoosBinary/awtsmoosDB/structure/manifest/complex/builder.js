
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

        if (this._isCustomInstance(val)) {
            const T = constants.VAL_TYPE;
            const anchor = new Anchor(this.db);
            const anchorSeal = anchor.create(T.DICTIONARY, null);
            visited.set(val, anchorSeal);

            const dataSeal = this.logic.executeRitual(
                T.DICTIONARY,
                this._composeCustomInstanceRecord(val),
                visited
            );
            anchor.update(anchorSeal, T.DICTIONARY, dataSeal);
            return anchorSeal;
        }

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

    _isCustomInstance(val) {
        if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
        if (val._isAwtsmoosMap || val._isAwtsmoosList || val._isAwtsmoosObject) return false;
        if (val instanceof Date || val instanceof RegExp || val instanceof Error) return false;
        if (val instanceof Map || val instanceof Set || val instanceof WeakMap || val instanceof WeakSet) return false;
        if (Buffer.isBuffer(val) || ArrayBuffer.isView(val) || val instanceof ArrayBuffer) return false;
        return !!(val.constructor && val.constructor !== Object);
    }

    _composeCustomInstanceRecord(val) {
        const record = {
            __className__: val.constructor && val.constructor.name ? val.constructor.name : 'AnonymousClass',
            __source__: val.constructor ? String(val.constructor) : ''
        };
        for (const key of Object.keys(val)) {
            record[key] = val[key];
        }
        return record;
    }
}

module.exports = StructBuilder;
