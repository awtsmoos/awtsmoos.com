// B"H
const constants = require('../../../constants.js');
const keyEncoding = require('../../../utils/keyEncoding.js');
const SmartPointer = require('../../../utils/smartPointer.js');

class MapWriter {
    constructor(common, builder) {
        this.common = common;
        this.builder = builder;
        this.db = common.db;
        this.handle = common.handle;
    }

    set(key, value, options) {
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        
        const valToSet = isPtr ? value : this.builder.build(value);
        
        const encodedKey = keyEncoding.encode(key);
        const structPtr = this.common.resolveStructPtr();
        
        // Use VAL_TYPE to ensure consistency regardless of constant structure
        const T = constants.VAL_TYPE;

        if (this.handle.type === T.MAP) {
            const map = this.common.getEngine(structPtr, T.MAP);
            if (!map) throw new Error("B\"H Fatal: Could not create Map Engine");
            
            if (!structPtr) map.create();
            
            map.set(encodedKey, valToSet, { isPtr: true, skipFree });
            this.common.checkAutoCompact(map, T.MAP);
        } else {
            // Default to Dictionary for Object/Dictionary/Etc
            const dict = this.common.getEngine(structPtr, T.DICTIONARY);
            if (!dict) throw new Error("B\"H Fatal: Could not create Dictionary Engine. Type ID: " + this.handle.type);
            
            if (!structPtr) dict.create();
            
            dict.set(encodedKey, valToSet, { isPtr: true, skipFree });
            this.common.checkAutoCompact(dict, T.DICTIONARY);
        }
    }
    
    delete(key) {
        const encodedKey = keyEncoding.encode(key);
        const structPtr = this.common.resolveStructPtr();
        if (!structPtr) return false;
        const T = constants.VAL_TYPE;

        if (this.handle.type === T.DICTIONARY || this.handle.type === T.OBJECT) {
            const dict = this.common.getEngine(structPtr, T.DICTIONARY);
            const res = dict.delete(encodedKey);
            this.common.checkAutoCompact(dict, T.DICTIONARY);
            return res;
        } else {
            const map = this.common.getEngine(structPtr, T.MAP);
            const res = map.delete(encodedKey);
            this.common.checkAutoCompact(map, T.MAP);
            return res.success;
        }
    }
}
module.exports = MapWriter;