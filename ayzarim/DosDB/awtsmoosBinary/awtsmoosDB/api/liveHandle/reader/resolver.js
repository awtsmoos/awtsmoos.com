
// B"H
/**
 * @file resolver.js
 * @description
 *  =============================================================================
 *  CHAPTER 15: THE MASTER RESURRECTOR (TECHIYAS HAMEISIM)
 *  =============================================================================
 *  "The dead shall live, their bodies shall rise." (Isaiah 26:19)
 *  
 *  Re-architected into hyper-modular, extremely unhinged micro-files.
 *  There is no padding in the void. Only pure, fast VarInt pointers.
 */
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');
const HandleRegistry = require('../../../core/registry/handle.js');
const { hydrateStructure } = require('./resolver_core/hydrateStructure.js');
const classRegistry = require('../../../utils/smartPointer/registry.js');

function reviveCustomInstance(val) {
    if (!val || typeof val !== 'object' || !val.__className__ || !val.__source__) return val;

    const className = val.__className__;
    const classSource = val.__source__;
    let Species = classRegistry.get(className);

    if (!Species) {
        try {
            Species = (new Function(`return (${classSource});`))();
            if (Species) classRegistry.set(className, Species);
        } catch (_e) {
            return val;
        }
    }

    if (!Species || !Species.prototype) return val;

    const entity = Object.create(Species.prototype);
    for (const key of Object.keys(val)) {
        if (key === '__className__' || key === '__source__') continue;
        entity[key] = val[key];
    }
    return entity;
}

module.exports = class ReaderResolver {
    constructor(reader) { 
        this.reader = reader; 
        this.db = reader.db; 
        this.handle = reader.handle; 
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
                
                return reviveCustomInstance(hydrateStructure(structPtr, context, this.db));
            }
            
            const val = SmartPointer.resolve(this.handle.ptr, this.db.allocator, context);
            if (val && val.isStructure) return reviveCustomInstance(hydrateStructure(val, context, this.db));
            
            if (val && typeof val === 'object' && val.__className__) {
                for (const key in val) { 
                    const subVal = val[key]; 
                    if (subVal && subVal.isStructure) val[key] = hydrateStructure(subVal, context, this.db); 
                }
            }
            
            return reviveCustomInstance(val);
        });
    }
};
