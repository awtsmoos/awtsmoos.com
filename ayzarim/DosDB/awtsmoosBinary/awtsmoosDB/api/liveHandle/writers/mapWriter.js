
// B"H
const constants = require('../../../constants.js');
const keyEncoding = require('../../../utils/keyEncoding.js');
const SmartPointer = require('../../../utils/smartPointer.js');

/**
 * @class MapWriter
 * @description
 *  The Scribe of the B-Tree and Dictionary vessels.
 *  Handles the manifestation of key-value pairs and structure growth.
 */
class MapWriter {
    constructor(common, builder) {
        this.common = common;
        this.builder = builder;
        this.db = common.db;
        this.handle = common.handle;
    }

    /**
     * @description Sets a key-value pair in a Map or Dictionary.
     */
    async set(key, value, options) {
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        const valToSet = isPtr ? value : await this.builder.build(value);
        const encodedKey = keyEncoding.encode(key);
        
        const path = this.handle.getPath();
        
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
                        oldVal = await SmartPointer.resolve(oldPtr, this.db.allocator);
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

        // B"H: Dictionary Path
        const dict = await this.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
        await dict.set(encodedKey, valToSet, { isPtr: true, skipFree });
        
        // B"H: CRITICAL - Always trigger bubbling to propagate changes up the fractal tree
        await this.common.checkAutoCompact(dict, constants.TYPE_DICTIONARY);
    }

    /**
     * @description Removes a key from the vessel.
     */
    async delete(key) {
        const encodedKey = keyEncoding.encode(key);
        const structPtr = await this.common.resolveStructPtr();
        
        const path = this.handle.getPath();
        const vectorIndex = await this.common.getVectorIndex(path);
        const searchIndexed = await this.common.getSearchIndex(path);

        if (this.handle.type === constants.TYPE_DICTIONARY) {
            const dict = await this.common.getEngine(structPtr, constants.TYPE_DICTIONARY);
            const res = await dict.delete(encodedKey);
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
        return false;
    }

    /**
     * @description Creates a nested structure (Map or Dictionary) at the specified key.
     */
    async createStructure(key, type) {
        const structPtr = await this.common.resolveStructPtr();
        if (!structPtr) {
             throw new Error(`B"H Fatal: Cannot create structure at '${key}' - unresolved parent.`);
        }

        let newPtr;
        let finalType;
        if (type === 'map') {
            const map = new (require('../../../structure/map/index.js'))(this.db.allocator);
            newPtr = await map.create();
            finalType = constants.TYPE_MAP;
        } else {
            const dict = new (require('../../../structure/dictionary/index.js'))(this.db.allocator);
            newPtr = await dict.create();
            finalType = constants.TYPE_DICTIONARY;
        }

        await this.set(key, newPtr, { isPtr: true });
        return this.handle[key];
    }
}

module.exports = MapWriter;
