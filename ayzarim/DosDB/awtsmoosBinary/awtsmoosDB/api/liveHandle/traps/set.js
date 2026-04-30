
// B"H
/**
 * @file traps/set.js
 * @description
 * Chapter 35: The Scribe of Reality.
 * Netzach is the Victory of Persistence. When you assign a value to a LiveHandle, 
 * you are acting as the scribe of your own microcosm. 
 * 
 * This module catches the 'Will' of the assignment and delegates it to the 
 * proper Writing Angel (B-Tree, Sequence, or Flat Object). Because the 
 * Awtsmoos DB is strictly synchronous, there is no waiting. The ink 
 * touches the virtual parchment of the mirrored RAM and then flows to the SSD.
 * 
 * "For He spoke, and it came to be."
 */

const constants = require('../../../constants.js');

module.exports = {
    /**
     * @method handle
     * @description
     * Captures the 'Set' operation and commands the writer.
     */
    handle(state, tgt, prop, value, receiver) {
        // Safeguard for internal symbols and states
        if (prop === constants.SYMBOLS.INTERNALS) return true;
        if (Object.prototype.hasOwnProperty.call(state, prop)) {
            state[prop] = value;
            return true;
        }

        // B"H: The Decree is signed. Commence physical manifestation.
        state.writer.set(prop, value);
        
        return true;
    }
};
