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
            } catch(e) {}
        }

        // B"H: If this is a bubbling update and the pointer is identical, 
        // we skip the sequence modification but STILL bubble the spark to ensure parent invalidation.
        if (isPtr && index < len) {
            const currentPtr = await seq.getPtr(index);
            if (currentPtr && currentPtr.compare(valToSet) === 0) {
                 await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
                 return;
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
            } catch(e) {}
        }
        
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) await this.db.vector.insert(path, index, vec, valToSet);
        }
    }

    async push(value, options = {}) {
        const structPtr = await this.common.resolveStructPtr();
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
            try { await this.db.search.updateIndex(path, valToPush, null, null, value); } catch(e) {}
        }
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) await this.db.vector.insert(path, currentLen, vec, valToPush);
        }
        
        return currentLen + 1;
    }

    async splice(start, deleteCount, ...args) {
        this.common.invalidateEngine(); 
        
        let options = {};
        let items = args;
        
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
        const isPtr = options.isPtr || false; 

        for(const item of items) {
            if (isPtr && Buffer.isBuffer(item)) preparedItems.push(item);
            else preparedItems.push(await this.builder.build(item));
        }
        
        const toRemove = []; 
        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++) {
                const idx = start + i;
                const ptr = await seq.getPtr(idx);
                if (ptr) {
                    let val = null;
                    try { val = await this.handle.reader.getItem(idx); } catch(e) {}
                    toRemove.push({ ptr, val });
                }
            }
        }

        for(const r of toRemove) {
            if (isIndexed) try { await this.db.search.updateIndex(path, null, r.ptr, r.val, null); } catch(e) {}
            if (!options.skipFree) {
                await this.common.checkGraphCleanup(r.ptr);
                if (vectorIndex) await this.db.vector.delete(path, start);
            }
        }

        await seq.splice(start, deleteCount, ...preparedItems);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
        
        if (isIndexed) {
            for(let i = 0; i < items.length; i++) {
                if (!isPtr) try { await this.db.search.updateIndex(path, preparedItems[i], null, null, items[i]); } catch(e) {}
            }
        }

        if (vectorIndex && !isPtr) {
            for(let i = 0; i < items.length; i++) {
                const vec = this.common.extractVector(items[i]);
                if (vec) try { await this.db.vector.insert(path, start + i, vec, preparedItems[i]); } catch(e) {}
            }
        }
        
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
            } catch(e) {}
        }
        
        if (oldPtr) {
            await this.common.checkGraphCleanup(oldPtr);
            if (vectorIndex) await this.db.vector.delete(path, index);
        }
        
        await seq.splice(index, 1);
        await this.common.checkAutoCompact(seq, constants.TYPE_SEQUENCE);
        return true;
    }
}

module.exports = SequenceWriter;