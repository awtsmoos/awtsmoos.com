
// B"H
/**
 * @file traps/deleteProperty.js
 */
module.exports = {
    handle(state, tgt, prop) {
        if (state.db && typeof state.db._rememberVersion === 'function' && state.self === state.db.root) {
            state.db._rememberVersion(String(prop), state.self[prop], true);
        }
        if (state.db && state.db.turbo && state.db.turbo.captureDelete(state, prop)) {
            return true;
        }
        state.writer.delete(prop);
        return true;
    }
};
