


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
        // B"H: Double-Buffering
        // activeBuffers accumulates new ops.
        this.activeBuffers = new Map();
        
        this.BUFFER_LIMIT = 5000; 
        this.opsCount = 0;
        
        // Serialize flushes
        this._flushQueue = Promise.resolve();
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        let oldTokens, newTokens;
        
        try { oldTokens = this._extractTokens(oldVal); } 
        catch(e) { oldTokens = new Set(); }
        
        try { newTokens = this._extractTokens(newVal); } 
        catch(e) { newTokens = new Set(); }

        if (this._ptrsEqual(newPtr, oldPtr)) {
            const toAdd = [...newTokens].filter(x => !oldTokens.has(x));
            const toRemove = [...oldTokens].filter(x => !newTokens.has(x));
            
            if (toRemove.length > 0 && oldPtr) this._bufferOp(path, 'remove', toRemove, oldPtr);
            if (toAdd.length > 0 && newPtr) this._bufferOp(path, 'add', toAdd, newPtr);
        } else {
            if (oldTokens.size > 0 && oldPtr) this._bufferOp(path, 'remove', [...oldTokens], oldPtr);
            if (newTokens.size > 0 && newPtr) this._bufferOp(path, 'add', [...newTokens], newPtr);
        }

        if (this.opsCount >= this.BUFFER_LIMIT) {
            // Fire and forget flush (chained internally)
            this.flush().catch(e => console.error("B\"H Auto-Flush Error:", e));
        }
    }

    _bufferOp(path, type, tokens, ptr) {
        if (!tokens || tokens.length === 0) return;
        const ptrHex = ptr.toString('hex');

        if (!this.activeBuffers.has(path)) {
            this.activeBuffers.set(path, new Map());
        }
        const pathBuffer = this.activeBuffers.get(path);

        for (const token of tokens) {
            if (!pathBuffer.has(token)) {
                pathBuffer.set(token, { 
                    adds: new Set(), 
                    removes: new Set(), 
                    rawAddPtrs: {}, 
                    rawRemovePtrs: {} 
                });
            }
            const entry = pathBuffer.get(token);
            
            if (type === 'add') {
                if (entry.removes.has(ptrHex)) {
                    entry.removes.delete(ptrHex);
                    delete entry.rawRemovePtrs[ptrHex];
                } else {
                    entry.adds.add(ptrHex);
                    entry.rawAddPtrs[ptrHex] = ptr;
                }
            } else {
                if (entry.adds.has(ptrHex)) {
                    entry.adds.delete(ptrHex);
                    delete entry.rawAddPtrs[ptrHex];
                } else {
                    entry.removes.add(ptrHex);
                    entry.rawRemovePtrs[ptrHex] = ptr;
                }
            }
            this.opsCount++;
        }
    }

    async flush() {
        // Return the promise so callers (waitForIdle) can await it
        const flushTask = (async () => {
            if (this.activeBuffers.size === 0) return;

            // B"H: Atomic Swap
            const buffersToProcess = this.activeBuffers;
            this.activeBuffers = new Map();
            this.opsCount = 0;

            if (this.db.debug) console.log(`B"H Indexer: Flushing batch across ${buffersToProcess.size} paths...`);

            // B"H: CRITICAL OPTIMIZATION - Wrap entire flush in a BATCH to prevent fsync on every token update.
            await this.db.batch(async () => {
                try {
                    const rootHandle = this.sysIndex[constants.SYMBOLS.INTERNALS] || this.sysIndex;
                    await rootHandle.ensureResolved();

                    for (const [path, tokenMap] of buffersToProcess) {
                        let indexHandle = await this._getPathIndexHandle(rootHandle, path);
                        
                        if (!indexHandle) {
                            if (this.db.debug) console.warn(`B"H Indexer: Failed to resolve index handle for path ${path}`);
                            continue;
                        }

                        const sortedTokens = Array.from(tokenMap.keys()).sort();
                        
                        for (const word of sortedTokens) {
                            const entry = tokenMap.get(word);
                            const adds = Object.values(entry.rawAddPtrs);
                            const removes = Object.values(entry.rawRemovePtrs);

                            if (adds.length === 0 && removes.length === 0) continue;

                            try {
                                await indexHandle.ensureResolved();
                                const resolved = await indexHandle.nav.resolveKey(word);

                                if (resolved && resolved.ptr) {
                                    if (removes.length > 0) {
                                        await this._batchRemove(indexHandle, resolved, removes, word);
                                        await indexHandle.ensureResolved(); 
                                    }
                                    if (adds.length > 0) {
                                        const resolvedAfter = await indexHandle.nav.resolveKey(word);
                                        if (resolvedAfter && resolvedAfter.ptr) {
                                            await this._batchAdd(indexHandle, resolvedAfter, adds, word);
                                        } else {
                                            await this._createNewList(indexHandle, word, adds);
                                        }
                                    }
                                } else if (adds.length > 0) {
                                    await this._createNewList(indexHandle, word, adds);
                                }
                            } catch(e) {
                                console.error(`B"H Indexer Flush Error [${path} -> ${word}]:`, e);
                            }
                        }
                    }
                } catch(err) {
                    console.error("B\"H Indexer Fatal Flush Error:", err);
                }
            });
        })();

        // Chain it
        this._flushQueue = this._flushQueue.then(() => flushTask);
        return this._flushQueue;
    }

    async _getPathIndexHandle(rootHandle, path) {
        const handle = rootHandle.nav.navigate(path);
        const hInt = handle[constants.SYMBOLS.INTERNALS] || handle;
        await hInt.ensureResolved();
        
        if (!hInt.ptr) {
            await rootHandle.writer.createMap(path);
            await hInt.ensureResolved(true);
        }
        return hInt;
    }

    async _batchAdd(handle, resolved, ptrs, word) {
        if (!ptrs || ptrs.length === 0) return;
        const listHandle = new LiveHandle(this.db, resolved.ptr, resolved.type, { parent: handle, key: word });
        const listWriter = listHandle[constants.SYMBOLS.INTERNALS].writer;
        const len = await listHandle.length;
        
        await listWriter.splice(len, 0, ...ptrs, { isPtr: true, _isAwtsmoosOptions: true });
    }

    async _batchRemove(handle, resolved, ptrs, word) {
        const res = await SmartPointer.resolve(resolved.ptr, this.db.allocator);
        const seq = new Sequence(this.db.allocator, res);
        const len = await seq.length();
        
        const ptrsHex = new Set(ptrs.map(p => p.toString('hex')));
        const indicesToRemove = [];

        for (let i = 0; i < len; i++) {
            const p = await seq.getPtr(i);
            if (p && ptrsHex.has(p.toString('hex'))) {
                indicesToRemove.push(i);
            }
        }

        indicesToRemove.sort((a, b) => b - a);
        
        const listHandle = new LiveHandle(this.db, resolved.ptr, resolved.type, { parent: handle, key: word });
        const listWriter = listHandle[constants.SYMBOLS.INTERNALS].writer;

        for (const idx of indicesToRemove) {
            await listWriter.splice(idx, 1, { skipFree: true, _isAwtsmoosOptions: true });
        }
    }

    async _createNewList(handle, word, ptrs) {
        const seq = new Sequence(this.db.allocator);
        await seq.create({ isWeak: true });
        await seq.splice(0, 0, ...ptrs);
        
        const seqPtrBuf = SmartPointer.block(constants.TYPE_SEQUENCE, seq.ptr.blockId, seq.ptr.length, seq.ptr.isChain, seq.ptr.offset);
        await handle.writer.set(word, seqPtrBuf, { isPtr: true, skipFree: true });
    }

    _extractTokens(val) {
        const parts = [];
        const stack = [val];
        let depth = 0;
        
        while (stack.length > 0) {
            if (depth++ > 500) break; 
            const curr = stack.pop();
            if (curr === null || curr === undefined) continue;
            if (typeof curr === 'string') parts.push(curr);
            else if (typeof curr === 'number') parts.push(String(curr)); 
            else if (typeof curr === 'object') {
                if (Buffer.isBuffer(curr)) continue;
                if (curr instanceof Date) continue; 
                if (curr instanceof RegExp) continue;
                if (ArrayBuffer.isView(curr)) continue;
                
                if (Array.isArray(curr)) {
                    for (let i = curr.length - 1; i >= 0; i--) stack.push(curr[i]);
                } else {
                    const keys = Object.keys(curr);
                    for (let i = keys.length - 1; i >= 0; i--) stack.push(curr[keys[i]]);
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