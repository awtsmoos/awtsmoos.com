
// B"H
/**
 * @file traps/set.js
 * @description Synchronous property assignment trap.
 */
const constants = require('../../../constants.js');

module.exports = {
    handle(state, tgt, prop, value) {
        if (prop === constants.SYMBOLS.INTERNALS) return true;
        if (Object.prototype.hasOwnProperty.call(state, prop)) {
            state[prop] = value;
            return true;
        }
        state.writer.set(prop, value);
        return true;
    }
};
