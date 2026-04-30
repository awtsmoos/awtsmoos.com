
// B"H
/**
 * @file traps/has.js
 */
module.exports = {
    handle(state, tgt, prop) {
        if (prop in state) return true;
        try { 
            state.ensureResolved();
            if (state.nav.resolveKey(prop)) return true; 
        } catch(e) {}
        return Reflect.has(tgt, prop);
    }
};
