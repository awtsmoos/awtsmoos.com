
// B"H
module.exports = {
    handle(state, tgt, prop) {
        if (Object.prototype.hasOwnProperty.call(state, prop)) {
            return { configurable: true, enumerable: true, value: state[prop] };
        }
        try {
            const res = state.nav.resolveKey(prop);
            if (res) return { configurable: true, enumerable: true, writable: true, value: undefined };
        } catch(e) {}
        return Reflect.getOwnPropertyDescriptor(tgt, prop);
    }
};
