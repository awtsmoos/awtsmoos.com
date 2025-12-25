// B"H
const Navigator = require('./navigator.js');
const Writer = require('./writer.js');
const Reader = require('./reader.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/handleRegistry.js');

const ARRAY_MUTATORS = ['reverse', 'sort', 'fill', 'copyWithin'];
const ARRAY_ACCESSORS = ['join', 'toLocaleString', 'toString', 'includes', 'indexOf', 'lastIndexOf', 'every', 'some', 'forEach', 'map', 'filter', 'reduce', 'at', 'concat', 'slice'];

class LiveHandleV2 {
    constructor(db, ptrBuffer, type, context = null) {
        const target = function() {}; 
        
        target.db = db;
        target.ptr = ptrBuffer;
        target.type = type;
        target.context = context; 
        target.lastMutationCount = -1;
        target.lastParentPtrHash = null;

        target.ensureResolved = this.ensureResolved.bind(target);
        target.getPath = this.getPath.bind(target);
        target._updatePointer = this._updatePointer.bind(target);
        
        target.nav = new Navigator(target);
        target.writer = new Writer(target);
        target.reader = new Reader(target);

        const proxy = new Proxy(target, {
            get: (tgt, prop, receiver) => {
                // B"H: Standard Thenable interface for 'await' support
                if (prop === 'then') return (res, rej) => tgt.reader.resolveSelf().then(res, rej);
                if (prop === 'catch') return (cb) => tgt.reader.resolveSelf().catch(cb);
                if (prop === 'finally') return (cb) => tgt.reader.resolveSelf().finally(cb);
                
                // B"H: Data-Mirror Logic
                if (tgt.type === constants.TYPE_SEQUENCE || tgt.type === constants.TYPE_SMART_ARRAY) {
                    if (prop === 'push') return tgt.writer.push.bind(tgt.writer);
                    if (prop === 'splice') return tgt.writer.splice.bind(tgt.writer);
                    if (prop === 'length') return tgt.reader.length();
                    if (ARRAY_MUTATORS.includes(prop) || ARRAY_ACCESSORS.includes(prop)) {
                         return async (...args) => {
                             const arr = await tgt.reader.resolveSelf();
                             const res = arr[prop](...args);
                             if (ARRAY_MUTATORS.includes(prop) && tgt.context && tgt.context.parent) {
                                 const parentH = HandleRegistry.getSoul(tgt.context.parent);
                                 await parentH.writer.set(tgt.context.key, arr);
                             }
                             return res;
                         };
                    }
                }

                if (prop === Symbol.asyncIterator) return tgt.reader.iterator.bind(tgt.reader);
                
                if (typeof prop === 'string' && prop !== 'prototype' && prop !== 'constructor') {
                    return tgt.nav.navigate(prop);
                }
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
                await tgt.ensureResolved();
                if (tgt.ptr) {
                    const source = await SmartPointer.resolve(tgt.ptr, tgt.db.allocator);
                    if (typeof source === 'string') {
                        const fn = new Function('return ' + source)();
                        if (typeof fn === 'function') return fn.apply(thisArg, args);
                    }
                }
                throw new Error(`B"H: Cannot execute undefined function at ${tgt.getPath()}`);
            }
        });

        // Register the Body (Proxy) with its Soul (Target)
        HandleRegistry.register(proxy, target);
        return proxy;
    }

    async ensureResolved(force = false) {
        const gc = this.db.mutationCount || 0;
        if (!force && this.lastMutationCount === gc && this.ptr) return;

        return this.db.read(async () => {
            let parentH = null;
            if (this.context && this.context.parent) {
                parentH = HandleRegistry.getSoul(this.context.parent);
                await parentH.ensureResolved(force);
            }

            if (this === this.db.root || (HandleRegistry.getSoul(this.db.root) === this)) {
                if (this.db.rootPtrRaw) {
                    this.ptr = this.db.rootPtrRaw;
                    const decoded = SmartPointer.decode(this.ptr);
                    if (decoded) this.type = decoded.type;
                }
                this.lastMutationCount = this.db.mutationCount;
                return;
            }

            if (parentH) {
                const result = await parentH.nav.resolveKey(this.context.key);
                if (result) {
                    this.ptr = result.ptr;
                    this.type = result.type;
                }
            }
            this.lastMutationCount = this.db.mutationCount;
        });
    }

    getPath() {
        const parts = [];
        let curr = this.context;
        while (curr) {
            parts.unshift(String(curr.key));
            const pSoul = HandleRegistry.getSoul(curr.parent);
            curr = pSoul ? pSoul.context : null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }

    async _updatePointer(newPtrBuffer) {
        this.ptr = newPtrBuffer;
        const decoded = SmartPointer.decode(newPtrBuffer);
        if(decoded) this.type = decoded.type;
        
        if (this.context && this.context.parent) {
            const pSoul = HandleRegistry.getSoul(this.context.parent);
            await pSoul.writer._setRaw(this.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
        } else if (this.db.root === this || (HandleRegistry.getSoul(this.db.root) === this)) {
            this.db.rootPtrRaw = newPtrBuffer;
            // Superblock update logic here...
        }
        this.db.mutationCount++;
    }
}
module.exports = LiveHandleV2;
