
// B"H
/**
 * @file traps/deleteProperty.js
 */
module.exports = {
    handle(state, tgt, prop) {
        state.writer.delete(prop);
        return true;
    }
};
