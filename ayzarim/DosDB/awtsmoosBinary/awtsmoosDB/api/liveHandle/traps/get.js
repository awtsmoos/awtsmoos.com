
// B"H
const constants = require('../../../constants.js');
const SequenceMethods = require('./sequence.js');
const HandleRegistry = require('../../../core/registry/handle.js');

module.exports = {
    handle(state, tgt, prop, receiver) {
        if (prop === '__resolve__' || prop === 'valueOf') return () => state.reader.resolveSelf();
        state.ensureResolved();
        const SOUL_SIG = HandleRegistry.SOUL_SIG || Symbol.for('Awtsmoos.Soul');
        if (prop === constants.SYMBOLS.INTERNALS || prop === SOUL_SIG) return state;
        if (prop === 'toString' || prop === Symbol.toPrimitive) return () => `[LiveHandle: ${state.getPath()} (Type: ${state.type})]`;
        if (prop === 'toJSON') return () => state.reader.resolveSelf();
        const T = constants.VAL_TYPE;
        const isSeq = state.type === T.SEQUENCE || state.type === T.SET || state.type === T.ARRAY;
        const isMap = state.type === T.MAP || state.type === T.DICTIONARY || state.type === T.OBJECT;
        if (isSeq) {
            if (prop === 'length') return state.reader.length();
            if (typeof prop === 'string') { const m = SequenceMethods(state.reader, state.writer, state); if (Object.prototype.hasOwnProperty.call(m, prop)) return m[prop]; }
            if (prop === Symbol.iterator) return state.reader.iterator.bind(state.reader);
        }
        if (isMap) {
            if (prop === Symbol.iterator) return state.reader.iterator.bind(state.reader);
            if (prop === 'set') return (k, v) => { state.writer.set(k, v); return receiver; };
            if (prop === 'get') return (k) => {
                const res = state.nav.resolveKey(k);
                if (res && res.ptr) {
                    const isS = [T.MAP, T.SEQUENCE, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY].includes(res.type);
                    if (isS) return state.nav.navigate(k, res.ptr, res.type); 
                    return state.nav.navigate(k, res.ptr, res.type)[constants.SYMBOLS.INTERNALS].reader.resolveSelf();
                }
                return undefined;
            };
            if (prop === 'has') return (k) => !!state.nav.resolveKey(k);
            if (prop === 'delete') return (k) => state.writer.delete(k);
            if (prop === 'keys') return state.reader.keys.bind(state.reader);
            if (prop === 'values') return state.reader.values.bind(state.reader);
            if (prop === 'entries') return state.reader.entries.bind(state.reader);
            if (prop === 'size') return state.reader.length();
        }
        if (typeof prop === 'string' || typeof prop === 'number') {
            const res = state.nav.resolveKey(prop);
            if (res && res.ptr) {
                const isS = [T.MAP, T.SEQUENCE, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY].includes(res.type);
                const next = state.nav.navigate(prop, res.ptr, res.type);
                if (isS) return next; return next[constants.SYMBOLS.INTERNALS].reader.resolveSelf();
            }
        }
        return Reflect.get(tgt, prop, receiver);
    }
};
