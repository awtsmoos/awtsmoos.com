//B"H

/**
 * @file traps.js
 * @description
 *  The Sefirah of Hod - The Splendor of the Interface.
 *  Defines the Proxy traps that translate JS operations (get, set, delete, apply)
 *  into the modular logic of the Reader, Writer, and Navigator.
 */

const constants = require('../../constants.js');

module.exports = {
    /**
     * @description
     *  Creates the traps for the LiveHandle Proxy.
     *  @param {object} state - The internal soul of the handle.
     *  @param {function} target - The proxy target function.
     */
    createTraps: (state, target) => {
        const ARRAY_MUTATORS = ['reverse', 'sort', 'fill', 'copyWithin'];
        const ARRAY_ACCESSORS = [
            'join', 'toLocaleString', 'toString', 'includes', 'indexOf', 'lastIndexOf', 
            'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'at', 'concat', 'slice'
        ];

        return {
            get: (tgt, prop, receiver) => {
                if (prop === constants.SYMBOLS.INTERNALS) return state;

                // --- Primitive Conversion Traps (B"H Fix) ---
                if (prop === Symbol.toPrimitive) {
                    return (hint) => {
                        if (hint === 'string' || hint === 'default') {
                            const path = state.getPath();
                            if (path && path !== 'root') return `[LiveHandle: ${path}]`;
                            const id = state.db.graph ? state.db.graph.utils.getIdFromPtr(state.ptr) : 'unresolved';
                            return `[LiveHandle: ${id}]`;
                        }
                        return 0; // number
                    };
                }
                if (prop === 'toString') {
                    return () => {
                        const path = state.getPath();
                        if (path && path !== 'root') return `[LiveHandle: ${path}]`;
                        const id = state.db.graph ? state.db.graph.utils.getIdFromPtr(state.ptr) : 'unresolved';
                        return `[LiveHandle: ${id}]`;
                    };
                }
                if (prop === 'valueOf') {
                    return () => 0; 
                }
                if (prop === 'toJSON') {
                    return () => state.getPath(); 
                }

                // --- Internal Control Sparks ---
                if (prop === 'ensureResolved') return state.ensureResolved;
                if (prop === 'getPath') return state.getPath;
                if (prop === '_updatePointer') return state._updatePointer;

                // --- Standard JS Async Protocols ---
                if (prop === 'then') return (res, rej) => state.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => state.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => state.reader.resolveSelf().finally(cb);
                
                // --- Reflection and Construction ---
                if (prop === 'constructor' || prop === 'prototype') return target[prop];

                // --- Database Writing Methods (Explicit) ---
                if (prop === 'set') return state.writer.set.bind(state.writer);
                if (prop === 'delete') return state.writer.delete.bind(state.writer);
                if (prop === 'push') return state.writer.push.bind(state.writer);
                if (prop === 'splice') return state.writer.splice.bind(state.writer);
                if (prop === 'createMap') return state.writer.createMap.bind(state.writer);
                if (prop === 'createList') return state.writer.createList.bind(state.writer);
                if (prop === 'createObject') return state.writer.createObject.bind(state.writer);
                if (prop === 'compact') return state.writer.compact.bind(state.writer);
                if (prop === 'concat') return state.writer.concat.bind(state.writer);

                // --- Database Reading Methods (Explicit) ---
                if (prop === 'length') return state.reader.length(); 
                if (prop === 'keys') return state.reader.keys.bind(state.reader);
                if (prop === 'values') return state.reader.values.bind(state.reader);
                if (prop === 'entries') return state.reader.entries.bind(state.reader);
                if (prop === 'slice') return state.reader.slice.bind(state.reader);
                if (prop === 'stats') return state.reader.stats.bind(state.reader);
                if (prop === 'get') return state.reader.getItem.bind(state.reader);

                // --- Array Emulation for Sequence types ---
                if (state.type === constants.TYPE_SEQUENCE || state.type === constants.TYPE_SMART_ARRAY) {
                    if (ARRAY_MUTATORS.includes(prop) || ARRAY_ACCESSORS.includes(prop)) {
                         return async (...args) => {
                             const arr = await state.reader.resolveSelf();
                             if (!Array.isArray(arr)) return undefined;
                             const res = arr[prop](...args);
                             if (ARRAY_MUTATORS.includes(prop) && state.context && state.context.parent) {
                                 const HandleRegistry = require('../../core/handleRegistry.js');
                                 const pSoul = HandleRegistry.getSoul(state.context.parent);
                                 if (pSoul) await pSoul.writer.set(state.context.key, arr);
                             }
                             return res;
                         };
                    }
                }

                if (prop === Symbol.asyncIterator) return state.reader.iterator.bind(state.reader);

                // Default behavior: Navigation into child properties
                return state.nav.navigate(prop);
            },
            
            set: (tgt, prop, value) => {
                state.writer.set(prop, value);
                return true;
            },
            
            deleteProperty: (tgt, prop) => {
                state.writer.delete(prop);
                return true;
            },

            apply: async (tgt, thisArg, args) => {
                await state.ensureResolved();
                
                const HandleRegistry = require('../../core/handleRegistry.js');

                if (state.context && state.context.parent) {
                    const parentH = HandleRegistry.getSoul(state.context.parent);
                    const method = state.context.key;
                    
                    if (parentH.type === constants.TYPE_SEQUENCE || parentH.type === constants.TYPE_SMART_ARRAY) {
                        if (method === 'push') return parentH.writer.push(...args);
                        if (method === 'splice') return parentH.writer.splice(...args);
                        if (method === 'slice') return parentH.reader.slice(...args);
                    }
                    if (parentH.type === constants.TYPE_MAP || parentH.type === constants.TYPE_DICTIONARY) {
                        if (method === 'set') return parentH.writer.set(...args);
                        if (method === 'delete') return parentH.writer.delete(...args);
                    }
                }

                if (state.ptr) {
                    const SmartPointer = require('../../utils/smartPointer.js');
                    const source = await SmartPointer.resolve(state.ptr, state.db.allocator);
                    if (typeof source === 'string') {
                        const fn = new Function('return ' + source)();
                        if (typeof fn === 'function') return fn.apply(thisArg, args);
                    }
                }
                throw new Error(`B"H: Cannot execute undefined function or method '${state.context ? state.context.key : 'unknown'}' at ${state.getPath()}`);
            }
        };
    }
};