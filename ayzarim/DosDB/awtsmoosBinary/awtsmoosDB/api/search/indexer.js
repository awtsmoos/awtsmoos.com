
// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const tokenizer = require('./tokenizer.js');

class SearchIndexer {
    constructor(db, sysIndex) {
        this.db = db;
        this.sysIndex = sysIndex;
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        // console.log(`B"H Indexer.updateIndex [${path}]...`);
        // B"H: Refresh indexMap handle to ensure it points to the latest structure
        const indexMap = this.sysIndex.get(path);
        await indexMap.ensureResolved(); 
        
        const oldTokens = this._extractTokens(oldVal);
        const newTokens = this._extractTokens(newVal);

        if (this.db.debug) {
            console.log(`B"H Indexer [${path}]:`);
            console.log(`   OldTokens: [${Array.from(oldTokens).join(', ')}]`);
            console.log(`   NewTokens: [${Array.from(newTokens).join(', ')}]`);
            console.log(`   PointerChanged: ${!this._ptrsEqual(newPtr, oldPtr)}`);
        }

        // B"H: If pointers differ, we MUST do a full swap (remove old, add new).
        // Optimization for same-pointer (content-only change) logic is risky if not handled perfectly.
        // We prioritize correctness: treating as remove-then-add.
        
        if (oldPtr) {
            // If pointer changed, remove from ALL old tokens (even if shared), 
            // because the old pointer is likely invalid/freed.
            // If pointer is same, we only remove from tokens that are NO LONGER present.
            const tokensToRemove = this._ptrsEqual(newPtr, oldPtr) 
                ? [...oldTokens].filter(x => !newTokens.has(x))
                : oldTokens;
            
            if (this.db.debug) console.log(`   Removing ptr from tokens: ${JSON.stringify([...tokensToRemove])}`);
            await this._removeFromIndex(indexMap, tokensToRemove, oldPtr);
        }

        if (newPtr) {
            const tokensToAdd = this._ptrsEqual(newPtr, oldPtr)
                ? [...newTokens].filter(x => !oldTokens.has(x))
                : newTokens;

            if (this.db.debug) console.log(`   Adding ptr to tokens: ${JSON.stringify([...tokensToAdd])}`);
            await this._addToIndex(indexMap, tokensToAdd, newPtr);
        }
    }

    async _removeFromIndex(indexMap, tokens, ptr) {
        for (const word of tokens) {
            const listHandle = indexMap.get(word);
            await listHandle.ensureResolved();
            
            if (listHandle.ptr) {
                // Resolve the list to find the index of the pointer to remove
                const res = await SmartPointer.resolve(listHandle.ptr, this.db.allocator);
                const seq = new Sequence(this.db.allocator, res);
                const len = await seq.length();
                
                // Search backwards to safely remove (though unique ptrs usually exist once per doc)
                for (let i = len - 1; i >= 0; i--) {
                    const valPtr = await seq.getPtr(i);
                    if (this._ptrsEqual(valPtr, ptr)) {
                        // B"H: Use LiveHandle splice to update the chain
                        if (this.db.debug) console.log(`     Removed from '${word}' at index ${i}`);
                        await listHandle.splice(i, 1);
                        // We assume one entry per document per word
                        break; 
                    }
                }
            }
        }
    }

    async _addToIndex(indexMap, tokens, ptr) {
        const ptrCopy = Buffer.alloc(16);
        ptr.copy(ptrCopy);

        for (const word of tokens) {
            // B"H: Critical - Ensure we get a fresh handle for the word list
            let list = indexMap.get(word);
            await list.ensureResolved();
            
            if (!list.ptr) {
                if (this.db.debug) console.log(`     Creating new list for '${word}'`);
                await indexMap.createList(word);
                // Re-acquire list handle after creation to ensure it has the pointer
                list = indexMap.get(word);
                await list.ensureResolved();
            }
            
            // Push the 16-byte Buffer as a Value
            if (this.db.debug) console.log(`     Pushing ptr to '${word}'`);
            await list.push(ptrCopy, { isPtr: true });
        }
    }

    _extractTokens(val, set = new Set(), visited = new Set()) {
        if (!val) return set;
        if (typeof val === 'object' && val !== null) {
            if (visited.has(val)) return set;
            visited.add(val);
        }

        if (typeof val === 'string') {
            const tokens = tokenizer.tokenize(val);
            tokens.forEach(t => set.add(t));
        } else if (typeof val === 'object') {
            for (const key in val) {
                // Recursively extract
                this._extractTokens(val[key], set, visited);
            }
        }
        return set;
    }

    _ptrsEqual(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) return a.equals(b);
        return false;
    }
}

module.exports = SearchIndexer;
