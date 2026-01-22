// B"H
/**
 * @file traps.js
 * @description 
 *  The Sefirah of Hod (Splendor) - The Interface Layer.
 *  Provides clean visibility into resolution and navigation.
 */
const constants = require('../../constants.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[35mB"H [TRAPS_LOG] ${msg}\x1b[0m\n`); } catch(e) {}
}

module.exports = {
    createTraps: (state, target) => {
        const createSequenceMethods = require('./traps_seq.js');
        const getRegistry = () => require('../../core/handleRegistry.js');

        const isStructureType = (t) => {
            const T = constants.VAL_TYPE;
            return t === T.MAP || t === T.SEQUENCE || t === T.DICTIONARY || 
                   t === T.SET || t === T.OBJECT || t === T.ARRAY;
        };

        const isMapType = (t) => {
            const T = constants.VAL_TYPE;
            return t === T.MAP || t === T.DICTIONARY || t === T.OBJECT;
        };

        const isSequenceType = (t) => {
            const T = constants.VAL_TYPE;
            return t === T.SEQUENCE || t === T.SET || t === T.ARRAY;
        };

        return {
            get: (tgt, prop, receiver) => {
                if (prop === '__resolve__' || prop === 'valueOf') {
                    return () => state.reader.resolveSelf();
                }

                state.ensureResolved();

                const registry = getRegistry();
                const SOUL_SIG = registry.SOUL_SIG || Symbol.for('Awtsmoos.Soul');
                
                if (prop === constants.SYMBOLS.INTERNALS || prop === SOUL_SIG) return state;

                if (prop === 'toString' || prop === Symbol.toPrimitive) {
                    return () => `[LiveHandle: ${state.getPath()} (Type: ${state.type})]`;
                }
                if (prop === 'toJSON') {
                    return () => state.reader.resolveSelf();
                }

                if (isSequenceType(state.type)) {
                    if (prop === 'length') return state.reader.length();
                    if (typeof prop === 'string') {
                        const methods = createSequenceMethods(state.reader, state.writer, state);
                        if (Object.prototype.hasOwnProperty.call(methods, prop)) return methods[prop];
                    }
                    if (prop === Symbol.iterator) return state.reader.iterator.bind(state.reader);
                }

                if (isMapType(state.type)) {
                    if (prop === Symbol.iterator) return state.reader.iterator.bind(state.reader);
                    if (prop === 'set') return (k, v) => { state.writer.set(k, v); return receiver; };
                    if (prop === 'get') return (k) => {
                        const res = state.nav.resolveKey(k);
                        if (res && res.ptr) {
                            if (isStructureType(res.type)) return state.nav.navigate(k, res.ptr, res.type); 
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
                        const next = state.nav.navigate(prop, res.ptr, res.type);
                        if (isStructureType(res.type)) return next; 
                        return next[constants.SYMBOLS.INTERNALS].reader.resolveSelf();
                    }
                }
                return Reflect.get(tgt, prop, receiver);
            },

            set: (tgt, prop, value) => {
                if (prop === constants.SYMBOLS.INTERNALS) return true;
                if (Object.prototype.hasOwnProperty.call(state, prop)) {
                    state[prop] = value;
                    return true;
                }
                state.writer.set(prop, value);
                return true;
            },

            deleteProperty: (tgt, prop) => {
                state.writer.delete(prop);
                return true;
            },

            ownKeys: (tgt) => {
                const keys = Reflect.ownKeys(tgt);
                const seen = new Set(keys.map(k => String(k)));
                try { 
                    for (const k of state.reader.keys()) {
                        const s = String(k);
                        if (!seen.has(s)) {
                            keys.push(s);
                            seen.add(s);
                        }
                    } 
                } catch(e) {}
                return keys;
            },

            has: (tgt, prop) => {
                if (prop in state) return true;
                try { if (state.nav.resolveKey(prop)) return true; } catch(e) {}
                return Reflect.has(tgt, prop);
            },

            getOwnPropertyDescriptor: (tgt, prop) => {
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
    }
};