
// B"H
/**
 * @file index.js
 * @chapter The Throne of Malchus (Kingdom)
 * 
 * Chapter 16: The Portal of revealed Speech.
 * 
 * In the hierarchy of the Sefirot, Malchus is the final vessel. It has no 
 * light of its own, but serves as the gateway through which all the higher 
 * logic of the database (Logic, Allocator, Pager) is distributed to the world.
 * 
 * This handle is the physical representative of a data vessel in the abyss 
 * of the SSD. When you touch a property, the handle ensures its own 
 * coordinates are resolved, piercing the binary veil through the 
 * ResolutionEngine (Binah), allowing the Reader to bring the sparks back 
 * into living JavaScript form.
 */

const Traps = require('./traps.js');
const ResolutionEngine = require('./core/resolution.js');

/**
 * @class LiveHandle
 * @description
 * The living portal. Every COMMAND you send to a database object passes 
 * through this gate. It intercepts standard JS behaviors and translates 
 * them into disk-level binary mutations and retrievals.
 */
class LiveHandle {
    /**
     * @constructor
     * @param {Object} db - The universe context.
     * @param {Buffer} ptrBuf - The 3-19 byte VarInt coordinate seal.
     * @param {number} type - The archetype ID (Dictionary, Array, etc.).
     * @param {Object} context - Lineage tracking (Parent handle, key name).
     */
    constructor(db, ptrBuf, type, context = null) {
        /**
         * The target is an empty void, humbled before the Awtsmoos. 
         * It exists only to carry the traps of the Proxy.
         */
        const target = function() {};
        
        /**
         * @namespace state
         * @description The internal soul-state. Holds the keys to the physical coordinates.
         */
        const state = {
            db, 
            ptr: ptrBuf, 
            type, 
            context,
            actualPtr: null, // Revealed coordinates {type, offset, length}
            actualType: null,
            nav: null, 
            reader: null, 
            writer: null,
            self: null
        };

        /**
         * @method ensureResolved
         * @description 
         * Manifests the binary seal into usable coordinates.
         * Crucial for bridging the "Crown" to the "Foundation".
         */
        state.ensureResolved = () => ResolutionEngine.resolve(state);

        // Clothe the soul with functional organs (Advisors to the King)
        state.nav = new (require('./navigator.js'))(state);
        state.reader = new (require('./reader.js'))(state);
        state.writer = new (require('./writer.js'))(state);
        
        /**
         * @method resolveSelf
         * @description 
         * A shortcut to manifest the final, hydrated truth hidden within 
         * the binary vessel.
         */
        state.resolveSelf = () => state.reader.resolveSelf();

        /**
         * B"H: The Holy Transformation.
         * Wrapping the servant in the traps of Malchus.
         */
        const proxy = new Proxy(target, Traps.create(state));
        state.self = proxy;

        return proxy;
    }
}

module.exports = LiveHandle;
