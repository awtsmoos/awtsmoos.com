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

    set(key, value, options) {
        const structPtr = this.common.resolveStructPtr();
        const seq = this.common.getEngine(structPtr, constants.VAL_TYPE.SEQUENCE);
        const index = parseInt(key);
        if (isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        
        const valToSet = isPtr ? value : this.builder.build(value);
        const path = this.handle.getPath();
        
        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);

        const len = seq.length();
        
        let oldPtr = null;
        let oldVal = null;
        
        if (searchIndexed && index < len) {
            try {
                oldPtr = seq.getPtr(index);
                if (oldPtr && this.handle.reader) oldVal = this.handle.reader.slice(index, index + 1)[0]; 
            } catch(e) {}
        }

        if (isPtr && index < len) {
            const currentPtr = seq.getPtr(index);
            if (currentPtr && Buffer.compare(currentPtr, valToSet) === 0) {
                 this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
                 return;
            }
        }

        if (index === len) seq.push(valToSet);
        else if (index < len) seq.set(index, valToSet, { skipFree });
        else throw new Error(`Index ${index} out of bounds`);
        
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
        
        if (searchIndexed) {
            this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
        }
        
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) this.db.vector.insert(path, index, vec, valToSet);
        }
    }

    push(value, options = {}) {
        const structPtr = this.common.resolveStructPtr();
        const seq = this.common.getEngine(structPtr, constants.VAL_TYPE.SEQUENCE);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const valToPush = isPtr ? value : this.builder.build(value);
        const currentLen = seq.length();
        
        const path = this.handle.getPath();
        const isIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);

        seq.push(valToPush);
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);

        if (isIndexed) {
            this.db.search.updateIndex(path, valToPush, null, null, value); 
        }
        if (vectorIndex) {
            const vec = this.common.extractVector(value);
            if (vec) this.db.vector.insert(path, currentLen, vec, valToPush);
        }
        
        return currentLen + 1;
    }

    splice(start, deleteCount, ...args) {
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
        const structPtr = this.common.resolveStructPtr();
        const seq = this.common.getEngine(structPtr, constants.VAL_TYPE.SEQUENCE);
        const isIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);
        
        const preparedItems = [];
        const isPtr = options.isPtr || false; 

        for(const item of items) {
            if (isPtr && Buffer.isBuffer(item)) preparedItems.push(item);
            else preparedItems.push(this.builder.build(item));
        }
        
        const toRemove = []; 
        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++) {
                const idx = start + i;
                const ptr = seq.getPtr(idx);
                // B"H: If removing complex item, attempt to load value for index update
                if (ptr) {
                    let val = null;
                    if (isIndexed && this.handle.reader) {
                        try { val = this.handle.reader.slice(idx, idx + 1)[0]; } catch(e) {}
                    }
                    toRemove.push({ ptr, val }); 
                }
            }
        }

        for(const r of toRemove) {
            if (isIndexed) this.db.search.updateIndex(path, null, r.ptr, r.val, null); 
            if (!options.skipFree) {
                this.common.checkGraphCleanup(r.ptr);
                if (vectorIndex) this.db.vector.delete(path, start);
            }
        }

        seq.splice(start, deleteCount, ...preparedItems);
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
        
        if (isIndexed) {
            for(let i = 0; i < items.length; i++) {
                if (!isPtr) this.db.search.updateIndex(path, preparedItems[i], null, null, items[i]); 
            }
        }

        if (vectorIndex && !isPtr) {
            for(let i = 0; i < items.length; i++) {
                const vec = this.common.extractVector(items[i]);
                if (vec) this.db.vector.insert(path, start + i, vec, preparedItems[i]); 
            }
        }
        
        // B"H: Fix - Return value pointers or resolved values depending on request context.
        // Current impl returns value, which matches Array.splice spec.
        return toRemove.map(r => r.val);
    }

    delete(indexKey) {
        const index = parseInt(indexKey);
        if(isNaN(index)) return false;
        
        const structPtr = this.common.resolveStructPtr();
        const seq = this.common.getEngine(structPtr, constants.VAL_TYPE.SEQUENCE);
        const path = this.handle.getPath();
        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);

        const oldPtr = seq.getPtr(index);
        let oldVal = null;

        if (searchIndexed && oldPtr) {
             if (this.handle.reader) {
                 try { oldVal = this.handle.reader.slice(index, index + 1)[0]; } catch(e) {}
             }
             this.db.search.updateIndex(path, null, oldPtr, oldVal, null);
        }
        
        if (oldPtr) {
            this.common.checkGraphCleanup(oldPtr);
            if (vectorIndex) this.db.vector.delete(path, index);
        }
        
        seq.splice(index, 1);
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
        return true;
    }
}

module.exports = SequenceWriter;