
// B"H
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const tokenizer = require('./tokenizer.js');
const constants = require('../../constants.js');
const LiveHandle = require('../liveHandle/index.js');

class SearchIndexer {
    constructor(db, sysIndex) {
        this.db = db;
        this.sysIndex = sysIndex;
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        // B"H: Unwrap Proxy to use internal Navigator directly. Faster and safer.
        const sysIndexInt = this.sysIndex[constants.SYMBOLS.INTERNALS] || this.sysIndex;
        // Get the handle for the specific path (e.g. "root.library") map
        const indexMap = sysIndexInt.nav.navigate(path);
        
        // Ensure indexMap pointer is loaded
        await indexMap.ensureResolved(true); 
        
        // If indexMap pointer is null, it means the map for 'path' inside '__sys_search__' doesn't exist yet.
        if (!indexMap.ptr) {
             if (this.db.debug) console.warn(`B"H Indexer: Index map for ${path} missing. Attempting self-heal.`);
             // Use writer to create map
             await sysIndexInt.writer.createMap(path);
             await indexMap.ensureResolved(true); // Retry
        }
        
        // B"H: Force type update if resolved but type missing (paranoid check)
        const indexMapInt = indexMap[constants.SYMBOLS.INTERNALS] || indexMap;
        if (indexMapInt.ptr && !indexMapInt.type) {
             const decoded = SmartPointer.decode(indexMapInt.ptr);
             if (decoded) indexMapInt.type = decoded.type;
        }

        let oldTokens, newTokens;
        try {
            oldTokens = this._extractTokens(oldVal);
        } catch(e) {
            oldTokens = new Set();
            if (this.db.debug) console.warn("B\"H Indexer extract tokens error (old): " + e.message);
        }
        
        try {
            newTokens = this._extractTokens(newVal);
        } catch(e) {
            newTokens = new Set();
            if (this.db.debug) console.warn("B\"H Indexer extract tokens error (new): " + e.message);
        }

        if (this.db.debug) {
            console.log(`B"H Indexer [${path}]:`);
            console.log(`   OldTokens: [${Array.from(oldTokens).join(', ')}]`);
            console.log(`   NewTokens: [${Array.from(newTokens).join(', ')}]`);
            console.log(`   PointerChanged: ${!this._ptrsEqual(newPtr, oldPtr)}`);
        }

        if (oldPtr) {
            const tokensToRemove = this._ptrsEqual(newPtr, oldPtr) 
                ? [...oldTokens].filter(x => !newTokens.has(x))
                : oldTokens;
            
            if (this.db.debug) console.log(`   Adding ptr to tokens: ${JSON.stringify([...tokensToRemove])}`);
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
        // Unwrap handle
        const handle = indexMap[constants.SYMBOLS.INTERNALS] || indexMap;

        // B"H: Sequential execution to prevent B-Tree corruption
        for (const word of tokens) {
            try {
                // Use Navigator to find key directly without creating intermediate handles
                const resolved = await handle.nav.resolveKey(word);
                
                if (resolved && resolved.ptr) {
                    const res = await SmartPointer.resolve(resolved.ptr, this.db.allocator);
                    const seq = new Sequence(this.db.allocator, res);
                    const len = await seq.length();
                    
                    let foundIndex = -1;
                    // Linear scan ok for now; optimizations possible later
                    for (let i = 0; i < len; i++) {
                        const p = await seq.getPtr(i);
                        if (this._ptrsEqual(p, ptr)) {
                            foundIndex = i;
                            break;
                        }
                    }
                    if (foundIndex !== -1) {
                        if (this.db.debug) console.log(`     Removed from '${word}' at index ${foundIndex}`);
                        
                        // Create temporary handle for splice
                        const listHandle = new LiveHandle(this.db, resolved.ptr, resolved.type, { parent: handle, key: word });
                        // Unwrap
                        const listWriter = listHandle[constants.SYMBOLS.INTERNALS].writer;
                        
                        // B"H: CRITICAL FIX - Pass { skipFree: true }
                        await listWriter.splice(foundIndex, 1, { skipFree: true, _isAwtsmoosOptions: true });
                    }
                }
            } catch(e) {
                console.error("B\"H Indexer Remove Error:", e);
            }
        }
    }

    async _addToIndex(indexMap, tokens, ptr) {
        // Unwrap handle to access internal writer
        const handle = indexMap[constants.SYMBOLS.INTERNALS] || indexMap;

        // B"H: Sequential execution to prevent B-Tree corruption
        for (const word of tokens) {
            try {
                // B"H: First, try to resolve the key to see if it exists.
                const resolved = await handle.nav.resolveKey(word);
                
                if (!resolved) {
                    if (this.db.debug) console.log(`     Creating new WEAK list for '${word}'`);
                    
                    // B"H: OPTIMIZATION - Create and populate Sequence directly via Engine
                    const seq = new Sequence(this.db.allocator);
                    await seq.create({ isWeak: true });
                    
                    // Push the item pointer directly to the engine
                    await seq.push(ptr);
                    
                    // Get the final pointer of the sequence
                    const seqPtrBuf = SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
                    
                    // Set directly using writer (Bypasses Proxy Apply Trap)
                    await handle.writer.set(word, seqPtrBuf, { isPtr: true, skipFree: true });
                    
                } else {
                    if (this.db.debug) console.log(`     Pushing ptr to '${word}'`);
                    
                    // List exists, append to it.
                    // We construct a temporary internal handle to use SequenceWriter logic
                    const listHandle = new LiveHandle(this.db, resolved.ptr, resolved.type, { parent: handle, key: word });
                    
                    // B"H: CRITICAL FIX - Unwrap proxy to avoid 'undefined function' on push
                    const listWriter = listHandle[constants.SYMBOLS.INTERNALS].writer;
                    
                    await listWriter.push(ptr, { isPtr: true });
                }
            } catch(e) {
                console.error("B\"H Indexer Add Error:", e);
            }
        }
    }

    _extractTokens(val) {
        const parts = [];
        const stack = [val];
        
        while (stack.length > 0) {
            const curr = stack.pop();
            
            if (curr === null || curr === undefined) continue;
            
            if (typeof curr === 'string') {
                parts.push(curr);
            } 
            else if (typeof curr === 'number') {
                parts.push(String(curr)); 
            } 
            else if (typeof curr === 'object') {
                if (Buffer.isBuffer(curr)) continue;
                if (curr instanceof Date) continue; 
                if (curr instanceof RegExp) continue;
                if (ArrayBuffer.isView(curr)) continue;

                if (Array.isArray(curr)) {
                    for (let i = curr.length - 1; i >= 0; i--) stack.push(curr[i]);
                } else {
                    const keys = Object.keys(curr);
                    for (let i = keys.length - 1; i >= 0; i--) {
                        stack.push(curr[keys[i]]);
                    }
                }
            }
        }
        
        const text = parts.join(" ");
        return tokenizer.tokenize(text);
    }

    _ptrsEqual(p1, p2) {
        if (!p1 || !p2) return false;
        return p1.compare(p2) === 0;
    }
}
module.exports = SearchIndexer;
