
// B"H
/**
 * @file api/liveHandle/core/stateInitializer.js
 * @chapter The Breath of Life (Nishmas Chaim)
 * @description
 * Before a vessel can speak, it must have a soul. This module
 * creates the 'state' object that serves as the soul of the LiveHandle.
 * 
 * It attaches the organs:
 * 1. The Navigator (Chochmah) - For seeing paths.
 * 2. The Writer (Netzach) - For persistent action.
 * 3. The Reader (Binah) - For understanding forms.
 */

const Navigator = require('../navigator/index.js');
const Writer = require('../writer/index.js');
const Reader = require('../reader/index.js');
const Resolver = require('../resolver/index.js');
const PointerLogic = require('../pointer.js');

module.exports = {
    /**
     * @method initialize
     * @description Fills the empty vessel with state and organs.
     */
    initialize(instance, target, db, ptr, type, context) {
        const state = {
            db, 
            ptr, 
            type, 
            context,
            lastMutationCount: -1,
            lastParentPtrHash: null,
            isLiveHandle: true,
            isUpdatingPointer: false,
            reader: null,
            writer: null,
            nav: null,
            self: null
        };

        // B"H: The modular organs are attached
        state.nav = new Navigator(state);
        state.writer = new Writer(state);
        state.reader = new Reader(state);

        // Core synchronization capabilities
        state.ensureResolved = (force) => Resolver.ensureResolved(state, force);
        state.getPath = () => Resolver.getPath(state);
        state._updatePointer = (newPtr) => PointerLogic.updatePointer(state, newPtr);

        return state;
    }
};
