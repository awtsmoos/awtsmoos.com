
/**
 * @file traps.js
 * @chapter The Mirror of Reflection (Hod)
 */

const constants = require('../../constants.js');
const T = constants.VAL_TYPE;

const IS_MAP = new Set([T.MAP, T.DICTIONARY, T.OBJECT, T.ANCHOR, T.SMART_OBJECT]);
const IS_SEQ = new Set([T.SEQUENCE, T.SET, T.ARRAY, T.SMART_ARRAY]);

module.exports = {
    create: (state) => ({
        get: (target, prop, receiver) => {
            if (prop === '__resolve__' || prop === 'valueOf') return () => state.resolveSelf();
            if (prop === constants.SYMBOLS.INTERNALS) return state;
            if (prop === 'toJSON') return () => state.resolveSelf();

            state.ensureResolved();

            if (typeof prop === 'string' || typeof prop === 'number') {
                const found = state.nav.resolveKey(prop);
                if (found) return state.nav.wrap(found, prop);
            }

            return Reflect.get(target, prop, receiver);
        },

        set: (target, prop, value) => {
            if (prop === constants.SYMBOLS.INTERNALS) return true;
            state.writer.set(prop, value);
            return true;
        },

        deleteProperty: (target, prop) => {
            state.writer.delete(prop);
            return true;
        }
    })
};
