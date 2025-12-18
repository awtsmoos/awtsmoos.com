


// B"H
const Navigator = require('./navigator.js');
const Writer = require('./writer.js');
const Reader = require('./reader.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');

const ARRAY_MUTATORS_IN_PLACE = ['reverse', 'sort', 'fill', 'copyWithin'];
const ARRAY_ACCESSORS = [
    'join', 'toLocaleString', 'toString', 'includes', 'indexOf', 'lastIndexOf', 
    'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'reduceRight', 
    'find', 'findIndex', 'findLast', 'findLastIndex', 'flat', 'flatMap', 'at',
    'concat', 'toReversed', 'toSorted', 'toSpliced', 'with'
];

class LiveHandleV2 {
    constructor(db, ptrBuffer, type, context = null) {
        const target = function() {}; 
        
        target.db = db;
        target.ptr = ptrBuffer;
        target.type = type;
        target.context = context; 
        target.isLiveHandle = true; 
        target.lastParentPtrHash = null; 
        target.isUpdatingPointer = false; 
        
        target.lastMutationCount = -1;
        target._cachedResolution = null; 

        target.ensureResolved = this.ensureResolved.bind(target);
        target.getPath = this.getPath.bind(target);
        target._updatePointer = this._updatePointer.bind(target);
        
        target.nav = new Navigator(target);
        target.writer = new Writer(target);
        target.reader = new Reader(target);

        return new Proxy(target, {
            get: (tgt, prop, receiver) => {
                if (prop === constants.SYMBOLS.INTERNALS) return tgt;

                if (prop === 'then') return (res, rej) => tgt.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => tgt.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => tgt.reader.resolveSelf().finally(cb);
                
                if (tgt.type === constants.TYPE_SEQUENCE) {
                    if (prop === 'set') return tgt.writer.set.bind(tgt.writer); 
                    if (prop === 'push') return tgt.writer.push.bind(tgt.writer);
                    if (prop === 'splice') return tgt.writer.splice.bind(tgt.writer);
                    
                    if (prop === 'pop') return async () => { 
                        const len = await tgt.reader.length(); 
                        if (len === 0) return undefined;
                        const removed = await tgt.writer.splice(len-1, 1); 
                        return removed[0];
                    };
                    
                    if (prop === 'shift') return async () => {
                        const len = await tgt.reader.length(); 
                        if (len === 0) return undefined;
                        const removed = await tgt.writer.splice(0, 1);
                        return removed[0];
                    };
                    
                    if (prop === 'unshift') return async (...items) => {
                        await tgt.writer.splice(0, 0, ...items);
                        return await tgt.reader.length();
                    };
                    
                    if (prop === 'slice') return tgt.reader.slice.bind(tgt.reader);
                    if (prop === 'entries') return tgt.reader.entries.bind(tgt.reader);
                    if (prop === 'keys') return tgt.reader.keys.bind(tgt.reader);
                    if (prop === 'values') return tgt.reader.values.bind(tgt.reader);
                    if (prop === 'length') return tgt.reader.length();
                    
                    if (ARRAY_MUTATORS_IN_PLACE.includes(prop)) {
                        return async (...args) => {
                            const arr = await tgt.reader.resolveSelf();
                            if (!Array.isArray(arr)) throw new Error("Underlying data is not an array");
                            const res = arr[prop](...args);
                            if (tgt.context && tgt.context.parent) {
                                const parentH = tgt.context.parent[constants.SYMBOLS.INTERNALS] || tgt.context.parent;
                                await parentH.writer.set(tgt.context.key, arr);
                            } else {
                                throw new Error("Cannot persist in-place mutation on root or detached sequence yet.");
                            }
                            return res; 
                        };
                    }

                    if (ARRAY_ACCESSORS.includes(prop)) {
                        return async (...args) => {
                            const arr = await tgt.reader.resolveSelf();
                            if (!Array.isArray(arr)) return undefined;
                            return arr[prop](...args);
                        };
                    }
                    
                    if (typeof prop === 'string' && !isNaN(prop) && Number.isInteger(parseFloat(prop))) {
                         return tgt.nav.navigate(prop);
                    }
                }

                if (tgt.type === constants.TYPE_MAP) {
                    if (prop === 'get') return (key) => tgt.nav.navigate(key);
                    if (prop === 'set') return tgt.writer.set.bind(tgt.writer);
                    if (prop === 'delete') return tgt.writer.delete.bind(tgt.writer);
                    if (prop === 'has') return (key) => tgt.db.has(receiver, key);
                    if (prop === 'size') return tgt.reader.length();
                    if (prop === 'entries') return tgt.reader.entries.bind(tgt.reader);
                    if (prop === 'keys') return tgt.reader.keys.bind(tgt.reader);
                    if (prop === 'values') return tgt.reader.values.bind(tgt.reader);
                }

                if (tgt.type === constants.TYPE_DICTIONARY) {
                    if (prop === 'get') return (key) => tgt.nav.navigate(key);
                    if (prop === 'set') return tgt.writer.set.bind(tgt.writer);
                    if (prop === 'delete') return tgt.writer.delete.bind(tgt.writer);
                    if (prop === 'has') return (key) => tgt.db.has(receiver, key);
                    if (prop === 'entries') return tgt.reader.entries.bind(tgt.reader);
                    if (prop === 'keys') return tgt.reader.keys.bind(tgt.reader);
                    if (prop === 'values') return tgt.reader.values.bind(tgt.reader);
                }
                
                if (prop === Symbol.asyncIterator) return tgt.reader.iterator.bind(tgt.reader);
                if (prop === 'createMap') return tgt.writer.createMap.bind(tgt.writer);
                if (prop === 'createList') return tgt.writer.createList.bind(tgt.writer);
                if (prop === 'createObject') return tgt.writer.createObject.bind(tgt.writer);

                if (prop === 'toString' || prop === Symbol.toStringTag || prop === 'valueOf' || prop === Symbol.toPrimitive || prop === Symbol.for('nodejs.util.inspect.custom')) {
                    return () => `[LiveHandle ${tgt.getPath()}]`;
                }
                
                if (prop === 'ensureResolved') return tgt.ensureResolved;
                if (prop === 'getPath') return tgt.getPath;

                return tgt.nav.navigate(prop);
            },
            
            set: (tgt, prop, value) => {
                tgt.writer.set(prop, value);
                return true;
            },
            
            deleteProperty: (tgt, prop) => {
                tgt.writer.delete(prop);
                return true;
            },

            apply: async (tgt, thisArg, args) => {
                // B"H: CRITICAL FIX - Pre-resolution ensures type safety
                await tgt.ensureResolved(); 
                
                if (tgt.context && tgt.context.parent) {
                    const parentH = tgt.context.parent[constants.SYMBOLS.INTERNALS] || tgt.context.parent;
                    const method = tgt.context.key;
                    
                    // Force refresh of parent if type unknown
                    if (!parentH.type) {
                        parentH.writer.common.invalidateEngine();
                        await parentH.ensureResolved(true);
                    }
                    
                    if (!parentH.type) {
                         const pt = (tgt.context && tgt.context.parent) ? (tgt.context.parent.type || 'null') : 'none';
                         throw new Error(`B"H: Cannot execute method '${String(method)}' on non-existent object at ${parentH.getPath()} (Parent Type: ${pt})`);
                    }
                    
                    if (parentH.type === constants.TYPE_MAP || parentH.type === constants.TYPE_DICTIONARY) {
                        if (method === 'set') return parentH.writer.set(...args);
                        if (method === 'get') return parentH.nav.navigate(...args);
                        if (method === 'delete') return parentH.writer.delete(...args);
                        if (method === 'has') return tgt.db.has(parentH, ...args);
                        if (method === 'entries') return parentH.reader.entries(...args);
                        if (method === 'keys') return parentH.reader.keys(...args);
                        if (method === 'values') return parentH.reader.values(...args);
                    }
                    
                    if (parentH.type === constants.TYPE_SEQUENCE) {
                        if (method === 'set') return parentH.writer.set(...args);
                        if (method === 'push') return parentH.writer.push(...args);
                        if (method === 'splice') return parentH.writer.splice(...args);
                        if (method === 'pop') { 
                            const len = await parentH.reader.length(); 
                            if (len === 0) return undefined;
                            const removed = await parentH.writer.splice(len-1, 1); 
                            return removed[0];
                        }
                        if (method === 'shift') {
                            const len = await parentH.reader.length();
                            if (len === 0) return undefined;
                            const removed = await parentH.writer.splice(0, 1);
                            return removed[0];
                        }
                        if (method === 'unshift') {
                            await parentH.writer.splice(0, 0, ...args);
                            return await parentH.reader.length();
                        }
                        
                        if (method === 'slice') return parentH.reader.slice(...args);
                        if (method === 'entries') return parentH.reader.entries(...args);
                        if (method === 'keys') return parentH.reader.keys(...args);
                        if (method === 'values') return parentH.reader.values(...args);
                        
                        if (ARRAY_MUTATORS_IN_PLACE.includes(method) || ARRAY_ACCESSORS.includes(method)) {
                             const arr = await parentH.reader.resolveSelf();
                             if (!Array.isArray(arr)) throw new Error("Not an array");
                             const res = arr[method](...args);
                             if (ARRAY_MUTATORS_IN_PLACE.includes(method)) {
                                 if (parentH.context && parentH.context.parent) {
                                     const grandParent = parentH.context.parent[constants.SYMBOLS.INTERNALS] || parentH.context.parent;
                                     await grandParent.writer.set(parentH.context.key, arr);
                                 }
                             }
                             return res;
                        }
                    }
                }

                if (tgt.ptr) {
                    const source = await SmartPointer.resolve(tgt.ptr, tgt.db.allocator);
                    if (typeof source === 'string') {
                        const fn = new Function('return ' + source)();
                        if (typeof fn === 'function') return fn.apply(thisArg, args);
                    }
                }
                const pt = tgt.context && tgt.context.parent ? (tgt.context.parent.type || 'null') : 'none';
                throw new Error(`B"H: Cannot execute undefined function at ${tgt.getPath()} (Type ID: ${tgt.type}, Parent Type: ${pt})`);
            }
        });
    }

