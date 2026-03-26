
// B"H
module.exports = {
    handle(state, tgt, prop) {
        if (prop in state) return true;
        try { if (state.nav.resolveKey(prop)) return true; } catch(e) {}
        return Reflect.has(tgt, prop);
    }
};
