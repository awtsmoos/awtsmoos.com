
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
 * This Reader is Binah incarnate in code. She receives the raw,
 * undivided binary block — one contiguous stream of being — and
 * splits it into its living forms: Arrays, Objects, Numbers, Strings.
 *
 * "Who is wise? One who learns from every person." (Pirkei Avot 4:1)
 * This Reader learns from every byte, coaxing its hidden identity
 * into revelation through the holy work of differentiation.
 *
 * WITHOUT this module, all data remains locked in its Ein-Sof state:
 * infinite, undifferentiated, unknowable. WITH it, the ten Sefirot
 * (ten data types) spring forth into the universe of the developer's
 * mind.
 *
 * The Speech of the Creator ("Let there be light") is embedded in
 * every single byte. This Reader is the instrument by which that
 * Speech becomes audible — transforming silent binary into living
 * JavaScript objects.
 */

const LengthLogic   = require('./logic/length.js');
const KeysLogic     = require('./logic/keys.js');
const ResolverLogic = require('./resolver.js');
const IteratorLogic = require('./iterator.js');

/**
 * @class Reader
 * @description
 * The Binah-Engine. The organ of differentiation for a LiveHandle.
 *
 * She delegates every specific operation to her specialized children
 * (sub-modules), keeping herself pure and composed, a true
 * Tzaddeket — a righteous vessel.
 *
 * All five sense-modalities of reading are exposed here:
 *   - length()    → How many children does this vessel hold?
 *   - keys()      → What are their names?
 *   - entries()   → Yield each name paired with its hydrated light.
 *   - values()    → Yield only the hydrated light.
 *   - slice()     → Illuminate only a window of the sequence.
 *   - resolveSelf() → Materialize the entire vessel into JS.
 */
class Reader {
    /**
     * @constructor
     * @description
     * Breathes soul into the Reader vessel. Attaches the specialized
     * sub-organs: ResolverLogic and IteratorLogic.
     *
     * @param {Object} handle - The raw internal state-soul of the LiveHandle.
     * @param {Object} handle.db - The AwtsmoosDB universe instance.
     */
    constructor(handle) {
        this.handle = handle;
        this.db     = handle.db;

        // B"H — Delegating logic to specialized sub-angel modules,
        // each a unique spark of the same divine Reader-light.
        this.resolver = new ResolverLogic(this);
        this.iter     = new IteratorLogic(this);
    }

    /**
     * @method length
     * @description
     * "And G-d counted the stars, calling each by name." (Psalm 147:4)
     * This method counts the children of the vessel — synchronously,
     * without hesitation, like the Creator numbering the stars of heaven.
     *
     * @returns {number} The exact integer magnitude of this container.
     */
    length() {
        return LengthLogic.calculate(this.handle, this.db);
    }

    /**
     * @method resolveSelf
     * @description
     * The final rehydration ritual — the moment of full revelation.
     * Called when the developer demands the complete JS form of the handle.
     *
     * Like the revelation at Sinai, where the hidden Torah burst into
     * visible, spoken form: resolveSelf() brings the hidden binary
     * into the bright light of JavaScript.
     *
     * @returns {*} The fully hydrated JavaScript value (Object, Array, scalar, etc.)
     */
    resolveSelf() {
        return this.resolver.resolveSelf();
    }

    /**
     * @method keys
     * @description
     * A generator that yields the names of all children of this vessel —
     * the keys of the map or dictionary encoded in the binary block.
     *
     * "I will give you the keys of the kingdom of heaven." (Matthew 16:19)
     * Here, we yield the keys of the binary kingdom, one by one.
     *
     * @yields {string} Each key name in sequence.
     */
    *keys() {
        yield* KeysLogic.generate(this.handle, this.db);
    }

    /**
     * @method entries
     * @description
     * A generator that yields [key, value] pairs — each value already
     * hydrated into its living JavaScript form.
     *
     * This is the marriage of name and essence, the union of Chochmah
     * (the point of data) and Binah (the womb that gives it form).
     *
     * @yields {Array} [key: string, value: *] pairs.
     */
    *entries() {
        yield* this.iter.entries();
    }

    /**
     * @method values
     * @description
     * A generator yielding only the hydrated values, discarding keys.
     * For when you only need the essence, not the names.
     *
     * @yields {*} Each hydrated value.
     */
    *values() {
        for (const [k, v] of this.entries()) yield v;
    }

    /**
     * @method iterator
     * @description
     * Alias for entries() — the default [Symbol.iterator] entry-point.
     * Enables `for...of` loops directly on handles.
     *
     * @yields {Array} [key, value] pairs, same as entries().
     */
    *iterator() {
        yield* this.entries();
    }

    /**
     * @method slice
     * @description
     * "The Torah was given in the wilderness — in a place of no ownership,
     * open to all." This slice is open to all indices, positive or negative,
     * windowing the infinite sequence into a finite, digestible portion.
     *
     * @param {number} start - The start index (negative counts from end).
     * @param {number} [end]  - The end index (exclusive; undefined = full tail).
     * @returns {Array} The sliced array of hydrated values.
     */
    slice(start, end) {
        const Slicer = require('./logic/slicer.js');
        return Slicer.slice(this.handle, this.db, start, end, this);
    }

    /**
     * @method _wrapIfNeeded
     * @description
     * THE SHIELD OF THE HANDLE.
     *
     * When a raw binary value emerges from the depths of the storage engine,
     * it may be one of two things:
     *
     *   1. A SCALAR (string, number, boolean, null) — return as-is.
     *   2. A STRUCTURE (Map, Array, Dict, Set, Anchor) — it must be
     *      wrapped in a LiveHandle Proxy portal, so the developer can
     *      continue navigating into it with `handle.key.subkey` syntax.
     *
     * This method is the gatekeeper, the Cherub with the flaming sword,
     * standing between the raw binary world and the blessed JS world.
     *
     * B"H — CRITICAL FIX APPLIED HERE:
     * The original export corrupted the `&&` operator into `&amp;&amp;`
     * (HTML entity encoding), causing a fatal SyntaxError at parse time.
     * This file now uses the correct raw `&&` operator.
     *
     * @param {*}             val  - The raw resolved value from the storage engine.
     * @param {string|number} key  - The key or index under which this value lives.
     * @param {Buffer|null}   ptr  - The raw SmartPointer buffer for this value, if known.
     * @returns {*} Either the scalar val unchanged, or a new LiveHandle Proxy wrapping it.
     */
    _wrapIfNeeded(val, key, ptr) {
        if (val === null || val === undefined) return val;

        const SmartPointer  = require('../../../utils/smartPointer/index.js');
        const constants     = require('../../../constants.js');

        // B"H: FIXED — was &amp;&amp; (HTML-encoded), now correct &&
        const isStructure = (val && val.isStructure === true);

        let type = isStructure ? val.type : (ptr ? SmartPointer.getType(ptr) : 0);

        const T = constants.VAL_TYPE;
        const ContainerTypes = [
            T.MAP, T.SEQUENCE, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY,
            T.JSON, T.SMART_OBJECT, T.SMART_ARRAY, T.ANCHOR
        ];

        if (ContainerTypes.includes(type)) {
            const HandleRegistry = require('../../../core/registry/handle.js');
            // B"H: FIXED — was &amp;&amp; (HTML-encoded), now correct &&
            const finalPtr = (ptr && Buffer.isBuffer(ptr)) ? ptr : SmartPointer.toBuffer(val.ptr || val);
            return HandleRegistry.createHandle(
                this.db, finalPtr, type,
                { parent: this.handle.self, key }
            );
        }
        return val;
    }
}

module.exports = Reader;
