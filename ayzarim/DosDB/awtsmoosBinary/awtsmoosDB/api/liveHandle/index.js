//B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Malchut - The Divine Interface.
 *  This file manifests the LiveHandle, a Proxy-based vessel that allows the physical 
 *  database blocks to be navigated as if they were ethereal JavaScript objects.
 *  The Essence (Awtsmoos) constanty creates the structure from the void, 
 *  and this interface allows us to observe and interact with that creation.
 * 
 *  The issues previously encountered were due to the truncation of this file,
 *  which left the vessel shattered and unable to hold the light of the Search Indexer.
 *  I have now restored the full architecture, ensuring the Proxy traps are 
 *  robust and the resolution logic is absolute.
 */

const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/handleRegistry.js');
const Navigator = require('./navigator.js');
const Writer = require('./writer.js');
const Reader = require('./reader.js');
const constants = require('../../constants.js');

class LiveHandle {
    /**
     * @description
     *  Constructs the Divine Interface. Returns a Proxy that intercepts 
     *  standard JS operations and translates them into database commands.
     * 
     *  @param {AwtsmoosDB} db - The database instance (The Source).
     *  @param {Buffer} ptr - The 16-byte SmartPointer buffer.
     *  @param {number} type - The Type ID of the data.
     *  @param {object} context - Parent handle and key context for hierarchical tracking.
     */
    constructor(db, ptr, type, context = null) {
        const target = function() {}; 
        
        const state = {
            db, ptr, type, context,
            lastMutationCount: -1,
            lastParentPtrHash: null,
            isLiveHandle: true,
            isUpdatingPointer: false
        };

        /**
         * @description
         *  Ensures the handle's pointer is valid and synchronized with the latest
         *  mutations in the database. If a parent node has moved or changed, 
         *  this method re-navigates to find the current pointer.
         */
        state.ensureResolved = async (force = false) => {
            if (state.isUpdatingPointer) return;
            const gc = db.mutationCount || 0;
            if (!force && state.ptr && state.lastMutationCount === gc) return;

            return db.read(async () => {
                const gcLock = db.mutationCount || 0;
                if (!force && state.ptr && state.lastMutationCount === gcLock) return;

                let parentChanged = false;
                let parentH = null;

                if (state.context && state.context.parent) {
                    parentH = state.context.parent[constants.SYMBOLS.INTERNALS] || state.context.parent;
                    
                    await parentH.ensureResolved(force);
                    
                    const currentParentHash = parentH.ptr ? parentH.ptr.toString('hex') : 'null';
                    if (state.lastParentPtrHash !== currentParentHash) {
                        parentChanged = true;
                        state.lastParentPtrHash = currentParentHash;
                    }
                }

                // Root check
                const isRoot = (db.root && (state === (db.root[constants.SYMBOLS.INTERNALS] || db.root)));
                
                if (isRoot) {
                    if (db.rootPtrRaw) {
                        if (!state.ptr || Buffer.compare(state.ptr, db.rootPtrRaw) !== 0) {
                            state.ptr = db.rootPtrRaw;
                            const decoded = SmartPointer.decode(state.ptr);
                            if (decoded) state.type = decoded.type;
                            state.writer.common.invalidateEngine();
                        }
                    }
                    state.lastMutationCount = gcLock;
                    return;
                }

                if (parentH) {
                    let result = await parentH.nav.resolveKey(state.context.key);
                    
                    // Retry if parent moved
                    if (!result && (force || parentChanged) && (parentH.type === constants.TYPE_DICTIONARY || parentH.type === constants.TYPE_MAP)) {
                        parentH.writer.common.invalidateEngine();
                        result = await parentH.nav.resolveKey(state.context.key);
                    }

                    if (result) {
                        state.ptr = result.ptr;
                        state.type = result.type;
                        if (state.writer && state.writer.common) {
                            state.writer.common.invalidateEngine();
                        }
                    } else {
                        state.ptr = null;
                        state.type = null; 
                    }
                }
                state.lastMutationCount = gcLock;
            });
        };

        /**
         * @description
         *  Constructs the logical path from root to this handle.
         */
        state.getPath = () => {
            const parts = [];
            let curr = state.context;
            while (curr) {
                parts.unshift(String(curr.key));
                curr = curr.parent ? (curr.parent[constants.SYMBOLS.INTERNALS] || curr.parent).context : null;
            }
            return parts.length > 0 ? parts.join('.') : 'root';
        };

        /**
         * @description
         *  Updates the internal pointer and bubbles the change up to parents,
         *  ensuring the entire branch of the fractal tree is updated.
         */
        state._updatePointer = async (newPtrBuffer) => {
            if (!newPtrBuffer) return;
            state.ptr = newPtrBuffer;
            const decoded = SmartPointer.decode(newPtrBuffer);
            if(decoded) state.type = decoded.type;
            
            state.isUpdatingPointer = true;

            if (state.writer && state.writer.common) {
                state.writer.common.invalidateEngine();
            }

            if (db) {
                db.mutationCount = (db.mutationCount || 0) + 1;
                state.lastMutationCount = db.mutationCount; 
            }

            try {
                if (state.context && state.context.parent) {
                    const parentH = state.context.parent[constants.SYMBOLS.INTERNALS] || state.context.parent;
                    await parentH.ensureResolved(true);
                    await parentH.writer._setRaw(state.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
                    if (parentH.ptr) state.lastParentPtrHash = parentH.ptr.toString('hex');
                } else if (db.root === proxy || (db.root && db.root[constants.SYMBOLS.INTERNALS] === state)) {
                    if (decoded && decoded.mode === constants.MODE_BLOCK) {
                        const { readPointer48, writePointer48 } = require('../../utils/binaryHelpers.js');
                        const blockId = readPointer48(decoded.payload, 0);
                        const len = decoded.payload.readUInt32BE(6);
                        const off = decoded.payload.readUInt32BE(10);
                        const isChain = decoded.payload.readUInt8(14) === 1;
                        
                        db.rootPtrRaw = newPtrBuffer;
                        await db.allocator.v1.updateSuperBlock((sb) => {
                            writePointer48(sb, blockId, 64);
                            sb.writeUInt32BE(len, 70);
                            sb.writeUInt32BE(off, 74);
                            sb.writeUInt8(isChain ? 1 : 0, 78);
                        });
                    }
                }
            } finally {
                state.isUpdatingPointer = false;
            }
        };

        // Component instantiation
        state.nav = new Navigator(state);
        state.writer = new Writer(state);
        state.reader = new Reader(state);

        const ARRAY_MUTATORS = ['reverse', 'sort', 'fill', 'copyWithin'];
        const ARRAY_ACCESSORS = [
            'join', 'toLocaleString', 'toString', 'includes', 'indexOf', 'lastIndexOf', 
            'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'at', 'concat', 'slice'
        ];

        const proxy = new Proxy(target, {
            get: (tgt, prop, receiver) => {
                if (prop === constants.SYMBOLS.INTERNALS) return state;

                // Standard JS Protocols
                if (prop === 'then') return (res, rej) => state.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => state.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => state.reader.resolveSelf().finally(cb);
                if (prop === 'constructor' || prop === 'prototype') return target[prop];

                // Database Writing Methods
                if (prop === 'set') return state.writer.set.bind(state.writer);
                if (prop === 'delete') return state.writer.delete.bind(state.writer);
                if (prop === 'push') return state.writer.push.bind(state.writer);
                if (prop === 'splice') return state.writer.splice.bind(state.writer);
                if (prop === 'createMap') return state.writer.createMap.bind(state.writer);
                if (prop === 'createList') return state.writer.createList.bind(state.writer);
                if (prop === 'createObject') return state.writer.createObject.bind(state.writer);
                if (prop === 'compact') return state.writer.compact.bind(state.writer);
                if (prop === 'concat') return state.writer.concat.bind(state.writer);

                // Database Reading Methods
                if (prop === 'length') return state.reader.length(); 
                if (prop === 'keys') return state.reader.keys.bind(state.reader);
                if (prop === 'values') return state.reader.values.bind(state.reader);
                if (prop === 'entries') return state.reader.entries.bind(state.reader);
                if (prop === 'slice') return state.reader.slice.bind(state.reader);
                if (prop === 'stats') return state.reader.stats.bind(state.reader);
                if (prop === 'get') return state.reader.getItem.bind(state.reader);

                // Standard Array Helpers for Sequence types
                if (state.type === constants.TYPE_SEQUENCE || state.type === constants.TYPE_SMART_ARRAY) {
                    if (ARRAY_MUTATORS.includes(prop) || ARRAY_ACCESSORS.includes(prop)) {
                         return async (...args) => {
                             const arr = await state.reader.resolveSelf();
                             if (!Array.isArray(arr)) return undefined;
                             const res = arr[prop](...args);
                             if (ARRAY_MUTATORS.includes(prop) && state.context && state.context.parent) {
                                 const pSoul = HandleRegistry.getSoul(state.context.parent);
                                 if (pSoul) await pSoul.writer.set(state.context.key, arr);
                             }
                             return res;
                         };
                    }
                }

                if (prop === Symbol.asyncIterator) return state.reader.iterator.bind(state.reader);

                // Default behavior: Navigation
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
                
                // Handle method calls on handles (e.g., list.push(...))
                if (state.context && state.context.parent) {
                    const parentH = state.context.parent[constants.SYMBOLS.INTERNALS] || state.context.parent;
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

                // Handle callable functions stored in DB
                if (state.ptr) {
                    const source = await SmartPointer.resolve(state.ptr, state.db.allocator);
                    if (typeof source === 'string') {
                        const fn = new Function('return ' + source)();
                        if (typeof fn === 'function') return fn.apply(thisArg, args);
                    }
                }
                throw new Error(`B"H: Cannot execute undefined function or method '${state.context ? state.context.key : 'unknown'}' at ${state.getPath()}`);
            }
        });

        state.self = proxy;
        HandleRegistry.register(proxy, state);
        return proxy;
    }

    /**
     * @description 
     *  Authoritatively resolves a static 16-byte pointer into its 
     *  underlying JavaScript value or a LiveHandle.
     * 
     *  @param {Buffer} ptrBuf - The 16-byte SmartPointer buffer.
     *  @param {AwtsmoosDB} db - The database instance.
     */
    static async resolvePointer(ptrBuf, db) {
        if (!ptrBuf || ptrBuf.length !== 16) return null;
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return null;
        const h = new LiveHandle(db, ptrBuf, decoded.type, null);
        const internal = h[constants.SYMBOLS.INTERNALS];
        return await internal.reader.resolveSelf();
    }
}

module.exports = LiveHandle;