    async ensureResolved(force = false) {
        if (this.isUpdatingPointer) return;

        // B"H: Optimization - Check without lock first
        // If we are already resolved and no mutation happened in DB, skip lock overhead.
        const gc = this.db.mutationCount || 0;
        if (!force && this.lastMutationCount === gc && this.ptr) {
            return;
        }

        return this.db.read(async () => {
            const gcLock = this.db.mutationCount || 0;
            
            // Double-check inside lock
            if (!force && this.lastMutationCount === gcLock && this.ptr) {
                return;
            }

            let parentChanged = false;
            let parentH = null;
            
            if (this.context && this.context.parent) {
                parentH = this.context.parent[constants.SYMBOLS.INTERNALS] || this.context.parent;
                
                await parentH.ensureResolved(force);
                
                const currentParentHash = parentH.ptr ? parentH.ptr.toString('hex') : 'null';
                if (this.lastParentPtrHash !== currentParentHash) {
                    parentChanged = true;
                    this.lastParentPtrHash = currentParentHash;
                }
            }

            if (this === this.db.root || this === this.db.root[constants.SYMBOLS.INTERNALS]) {
                if (this.db.rootPtrRaw) {
                    if (!this.ptr || Buffer.compare(this.ptr, this.db.rootPtrRaw) !== 0) {
                        this.ptr = this.db.rootPtrRaw;
                        const decoded = SmartPointer.decode(this.ptr);
                        if (decoded) this.type = decoded.type;
                        this.writer.common.invalidateEngine();
                    }
                }
                this.lastMutationCount = gcLock;
                return;
            }

            if (parentH) {
                let result = await parentH.nav.resolveKey(this.context.key);
                
                // B"H: Retry logic for transient misses in heavy write load
                if (!result && (force || parentChanged) && (parentH.type === constants.TYPE_DICTIONARY || parentH.type === constants.TYPE_MAP)) {
                    parentH.writer.common.invalidateEngine();
                    result = await parentH.nav.resolveKey(this.context.key);
                }

                if (result) {
                    this.ptr = result.ptr;
                    this.type = result.type;
                } else {
                    this.ptr = null;
                    this.type = null; 
                }
            }
            this.lastMutationCount = gcLock;
        });
    }

