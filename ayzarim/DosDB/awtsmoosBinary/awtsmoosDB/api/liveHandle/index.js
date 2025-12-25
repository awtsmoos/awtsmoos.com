//B"H

/**
 * @file index.js
 * @description
 *  The Sefirah of Malchut - The Divine Interface.
 *  This file manifests the LiveHandle, a Proxy-based vessel that allows the physical 
 *  database blocks to be navigated as if they were ethereal JavaScript objects.
 * 
 *  The logic has been modularized into distinct sparks to prevent 
 *  module-loading recursion and stack overflows.
 */

const Navigator = require('./navigator.js');
const Writer = require('./writer.js');
const Reader = require('./reader.js');
const Resolver = require('./resolver.js');
const PointerLogic = require('./pointer.js');
const Traps = require('./traps.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class LiveHandle {
    /**
     * @description
     *  Constructs the Divine Interface. Returns a Proxy that intercepts 
     *  standard JS operations and translates them into database commands.
     * 
     *  @param {AwtsmoosDB} db - The database instance (The Source).
     *  @param {Buffer} ptr - The 16-byte SmartPointer buffer.
     *  @param {number} type - The Type ID of the data.
     *  @param {object} context - Parent handle and key context for hierarchical tracking.
     */
    constructor(db, ptr, type, context = null) {
        const target = function() {}; 
        
        const state = {
            db, ptr, type, context,
            lastMutationCount: -1,
            lastParentPtrHash: null,
            isLiveHandle: true,
            isUpdatingPointer: false
        };

        // Instantiate core logic sub-vessels
        state.nav = new Navigator(state);
        state.writer = new Writer(state);
        state.reader = new Reader(state);

        // Attach modularized logic methods
        state.ensureResolved = (force) => Resolver.ensureResolved(state, force);
        state.getPath = () => Resolver.getPath(state);
        state._updatePointer = (newPtr) => PointerLogic.updatePointer(state, newPtr);

        // Manifest the Proxy Traps
        const proxy = new Proxy(target, Traps.createTraps(state, target));

        state.self = proxy;
        HandleRegistry.register(proxy, state);
        return proxy;
    }

    /**
     * @description 
     *  Authoritatively resolves a static 16-byte pointer into its 
     *  underlying JavaScript value or a LiveHandle.
     * 
     *  @param {Buffer} ptrBuf - The 16-byte SmartPointer buffer.
     *  @param {AwtsmoosDB} db - The database instance.
     */
    static async resolvePointer(ptrBuf, db) {
        if (!ptrBuf || ptrBuf.length !== 16) return null;
        const SmartPointer = require('../../utils/smartPointer.js');
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return null;
        
        const h = new LiveHandle(db, ptrBuf, decoded.type, null);
        const internal = require('../../core/handleRegistry.js').getSoul(h);
        return await internal.reader.resolveSelf();
    }
}

module.exports = LiveHandle;