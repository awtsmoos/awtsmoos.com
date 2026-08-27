
// B"H
/**
 * @file reader/index.js
 * @chapter Chapter 50: The Understanding of Binah — Mother of All Forms
 *
 * @description
 * In the beginning of every differentiation, there is Binah.
 * She is the womb of understanding, the cosmic mother who takes
 * the undivided Ein (nothing) and births the Yesh (something).
 *
 * This Reader is Binah incarnate in code. 
 */

const LengthLogic   = require('./logic/length.js');
const KeysLogic     = require('./logic/keys.js');
const ResolverLogic = require('./resolver.js');
const IteratorLogic = require('./iterator.js');

/**
 * @class Reader
 * @description
 * The Binah-Engine. The organ of differentiation for a LiveHandle.
 */
class Reader {
    /**
     * @constructor
     * @param {Object} handle - The soul-state of the LiveHandle.
     */
    constructor(handle) {
        this.handle = handle;
        this.db     = handle.db;

        this.resolver = new ResolverLogic(this);
        this.iter     = new IteratorLogic(this);
    }

    /**
     * @method length
     * @description Synchronously counts children of the vessel.
     */
    length() {
        return LengthLogic.calculate(this.handle, this.db);
    }

    /**
     * @method resolveSelf
     * @description Materializes the full vessel into a plain JS entity.
     */
    resolveSelf() {
        return this.resolver.resolveSelf();
    }

    /**
     * @method keys
     * @description Yields Names of children one by one.
     */
    *keys() {
        yield* KeysLogic.generate(this.handle, this.db);
    }

    /**
     * @method entries
     * @description Yields [Name, Essence] pairs.
     */
    *entries() {
        yield* this.iter.entries();
    }

    /**
     * @method values
     * @description Yields only Essences.
     */
    *values() {
        for (const [k, v] of this.entries()) yield v;
    }

    /**
     * @method iterator
     * @description The gateway to for...of flow.
     */
    *iterator() {
        yield* this.entries();
    }

    /**
     * @method slice
     * @description Captures a window into the sequence.
     */
    slice(start, end) {
        const Slicer = require('./logic/slicer.js');
        return Slicer.slice(this.handle, this.db, start, end, this);
    }

    /**
     * @method _wrapIfNeeded
     * @description 
     * THE GATEGKEEPER (Mishmar).
     * 
     * Ensures container vessels are wrapped as LiveHandle proxies for 
     * deeper traversal while scalars pass through instantly.
     */
    _wrapIfNeeded(val, key, ptr) {
        if (val === null || val === undefined) return val;

        const SmartPointer  = require('../../../utils/smartPointer/index.js');
        const constants     = require('../../../constants.js');

        // RECTIFICATION: Anchor-aware check
        const isStructure = (val && val.isStructure === true);

        let type = isStructure ? val.type : (ptr ? SmartPointer.getType(ptr) : 0);
        const T = constants.VAL_TYPE;

        const ContainerTypes = new Set([
            T.MAP, T.SEQUENCE, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY,
            T.JSON, T.SMART_OBJECT, T.SMART_ARRAY, T.ANCHOR, T.JS_MAP, T.JS_SET
        ]);

        if (ContainerTypes.has(type)) {
            const HandleRegistry = require('../../../core/registry/handle.js');
            
            // If it's a structure returned from SmartPointer.resolve, 
            // the 'ptr' might be the coordinate object or the raw buffer.
            const finalPtr = (ptr && Buffer.isBuffer(ptr)) 
                             ? ptr 
                             : SmartPointer.toBuffer(val.ptr || val);

            return HandleRegistry.createHandle(
                this.db, finalPtr, type,
                { parent: this.handle.self, key }
            );
        }
        return val;
    }
}

module.exports = Reader;
