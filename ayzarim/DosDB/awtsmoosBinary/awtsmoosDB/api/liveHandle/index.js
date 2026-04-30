
// B"H
/**
 * @file index.js (LiveHandle)
 * @chapter The Kingdom of Revealed Speech (Malchus)
 * @description
 * Malchus is the final vessel. It has no light of its own, but it allows 
 * the higher Sefirot to interact with the world.
 * 
 * This LiveHandle is a Proxy portal. It captures your thoughts (JS property
 * access) and routes them through the Traps (Hod), which use the 
 * Navigator (Chochmah) and the Reader (Binah) to reveal the binary truth.
 */

const TrapOrchestrator = require('./traps/index.js');
const HandleRegistry = require('../../core/registry/handle.js');
const StateInitializer = require('./core/stateInitializer.js');

class LiveHandle {
    /**
     * @constructor
     * @param {Object} db - The cosmic database instance.
     * @param {Buffer} ptr - The VarInt seal.
     * @param {number} type - The archetype ID.
     * @param {Object} context - Lineage data.
     */
    constructor(db, ptr, type, context = null) {
        // B"H: The Empty Vessel
        const target = function() {}; 

        // Manifest the soul-state
        const state = StateInitializer.initialize(this, target, db, ptr, type, context);

        // B"H: THE REFRESHED RESOLVER.
        // We override the legacy ensureResolved with our new modular engine.
        state.ensureResolved = (force) => {
            const Resolver = require('./resolver/index.js');
            return Resolver.ensureResolved(state, force);
        };

        // Wrapping the servant in the traps of Hod
        const proxy = new Proxy(target, TrapOrchestrator.createTraps(state, target));

        // Identity verification
        state.self = proxy;
        HandleRegistry.register(proxy, state);
        
        return proxy;
    }

    /**
     * @method resolvePointer
     * @description Statically unseals a coordinate into hydrated light.
     */
    static resolvePointer(ptrBuf, db) {
        const MethodSanctuary = require('./core/methodSanctuary.js');
        return MethodSanctuary.resolvePointer(ptrBuf, db, LiveHandle);
    }
}

module.exports = LiveHandle;
