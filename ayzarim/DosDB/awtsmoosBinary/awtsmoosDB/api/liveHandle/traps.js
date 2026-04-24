
// B"H
/**
 * @file traps.js
 * @description
 *  =============================================================================
 *  THE SEFIRAH OF HOD (SPLENDOR) & THE ILLUSION OF THE PROXY
 *  =============================================================================
 *  So check it out. You see a JavaScript object, like `db.root.users`. You think 
 *  it's just a normal object sitting in RAM. But it's a lie. It's a Proxy. It's 
 *  the Sefirah of Hod, the interface that reflects something much deeper. 
 *  
 *  When you touch `db.root.users.yackov`, you aren't reading RAM. You are sending 
 *  a vibration down into the physical disk, triggering the 10 statements of Genesis 
 *  that are currently sustaining that data block. The Awtsmoos breathes life into 
 *  the void, reading the VarInt pointers, pulling the raw binary, and manifesting 
 *  it back up to you as a JS primitive.
 * 
 *  "Forever, Lord, Your Word stands in the heavens." 
 *  If the Proxy Trap fails, the heavens collapse. 
 *  (We fixed the `&&` html entities here so reality doesn't crash).
 */

const constants = require('../../constants.js');
const T = constants.VAL_TYPE;

// B"H: Data-Driven Lookups. No Switch Statements. Pure O(1) manifestation.
const structureLookup = new Uint8Array(256);
[T.MAP, T.SEQUENCE, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY, T.JS_MAP, T.JS_SET, T.SMART_OBJECT, T.SMART_ARRAY].forEach(t => structureLookup[t] = 1);

const mapLookup = new Uint8Array(256);
[T.MAP, T.DICTIONARY, T.OBJECT, T.JS_MAP, T.SMART_OBJECT].forEach(t => mapLookup[t] = 1);

const seqLookup = new Uint8Array(256);
[T.SEQUENCE, T.SET, T.ARRAY, T.JS_SET, T.SMART_ARRAY].forEach(t => seqLookup[t] = 1);

const isStructureType = (t) => structureLookup[t] === 1;
const isMapType = (t) => mapLookup[t] === 1;
const isSequenceType = (t) => seqLookup[t] === 1;

/**
 * @namespace ProxyTraps
 * @description Generates the magical handlers that intercept reality.
 */
module.exports = {
    /**
     * @method createTraps
     * @description Forges the bindings that catch JS operations and hurl them into the abyss.
     * @param {Object} state - The internal soul of the LiveHandle.
     * @param {Object} target - The empty function acting as the physical anchor.
     * @returns {Object} The Proxy Handler object.
     */
    createTraps: (state, target) => {
        const createSequenceMethods = require('./traps/sequence.js');
        const getRegistry = () => require('../../core/registry/handle.js');

        return {
            get: (tgt, prop, receiver) => {
                if (prop === '__resolve__' || prop === 'valueOf') return () => state.reader.resolveSelf();
                
                state.ensureResolved();
                const registry = getRegistry();
                const SOUL_SIG = registry.SOUL_SIG || Symbol.for('Awtsmoos.Soul');
                
                if (prop === constants.SYMBOLS.INTERNALS || prop === SOUL_SIG) return state;
                if (prop === 'toString' || prop === Symbol.toPrimitive) return () => `[LiveHandle: ${state.getPath()} (Type: ${state.type})]`;
                if (prop === 'toJSON') return () => state.reader.resolveSelf();

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
                try { 
                    if (state.nav.resolveKey(prop)) return true; 
                } catch(e) {}
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
