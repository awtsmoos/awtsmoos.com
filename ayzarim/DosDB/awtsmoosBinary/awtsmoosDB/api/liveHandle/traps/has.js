
// B"H
/**
 * @file traps/has.js
 */
module.exports = {
    handle(state, tgt, prop) {
        if (prop in state) return true;
        try { 
            state.ensureResolved();
            const overlaid = state.db && state.db.turbo
                ? state.db.turbo.has(state, prop)
                : { hit: false };
            if (overlaid.hit) return overlaid.value;
            if (state.nav.resolveKey(prop)) return true; 
        } catch(e) {}
        return Reflect.has(tgt, prop);
    }
};
