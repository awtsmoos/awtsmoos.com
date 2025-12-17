
// B"H
const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');

class SequenceWriter {
    constructor(common, builder) {
        this.common = common;
        this.builder = builder;
        this.db = common.db;
        this.handle = common.handle;
    }

    async set(key, value, options) {
        const structPtr = await this.common.resolveStructPtr();
        const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
        const index = parseInt(key);
        if (isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        
        const valToSet = isPtr ? value : await this.builder.build(value);
        const path = this.handle.getPath();
        const searchIndexed = await this.db.search.isIndexed(path);
        const vectorIndex = await this.db.vector.getIndex(path);

        const len = await seq.length();
        
        let oldPtr = null;
        let oldVal = null;
        
        if (searchIndexed && index < len) {
            try {
                oldPtr = await seq.getPtr(index);
                if (oldPtr) oldVal = await this.handle.reader.getItem(index);
            } catch(e) {
                if(this.db.debug) console.warn("B\"H SequenceWriter: Error retrieving old value for index", e);
            }
        }

        if (index === len) await seq.push(valToSet);
        else if (index < len) await seq.set(index, valToSet, { skipFree });
        else throw new Error(`Index ${index} out of bounds`);
        
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
        
        if (searchIndexed) {
            try {
                if (index < len) await this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
                else await this.db.search.updateIndex(path, valToSet, null, null, value);
            } catch(e) {
                console.error(`B"H SequenceWriter: Search Index Update Failed for ${path}:`, e);
            }
        }
        
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) await this.db.vector.insert(path, index, vec, valToSet);
        }
    }

    async push(value, options = {}) {
        const structPtr = await this.common.resolveStructPtr();
        // B"H: Use cached engine to preserve append optimization
        const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const valToPush = isPtr ? value : await this.builder.build(value);
        const currentLen = await seq.length();
        
        const path = this.handle.getPath();
        const isIndexed = await this.db.search.isIndexed(path);
        const vectorIndex = await this.db.vector.getIndex(path);

        await seq.push(valToPush);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);

        if (isIndexed) {
            try {
                // B"H: Pass raw value for token extraction, valToPush (pointer) for storage
                await this.db.search.updateIndex(path, valToPush, null, null, value);
            } catch(e) {
                console.error(`B"H SequenceWriter: Push Index Update Failed for ${path}:`, e);
            }
        }
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) await this.db.vector.insert(path, currentLen, vec, valToPush);
        }
        
        // B"H: Return new length
        return currentLen + 1;
    }

    async splice(start, deleteCount, ...args) {
        this.common.invalidateEngine(); // Splice invalidates simple append cache
        
        let options = {};
        let items = args;
        
        // B"H: Enhanced Option Detection
        if (args.length > 0) {
            const last = args[args.length - 1];
            if (last && typeof last === 'object' && last._isAwtsmoosOptions) {
                options = last;
                items = args.slice(0, -1);
            }
        }

        const path = this.handle.getPath();
        const structPtr = await this.common.resolveStructPtr();
        const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
        const isIndexed = await this.db.search.isIndexed(path);
        const vectorIndex = await this.db.vector.getIndex(path);
        
        const preparedItems = [];
        for(const item of items) preparedItems.push(await this.builder.build(item));
        
        const toRemove = []; 
        
        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++) {
                const idx = start + i;
                const ptr = await seq.getPtr(idx);
                if (ptr) {
                    // B"H: ALWAYS fetch val for return, not just if indexed
                    let val = null;
                    try { val = await this.handle.reader.getItem(idx); } catch(e) {}
                    toRemove.push({ ptr, val });
                }
            }
        }

        let removeIdx = 0;
        for(const r of toRemove) {
            if (isIndexed) {
                try {
                    await this.db.search.updateIndex(path, null, r.ptr, r.val, null);
                } catch(e) {}
            }
            if (!options.skipFree) {
                await this.common.checkGraphCleanup(r.ptr);
                if (vectorIndex) await this.db.vector.delete(path, start + removeIdx);
            }
            removeIdx++;
        }

        await seq.ops.splice(start, deleteCount, preparedItems, options);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
        
        if (isIndexed) {
            for(let i = 0; i < items.length; i++) {
                const newVal = items[i];
                const newPtr = preparedItems[i];
                try {
                    await this.db.search.updateIndex(path, newPtr, null, null, newVal);
                } catch(e) {
                    console.error("B\"H SequenceWriter: Splice Index Update Failed:", e);
                }
            }
        }

        if (vectorIndex) {
            for(let i = 0; i < items.length; i++) {
                const val = items[i];
                const vec = this.common.extractVector(val);
                if (vec) {
                    const ptr = preparedItems[i]; 
                    try {
                        await this.db.vector.insert(path, start + i, vec, ptr);
                    } catch(e) {}
                }
            }
        }
        
        // B"H: Return removed items
        return toRemove.map(r => r.val);
    }

    async delete(indexKey) {
        const index = parseInt(indexKey);
        if(isNaN(index)) return false;
        
        const structPtr = await this.common.resolveStructPtr();
        const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
        const path = this.handle.getPath();
        const searchIndexed = await this.db.search.isIndexed(path);
        const vectorIndex = await this.db.vector.getIndex(path);

        const oldPtr = await seq.getPtr(index);
        
        if (searchIndexed && oldPtr) {
            try {
                const oldVal = await this.handle.reader.getItem(index);
                await this.db.search.updateIndex(path, null, oldPtr, oldVal, null);
            } catch(e) {
                 console.error("B\"H SequenceWriter: Delete Index Update Failed:", e);
            }
        }
        
        if (oldPtr) {
            await this.common.checkGraphCleanup(oldPtr);
            if (vectorIndex) await this.db.vector.delete(path, index);
        }
        
        await seq.splice(index, 1);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
        return true;
    }

    async createStructureInList(indexKey, type) {
        const index = parseInt(indexKey);
        const structPtr = await this.common.resolveStructPtr();
        
        let newPtr;
        if (type === 'map') {
            const map = new (require('../../../structure/map/index.js'))(this.db.allocator);
            newPtr = await map.create();
        } else {
            const dict = new (require('../../../structure/dictionary/index.js'))(this.db.allocator);
            newPtr = await dict.create();
        }

        const seq = await this.common.getEngine(structPtr, constants.TYPE_SEQUENCE);
        const len = await seq.length();
        if (index === len) await seq.push(newPtr);
        else await seq.splice(index, 1, newPtr);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
    }
}

module.exports = SequenceWriter;
