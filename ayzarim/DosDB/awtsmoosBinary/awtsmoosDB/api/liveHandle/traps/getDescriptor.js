
// B"H
/**
 * @file traps/getDescriptor.js
 */
module.exports = {
    handle(state, tgt, prop) {
        if (Object.prototype.hasOwnProperty.call(state, prop)) {
            return { configurable: true, enumerable: true, value: state[prop] };
        }
        try {
            const overlaid = state.db && state.db.turbo
                ? state.db.turbo.has(state, prop)
                : { hit: false };
            if (overlaid.hit) {
                return overlaid.value
                    ? { configurable: true, enumerable: true, writable: true, value: undefined }
                    : undefined;
            }
            const res = state.nav.resolveKey(prop);
            if (res) return { configurable: true, enumerable: true, writable: true, value: undefined };
        } catch(e) {}
        return Reflect.getOwnPropertyDescriptor(tgt, prop);
    }
};
