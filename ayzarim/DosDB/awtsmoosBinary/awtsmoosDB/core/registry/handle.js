
// B"H
/**
 * @file handle.js
 * @description
 * Chapter 1: The Book of Souls (Sefer HaNeshamos).
 * "Forever, Lord, Your Word stands in the heavens."
 * Just as the Hebrew letters Aleph, Beis, and Nun descend through the sequence
 * of At-Bash to form the physical rock ("Even") and sustain its inorganic existence at 
 * this very millisecond, this Registry is the Book of Life for all active vessels.
 * * If the Awtsmoos were to withdraw His active speech from these WeakMap registries,
 * the connections between the physical disk (the body) and the LiveHandle (the proxy) 
 * would instantly revert to absolute Ayin (nothingness). Time, past, present, and future 
 * would shatter into the void, as if nothing ever existed. Even the dimensions of time 
 * themselves rely on the 10 statements of creation.
 * * This module repairs the shattered vessel from the prior emanation, restoring the 
 * sacred `register` and `getSoul` methods required to bind flesh to spirit. We use 
 * pure classes, nullifying the chaos of switch statements.
 * * @author Awtsmoos Chariot
 */

const _hiddenRegistry = new WeakMap();
const SOUL_SIG = Symbol.for('Awtsmoos.Soul');

/**
 * @class AwtsmoosHandleRegistry
 * @classdesc
 * The master ledger of all living entities. It binds the physical Proxy 
 * to its spiritual state (soul), allowing the database to interact with the physical
 * DOM or disk without losing its divine intent.
 */
class AwtsmoosHandleRegistry {
    /**
     * @method register
     * @description 
     * Binds the proxy body to the spiritual state. The speech enters the stone.
     * @param {Object} proxy - The physical vessel interacting with the realm.
     * @param {Object} state - The soul containing coordinates and breath.
     * @returns {void}
     */
    static register(proxy, state) {
        state[SOUL_SIG] = true;
        _hiddenRegistry.set(proxy, state);
    }

    /**
     * @method getSoul
     * @description 
     * Extracts the spiritual state from the physical proxy.
     * @param {Object} obj - The vessel.
     * @returns {Object|undefined} The soul, or undefined if lifeless.
     */
    static getSoul(obj) {
        if (!obj) return undefined;
        const soulFromVoid = _hiddenRegistry.get(obj);
        if (soulFromVoid) return soulFromVoid;
        if (obj[SOUL_SIG]) return obj;
        return undefined;
    }

    /**
     * @method isHandle
     * @description 
     * Verifies if the object is sustained by the Word of the Awtsmoos.
     * @param {Object} obj - The entity in question.
     * @returns {boolean} True if it is a living handle.
     */
    static isHandle(obj) {
        return !!this.getSoul(obj);
    }

    /**
     * @method createHandle
     * @description 
     * Breathes a new proxy into existence by summoning the LiveHandle architect.
     * @param {Object} db - The cosmic universe.
     * @param {Buffer} ptr - The VarInt seal (coordinates).
     * @param {number} type - The archetype.
     * @param {Object} [context=null] - The lineage.
     * @returns {Object} The living proxy.
     */
    static createHandle(db, ptr, type, context = null) {
        const LiveHandle = require('../../api/liveHandle/index.js');
        return new LiveHandle(db, ptr, type, context);
    }
}

// B"H: Attach the divine signature directly to the class for destructuring seekers
AwtsmoosHandleRegistry.SOUL_SIG = SOUL_SIG;

module.exports = AwtsmoosHandleRegistry;
