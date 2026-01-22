// B"H
/**
 * @file reader_resolve.js
 * @description
 *  The Sefirah of Binah (Understanding) - Manifesting the hidden JS soul from binary stone.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js'); 
const Dictionary = require('../../structure/dictionary/index.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const SmartBinary = require('../../utils/smartBinary.js');

module.exports = class ReaderResolver {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
    }

    _getAddrKey(ptr) {
        if (!ptr) return "void";
        return `${ptr.blockId}:${ptr.offset || 0}`;
    }

    resolveStructPtr() {
        if (this.handle.ptr) {
            return SmartPointer.resolve(this.handle.ptr, this.db.allocator);
        }
        return null;
    }

    resolveSelf() {
        return this.db.lock.runRead(() => {
            this.handle.ensureResolved();
            
            // Root Special Case: If it's the root, we must treat it as a Dictionary
            // regardless of whether ptr is set (it should be set by lifecycle).
            const isRoot = (this.handle === this.db.root);

            if (!this.handle.ptr && !isRoot) return undefined;
            
            if (this.handle.ptr) {
                const decoded = SmartPointer.decode(this.handle.ptr);
                if (decoded && decoded.mode === constants.MODE_INLINE) {
                    return SmartPointer.decodeInline(decoded.type, decoded.payload, this.db.allocator);
                }
            }

            const context = new Map();
            
            // If it's the Root OR a Dictionary type
            if (isRoot || this.handle.type === constants.VAL_TYPE.DICTIONARY) {
                let structPtr = null;
                if (isRoot && this.db.rootPtrRaw) {
                     structPtr = SmartPointer.resolve(this.db.rootPtrRaw, this.db.allocator);
                } else if (this.handle.ptr) {
                     structPtr = SmartPointer.resolve(this.handle.ptr, this.db.allocator);
                }

                if (!structPtr) return {}; 
                const dict = new Dictionary(this.db.allocator, structPtr);
                const obj = {};
                if (structPtr) context.set(this._getAddrKey(structPtr), obj); 
                this._hydrateDictionary(dict, obj, context);
                return obj;
            }
            
            // Generic recursive hydration
            const val = SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            if (val && val.isStructure) return this._hydrateStructure(val, context);
            
            if (val && typeof val === 'object' && val.__className__) {
                this._hydrateObjectProperties(val, context);
            }
            return val;
        });
    }

    _hydrateObjectProperties(obj, context) {
        for (const key in obj) {
            const val = obj[key];
            if (val && val.isStructure) {
                obj[key] = this._hydrateStructure(val, context);
            }
        }
    }

    _hydrateStructure(val, context) {
        if (!val || !val.isStructure) return val;
        
        const addrKey = this._getAddrKey(val);
        if (context.has(addrKey)) return context.get(addrKey);

        const T = constants.VAL_TYPE;

        if (val.type === T.DICTIONARY || val.type === T.OBJECT) {
            const dict = new Dictionary(this.db.allocator, val);
            const obj = {};
            context.set(addrKey, obj);
            this._hydrateDictionary(dict, obj, context);
            return obj;
        }
        
        if (val.type === T.MAP) {
            const block = this.db._readChainSafe(val);
            const isBTree = block && block.subarray(0, 4).toString() === constants.MAGIC_MAP_NODE;

            if (isBTree) {
                const mapEngine = new MapEngine(this.db.allocator, val);
                const map = new Map();
                context.set(addrKey, map);
                for (const item of mapEngine.range()) {
                    const k = keyEncoding.decode(item.key);
                    let v = item.value;
                    if (v && v.isStructure) v = this._hydrateStructure(v, context);
                    map.set(k, v);
                }
                return map;
            } else {
                const seq = new Sequence(this.db.allocator, val);
                const map = new Map();
                context.set(addrKey, map);
                const len = seq.length();
                for(let i=0; i<len; i++) {
                    const pair = seq.get(i); 
                    if (Array.isArray(pair) && pair.length === 2) {
                        let k = pair[0]; let v = pair[1];
                        if (v && v.isStructure) v = this._hydrateStructure(v, context);
                        map.set(k, v);
                    }
                }
                return map;
            }
        }

        if (val.type === T.SET) {
            const seq = new Sequence(this.db.allocator, val);
            const set = new Set();
            context.set(addrKey, set);
            for(let i=0; i<seq.length(); i++) {
                let item = seq.get(i);
                if (item && item.isStructure) item = this._hydrateStructure(item, context);
                set.add(item);
            }
            return set;
        }
        
        if (val.type === T.SEQUENCE || val.type === T.ARRAY) {
            const seq = new Sequence(this.db.allocator, val);
            const arr = [];
            context.set(addrKey, arr);
            const len = seq.length();
            const limit = Math.min(len, 20000); 
            for(let i=0; i<limit; i++) {
                let item = seq.get(i);
                if (item && item.isStructure) item = this._hydrateStructure(item, context);
                arr.push(item);
            }
            return arr;
        }
        return val;
    }

    _hydrateDictionary(dict, targetObj, context) {
        let count = 0;
        const keysIterator = dict.keys(); 
        for (const k of keysIterator) {
            if (count++ > 20000) break; 
            const val = dict.get(k); 
            if (val !== undefined) {
                 if (val && val.isStructure) {
                     targetObj[k] = this._hydrateStructure(val, context);
                 } else {
                     targetObj[k] = val;
                 }
            } else {
                targetObj[k] = undefined;
            }
        }
    }
};