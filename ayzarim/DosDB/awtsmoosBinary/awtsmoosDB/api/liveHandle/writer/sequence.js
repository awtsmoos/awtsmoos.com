
// B"H
/**
 * @file sequence.js
 * @class SequenceWriter
 * @description
 *  =============================================================================
 *  CHAPTER 18: THE HARMONY OF THE SEQUENCE (TIFERET)
 *  =============================================================================
 *  Manages the writing and splicing of sequential B-Trees.
 */

const constants = require('../../../constants.js');

class SequenceWriter {
    /**
     * @constructor
     * @param {Object} common - Shared writer tools.
     * @param {Object} builder - The architectural builder.
     */
    constructor(common, builder) {
        this.common = common;
        this.builder = builder;
        this.db = common.db;
        this.handle = common.handle;
    }

    /**
     * @method set
     * @description Replaces an existing element at a specific index.
     */
    set(key, value, options) {
        const structPtr = this.common.resolveStructPtr();
        const seq = this.common.getEngine(structPtr, constants.VAL_TYPE.SEQUENCE);
        const index = parseInt(key);
        if (isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        
        // B"H: The Tikkun. Verify the builder is present.
        if (!this.builder) throw new Error("B\"H Fatal: Sequence Builder is missing.");
        const valToSet = isPtr ? value : this.builder.build(value);
        
        const path = this.handle.getPath();
        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex = this.common.getVectorIndex(path);

        const len = seq.length();
        
        let oldPtr = null;
        let oldVal = null;
        
        if ((searchIndexed || vectorIndex) && index < len) {
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
        else if (this.db.sparseArrays) this.db.sparseArrays.setPtr(this.handle, index, valToSet);
        else throw new Error(`Index ${index} out of bounds`);
        
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
        
        if (searchIndexed) {
            this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
        }
        
        if (vectorIndex) {
            if (oldPtr) this.db.vector.delete(path, index);
            const vec = this.common.extractVector(value);
            if (vec) this.db.vector.insert(path, index, vec, valToSet);
        }
    }

    /**
     * @method push
     * @description Appends a value to the end of the sequence.
     */
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

    /**
     * @method splice
     * @description Modifies segments of the sequence tree.
     */
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
        
        const preparedItems = items.map(item => options.isPtr ? item : this.builder.build(item));
        
        const toRemove = []; 
        if (deleteCount > 0) {
            for (let i = 0; i < deleteCount; i++) {
                const idx = start + i;
                if (idx < seq.length()) {
                    const ptr = seq.getPtr(idx);
                    if (ptr) {
                        let val = null;
                        if ((isIndexed || vectorIndex) && this.handle.reader) {
                            try { val = this.handle.reader.slice(idx, idx + 1)[0]; } catch(e) {}
                        }
                        toRemove.push({ ptr, val, index: idx }); 
                    }
                }
            }
        }
        
        // B"H: MUST delete from indices BEFORE sequence mutation.
        for(const r of toRemove.reverse()) { 
            if (isIndexed) this.db.search.updateIndex(path, null, r.ptr, r.val, null); 
            if (!options.skipFree) {
                this.common.checkGraphCleanup(r.ptr);
                if (vectorIndex) this.db.vector.delete(path, r.index);
            }
        }

        seq.splice(start, deleteCount, ...preparedItems);
        this.common.checkAutoCompact(seq, constants.VAL_TYPE.SEQUENCE);
        
        // B"H: MUST add to indices AFTER sequence mutation.
        for(let i = 0; i < items.length; i++) {
            const newIndex = start + i;
            if (isIndexed) {
                if (!options.isPtr) this.db.search.updateIndex(path, preparedItems[i], null, null, items[i]); 
            }
            if (vectorIndex && !options.isPtr) {
                const vec = this.common.extractVector(items[i]);
                if (vec) this.db.vector.insert(path, newIndex, vec, preparedItems[i]); 
            }
        }
        
        return toRemove.map(r => r.val);
    }

    /**
     * @method delete
     * @description Exiles an element by its index.
     */
    delete(indexKey) {
        const index = parseInt(indexKey);
        if(isNaN(index)) return false;
        if (this.db.sparseArrays && this.db.sparseArrays.has(this.handle, index)) {
            return this.db.sparseArrays.delete(this.handle, index);
        }
        
        this.splice(index, 1);
        return true;
    }
}

module.exports = SequenceWriter;
