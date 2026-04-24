
// B"H
/**
 * @file resolver.js
 * @description
 *  =============================================================================
 *  CHAPTER 15: THE MASTER RESURRECTOR (TECHIYAS HAMEISIM)
 *  =============================================================================
 *  "The dead shall live, their bodies shall rise." (Isaiah 26:19)
 *  
 *  Purged of all inline and chunked ghost logic. Pure VarInt exact-byte awakening.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js'); 
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const FlatObject = require('../../../structure/flat/object.js');
const FlatArray = require('../../../structure/flat/array.js');
const keyEncoding = require('../../../utils/keyEncoding.js');
const HandleRegistry = require('../../../core/registry/handle.js');

module.exports = class ReaderResolver {
    constructor(reader) { 
        this.reader = reader; 
        this.db = reader.db; 
        this.handle = reader.handle; 
    }
    
    _getAddrKey(ptr) { 
        if (!ptr) return "void"; 
        return `${ptr.offset || 0}:${ptr.length || 0}`; 
    }
    
    resolveStructPtr() { 
        if (this.handle.ptr) return SmartPointer.resolve(this.handle.ptr, this.db.allocator); 
        return null; 
    }
    
    resolveSelf() {
        return this.db.lock.runRead(() => {
            if (this.handle && typeof this.handle.ensureResolved === 'function') {
                this.handle.ensureResolved();
            }
            
            const isRoot = this.db.root ? (this.handle === HandleRegistry.getSoul(this.db.root)) : false;
            if (!this.handle.ptr && !isRoot) return undefined;
            
            const context = new Map(); 
            const T = constants.VAL_TYPE; 
            const type = this.handle.type;
            
            if (isRoot || type === T.DICTIONARY || type === T.OBJECT || type === T.SMART_OBJECT) {
                let structPtr = null;
                if (isRoot && this.db.rootPtrRaw) structPtr = SmartPointer.resolve(this.db.rootPtrRaw, this.db.allocator);
                else if (this.handle.ptr) structPtr = SmartPointer.resolve(this.handle.ptr, this.db.allocator);
                
                if (!structPtr) return {}; 
                const obj = {};
                if (structPtr) context.set(this._getAddrKey(structPtr), obj); 
                
                if (type === T.SMART_OBJECT) {
                    const flat = new FlatObject(this.db.allocator, structPtr);
                    for (const [k, val] of flat.entries(context)) {
                        obj[k] = (val && val.isStructure) ? this._hydrateStructure(val, context) : val;
                    }
                } else {
                    const dict = new Dictionary(this.db.allocator, structPtr); 
                    this._hydrateDictionary(dict, obj, context); 
                }
                return obj;
            }
            
            const val = SmartPointer.resolve(this.handle.ptr, this.db.allocator, context);
            if (val && val.isStructure) return this._hydrateStructure(val, context);
            if (val && typeof val === 'object' && val.__className__) this._hydrateObjectProperties(val, context);
            
            return val;
        });
    }
    
    _hydrateObjectProperties(obj, context) { 
        for (const key in obj) { 
            const val = obj[key]; 
            if (val && val.isStructure) obj[key] = this._hydrateStructure(val, context); 
        } 
    }
    
    _hydrateStructure(val, context) {
        if (!val || !val.isStructure) return val;
        const ctx = (context instanceof Map) ? context : new Map();
        const addrKey = this._getAddrKey(val); 
        
        if (ctx.has(addrKey)) return ctx.get(addrKey);
        
        const T = constants.VAL_TYPE;
        
        if (val.type === T.DICTIONARY || val.type === T.OBJECT || val.type === T.SMART_OBJECT) {
            const obj = {}; 
            ctx.set(addrKey, obj);
            if (val.type === T.SMART_OBJECT) {
                const flat = new FlatObject(this.db.allocator, val);
                for (const [k, v] of flat.entries(ctx)) {
                    obj[k] = (v && v.isStructure) ? this._hydrateStructure(v, ctx) : v;
                }
            } else {
                const dict = new Dictionary(this.db.allocator, val); 
                this._hydrateDictionary(dict, obj, ctx); 
            }
            return obj;
        }
        
        if (val.type === T.MAP || val.type === T.JS_MAP) {
            const mapEngine = new MapEngine(this.db.allocator, val); 
            const map = new Map(); 
            ctx.set(addrKey, map);
            
            for (const item of mapEngine.range()) {
                const rawKeyString = keyEncoding.decode(item.key); 
                const k = rawKeyString.replace(/\x00/g, ''); 
                
                let v = SmartPointer.resolve(item.ptr, this.db.allocator, ctx);
                if (v && v.isStructure) v = this._hydrateStructure(v, ctx);
                map.set(k, v);
            }
            return map;
        }
        
        if (val.type === T.SEQUENCE || val.type === T.ARRAY || val.type === T.SET || val.type === T.JS_SET || val.type === T.SMART_ARRAY) {
            const isSet = val.type === T.SET || val.type === T.JS_SET;
            const collection = isSet ? new Set() : []; 
            ctx.set(addrKey, collection);
            
            if (val.type === T.SMART_ARRAY) {
                const arr = new FlatArray(this.db.allocator, val);
                const len = arr.length();
                for(let i = 0; i < len; i++) {
                    let item = SmartPointer.resolve(arr.get(i), this.db.allocator, ctx);
                    if (item && item.isStructure) item = this._hydrateStructure(item, ctx);
                    if (isSet) collection.add(item); else collection.push(item);
                }
            } else {
                const seq = new Sequence(this.db.allocator, val); 
                const len = seq.length(); 
                const limit = Math.min(len, 20000); 
                for(let i = 0; i < limit; i++) {
                    let item = seq.get(i, ctx); 
                    if (item && item.isStructure) item = this._hydrateStructure(item, ctx);
                    if (isSet) collection.add(item); else collection.push(item);
                }
            }
            return collection;
        }
        return val;
    }
    
    _hydrateDictionary(dict, targetObj, context) {
        let count = 0; 
        for (const k of dict.keys()) {
            if (count++ > 20000) break; 
            const val = dict.get(k, context); 
            targetObj[k] = (val && val.isStructure) ? this._hydrateStructure(val, context) : val;
        }
    }
};