    getPath() {
        const parts = [];
        let curr = this.context;
        while (curr) {
            parts.unshift(String(curr.key));
            curr = curr.parent ? (curr.parent[constants.SYMBOLS.INTERNALS] || curr.parent).context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }

    async _updatePointer(newPtrBuffer) {
        this.ptr = newPtrBuffer;
        const decoded = SmartPointer.decode(newPtrBuffer);
        if(decoded) this.type = decoded.type;

        this.isUpdatingPointer = true;
        
        if (this.db) {
            this.db.mutationCount = (this.db.mutationCount || 0) + 1;
            this.lastMutationCount = this.db.mutationCount; 
        }

        try {
            if (this.context && this.context.parent) {
                const parentH = this.context.parent[constants.SYMBOLS.INTERNALS] || this.context.parent;
                // B"H: Optimization - We know parent exists, skip ensureResolved to prevent cycle? 
                // No, we must ensure parent pointer is current before writing.
                await parentH.ensureResolved(true); 
                
                await parentH.writer._setRaw(this.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
                if(parentH.ptr) this.lastParentPtrHash = parentH.ptr.toString('hex');
                
            } else if (this.db.root === this || this.db.root[constants.SYMBOLS.INTERNALS] === this) {
                if (decoded && decoded.mode === constants.MODE_BLOCK) {
                    const blockId = require('../../utils/binaryHelpers.js').readPointer48(decoded.payload, 0);
                    const len = decoded.payload.readUInt32BE(6);
                    const off = decoded.payload.readUInt32BE(10);
                    const isChain = decoded.payload.readUInt8(14) === 1;
                    
                    this.db.rootPtrRaw = newPtrBuffer;
                    this.db.rootBlockId = blockId;

                    await this.db.allocator.v1.updateSuperBlock((sb) => {
                        require('../../utils/binaryHelpers.js').writePointer48(sb, blockId, 64);
                        sb.writeUInt32BE(len, 70);
                        sb.writeUInt32BE(off, 74);
                        sb.writeUInt8(isChain ? 1 : 0, 78);
                    });
                }
            }
        } finally {
            this.isUpdatingPointer = false;
        }
    }
    
    static async resolvePointer(ptr, db) {
        const LH = require('./index.js');
        const SP = require('../../utils/smartPointer.js');
        const decoded = SP.decode(ptr);
        if(!decoded) return null;
        const temp = new LH(db, ptr, decoded.type, null);
        const internal = temp[constants.SYMBOLS.INTERNALS];
        return await internal.reader.resolveSelf();
    }
}
module.exports = LiveHandleV2;