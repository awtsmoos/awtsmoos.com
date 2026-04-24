
// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Malchut (Kingdom) - The Interface of the Awtsmoos Database.
 *  Manifests the Proxy that bridges code intentions to binary existence.
 *  By intercepting JavaScript's fundamental object behaviors, this gateway allows
 *  direct manipulation of physical disk space as if it were RAM, realizing the
 *  Creator's unity between spirit and matter.
 */

const Navigator = require('./navigator.js');
const Writer = require('./writer/index.js');
const Reader = require('./reader/index.js');
const Resolver = require('./resolver.js');
const PointerLogic = require('./pointer.js');
const Traps = require('./traps.js');
const HandleRegistry = require('../../core/registry/handle.js');

/**
 * @class LiveHandle
 * @description 
 *  The living portal to a physical data vessel. It acts synchronously to ensure
 *  the reality of the code is always aligned with the truth on the disk.
 */
class LiveHandle {
    /**
     * @description Constructs the Divine Interface.
     * @param {AwtsmoosDB} db The database world to which this handle belongs.
     * @param {Buffer|null} ptr The physical address buffer.
     * @param {number|null} type The manifestation type of the vessel.
     * @param {object|null} context Information about the parentage and key of this vessel.
     */
    constructor(db, ptr, type, context = null) {
        /**
         * @description 
         *  The target must be a function to allow the handle to be used as both an object
         *  (e.g., db.root.a) and potentially a callable function.
         */
        const target = function() {}; 
        
        /**
         * @description 
         *  The soul of the handle, containing its internal state and connection to the Essence.
         */
        const state = {
            db, ptr, type, context,
            lastMutationCount: -1,
            lastParentPtrHash: null,
            isLiveHandle: true,
            isUpdatingPointer: false,
            reader: null,
            writer: null,
            nav: null
        };

        // Manifest the functional organs of the soul
        state.nav = new Navigator(state);
        state.writer = new Writer(state);
        state.reader = new Reader(state);

        // Core synchronization capabilities
        state.ensureResolved = (force) => Resolver.ensureResolved(state, force);
        state.getPath = () => Resolver.getPath(state);
        state._updatePointer = (newPtr) => PointerLogic.updatePointer(state, newPtr);

        /**
         * B"H: The Great Transformation.
         * The dummy target function is wrapped in the traps of Malchut, 
         * becoming a living portal.
         */
        const proxy = new Proxy(target, Traps.createTraps(state, target));

        // Self-identification and registration
        state.self = proxy;
        HandleRegistry.register(proxy, state);
        
        return proxy;
    }

    /**
     * @description Authoritatively resolves a static pointer into its hydrated JS equivalent.
     * @param {Buffer} ptrBuf The dynamic binary address.
     * @param {AwtsmoosDB} db The database context.
     * @returns {*} The manifested data.
     */
    static resolvePointer(ptrBuf, db) {
        if (!ptrBuf || ptrBuf.length < 2) return null;
        const SmartPointer = require('../../utils/smartPointer.js');
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return null;
        
        const h = new LiveHandle(db, ptrBuf, decoded.type, null);
        const internal = HandleRegistry.getSoul(h);
        return internal.reader.resolveSelf();
    }
}

module.exports = LiveHandle;
