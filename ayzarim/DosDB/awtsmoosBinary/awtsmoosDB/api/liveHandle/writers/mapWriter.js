


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

    async set(key, value, options) {
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        const valToSet = isPtr ? value : await this.builder.build(value);
        const encodedKey = keyEncoding.encode(key);
        
        const path = this.handle.getPath();
        
        // B"H: Use common helper to skip system paths
        const searchIndexed = await this.common.getSearchIndex(path);
        const vectorIndex = await this.common.getVectorIndex(path);

        const structPtr = await this.common.resolveStructPtr();

        if (this.handle.type === constants.TYPE_MAP) {
            const map = await this.common.getEngine(structPtr, constants.TYPE_MAP);
            
            let oldPtr = null;
            let oldVal = null;
            
            if (searchIndexed) {
                try {
                    oldPtr = await map.getPtr(encodedKey);
                    if (oldPtr) {
                        // Ideally hydrate fully if searching needs content diff
                        const temp = await SmartPointer.resolve(oldPtr, this.db.allocator);
                        oldVal = temp; 
                    }
                } catch(e) {}
            }

            await map.set(encodedKey, valToSet, { isPtr: true, skipFree });
            await this.common.checkAutoCompact(map, constants.TYPE_MAP);
            
            if (searchIndexed) {
                try {
                    await this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
                } catch(e) {}
            }

            if (vectorIndex) {
                const vec = this.common.extractVector(value);
                if (vec) await this.db.vector.insert(path, key, vec, valToSet);
            }
            return;
        }

        const dict = await this.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
        await dict.set(encodedKey, valToSet, { isPtr: true, skipFree });
        // B"H: FIX - Ensure Dictionary pointer updates propagate (Critical for Root resizing)
        await this.common.checkAutoCompact(dict, constants.TYPE_DICTIONARY);
    }

    async delete(key) {
        const encodedKey = keyEncoding.encode(key);
        const structPtr = await this.common.resolveStructPtr();
        
        const path = this.handle.getPath();
        const vectorIndex = await this.common.getVectorIndex(path);
        const searchIndexed = await this.common.getSearchIndex(path);

        if (this.handle.type === constants.TYPE_DICTIONARY) {
            const dict = await this.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
            const res = await dict.delete(encodedKey);
            // B"H: FIX - Update pointer if dictionary moved/shrank
            await this.common.checkAutoCompact(dict, constants.TYPE_DICTIONARY);
            return res;
        }
        
        if (this.handle.type === constants.TYPE_MAP) {
            const map = await this.common.getEngine(structPtr, constants.TYPE_MAP);
            const res = await map.delete(encodedKey);
            
            if (res.success && res.deletedPtr) {
                if (searchIndexed) {
                    try {
                        const temp = await SmartPointer.resolve(res.deletedPtr, this.db.allocator);
                        await this.db.search.updateIndex(path, null, res.deletedPtr, temp, null);
                    } catch(e) {}
                }
                
                await this.common.checkGraphCleanup(res.deletedPtr);
                
                if (vectorIndex) await this.db.vector.delete(path, key);
                
                await this.db.allocator.free(res.deletedPtr);
            }
            
            await this.common.checkAutoCompact(map, constants.TYPE_MAP);
            return res.success;
        }
    }

    async createStructure(key, type) {
        const structPtr = await this.common.resolveStructPtr();
        if (!structPtr) {
             throw new Error(`B"H: Cannot create '${key}' because parent '${this.handle.getPath()}' is not resolved (ptr is null).`);
        }

        let newPtr;
        
        if (type === 'map') {
            const map = new (require('../../../structure/map/index.js'))(this.db.allocator);
            newPtr = await map.create();
        } else {
            const dict = new (require('../../../structure/dictionary/index.js'))(this.db.allocator);
            newPtr = await dict.create();
        }

        const encodedKey = keyEncoding.encode(key);
        
        if (this.handle.type === constants.TYPE_MAP) {
            const mapEngine = await this.common.getEngine(structPtr, constants.TYPE_MAP);
            await mapEngine.set(encodedKey, newPtr, { isPtr: true });
            await this.common.checkAutoCompact(mapEngine, constants.TYPE_MAP);
        } else {
            const dictEngine = await this.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
            await dictEngine.set(encodedKey, newPtr, { isPtr: true });
            // B"H: FIX - Update pointer for dictionary
            await this.common.checkAutoCompact(dictEngine, constants.TYPE_DICTIONARY);
        }
    }
}

module.exports = MapWriter;