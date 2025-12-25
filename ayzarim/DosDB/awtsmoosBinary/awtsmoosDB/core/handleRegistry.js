// B"H
/**
 * @file handleRegistry.js
 * @description
 *  The Book of Names. A private registry that connects the Proxy (Body)
 *  to its Internal State (Soul).
 */

const registry = new WeakMap();
const SOUL_SIG = Symbol.for('Awtsmoos.Soul');

module.exports = {
    SOUL_SIG,
    
    /**
     * @description Registers state for a handle.
     */
    register(proxy, state) {
        state[SOUL_SIG] = true;
        registry.set(proxy, state);
    },

    /**
     * @description Retrieves the internal state (Soul) of a handle.
     */
    getSoul(obj) {
        if (!obj) return undefined;
        if (registry.has(obj)) return registry.get(obj);
        if (obj[SOUL_SIG]) return obj;
        return undefined;
    },

    /**
     * @description Checks if the object is a recognized database handle.
     */
    isHandle(obj) {
        return !!this.getSoul(obj);
    },

    /**
     * @description Factory for creating pure-mirror handles.
     * Breaks circular dependencies and enforces proxy purity.
     */
    createHandle(db, ptr, type, context = null) {
        // Requirements loaded inside to break circularity
        const LiveHandleLogic = require('../api/liveHandle/index.js');
        const Navigator = require('../api/liveHandle/navigator.js');
        const Writer = require('../api/liveHandle/writer.js');
        const Reader = require('../api/liveHandle/reader.js');
        const constants = require('../constants.js');

        const target = function() {}; 
        
        const state = {
            db, ptr, type, context,
            lastMutationCount: -1
        };

        // Instantiate logic
        const logic = new LiveHandleLogic(state);
        state.nav = new Navigator(state);
        state.writer = new Writer(state);
        state.reader = new Reader(state);
        state.logic = logic;

        // B"H: Bind Blessed Methods directly to the state for internal usage.
        // This ensures compatibility with Writers/Navigators without leaking to Proxy.
        state.ensureResolved = logic.ensureResolved.bind(logic);
        state.getPath = logic.getPath.bind(logic);
        state._updatePointer = logic._updatePointer.bind(logic);

        const ARRAY_MUTATORS = ['reverse', 'sort', 'fill', 'copyWithin'];
        const ARRAY_ACCESSORS = ['join', 'toLocaleString', 'toString', 'includes', 'indexOf', 'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'at', 'concat', 'slice'];

        const proxy = new Proxy(target, {
            get: (tgt, prop) => {
                // 1. Symbol Bypass
                if (typeof prop === 'symbol') {
                    if (prop === SOUL_SIG) return true;
                    if (prop === constants.SYMBOLS.INTERNALS) return state;
                    return state[prop];
                }

                // 2. Blessed JS Properties & Promises
                if (prop === 'then') return (res, rej) => state.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => state.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => state.reader.resolveSelf().finally(cb);
                if (prop === 'constructor' || prop === 'prototype') return target[prop];

                // 3. Core Database Methods
                // B"H: Expose Writer methods
                if (prop === 'set') return state.writer.set.bind(state.writer);
                if (prop === 'delete') return state.writer.delete.bind(state.writer);
                if (prop === 'push') return state.writer.push.bind(state.writer);
                if (prop === 'splice') return state.writer.splice.bind(state.writer);
                if (prop === 'createMap') return state.writer.createMap.bind(state.writer);
                if (prop === 'createList') return state.writer.createList.bind(state.writer);
                if (prop === 'createObject') return state.writer.createObject.bind(state.writer);
                if (prop === 'compact') return state.writer.compact.bind(state.writer);
                if (prop === 'concat') return state.writer.concat.bind(state.writer);

                // B"H: Expose Reader methods
                if (prop === 'length') return state.reader.length(); // Returns a promise
                if (prop === 'keys') return state.reader.keys.bind(state.reader);
                if (prop === 'values') return state.reader.values.bind(state.reader);
                if (prop === 'entries') return state.reader.entries.bind(state.reader);
                if (prop === 'slice') return state.reader.slice.bind(state.reader);
                if (prop === 'stats') return state.reader.stats.bind(state.reader);
                if (prop === 'get') return state.reader.getItem.bind(state.reader);

                // 4. Standard Array Helpers
                if (state.type === constants.TYPE_SEQUENCE || state.type === constants.TYPE_SMART_ARRAY) {
                    if (ARRAY_MUTATORS.includes(prop) || ARRAY_ACCESSORS.includes(prop)) {
                         return async (...args) => {
                             const arr = await state.reader.resolveSelf();
                             const res = arr[prop](...args);
                             if (ARRAY_MUTATORS.includes(prop) && state.context && state.context.parent) {
                                 const pSoul = module.exports.getSoul(state.context.parent);
                                 if (pSoul) await pSoul.writer.set(state.context.key, arr);
                             }
                             return res;
                         };
                    }
                }

                if (prop === Symbol.asyncIterator) return state.reader.iterator.bind(state.reader);

                // 5. Default: Navigation
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
                if (state.ptr) {
                    const SmartPointer = require('../utils/smartPointer.js');
                    const source = await SmartPointer.resolve(state.ptr, state.db.allocator);
                    if (typeof source === 'string') {
                        const fn = new Function('return ' + source)();
                        if (typeof fn === 'function') return fn.apply(thisArg, args);
                    }
                }
                throw new Error(`B"H: Cannot execute undefined function at ${state.getPath()}`);
            }
        });

        state.self = proxy;
        this.register(proxy, state);
        return proxy;
    }
};