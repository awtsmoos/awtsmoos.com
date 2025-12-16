
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Dictionary = require('../../structure/dictionary/index.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const StructBuilder = require('../../utils/structBuilder.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const keyEncoding = require('../../utils/keyEncoding.js');

class Writer {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.builder = new StructBuilder(this.db.allocator);
        
        // B"H: Engine Cache to maintain state (like append cursor)
        this._cachedEngine = null;
        this._cachedStructPtrHash = null;
    }

    log(msg) {
        // console.log(`[TRACE Writer] ${msg}`);
    }

    async _getEngine(structPtr, type) {
        // Create hash of structPtr to detect if it changed (e.g. root moved)
        const ptrHash = structPtr ? `${structPtr.blockId}:${structPtr.offset}` : 'null';
        
        if (this._cachedEngine && this._cachedStructPtrHash === ptrHash) {
            return this._cachedEngine;
        }
        
        let engine;
        if (type === constants.TYPE_SEQUENCE) engine = new Sequence(this.db.allocator, structPtr);
        else if (type === constants.TYPE_MAP) engine = new MapEngine(this.db.allocator, structPtr);
        else if (type === constants.TYPE_DICTIONARY) engine = new Dictionary(this.db.allocator, structPtr);
        
        this._cachedEngine = engine;
        this._cachedStructPtrHash = ptrHash;
        return engine;
    }
    
    _invalidateEngine() {
        if (this._cachedEngine && this._cachedEngine.ops && this._cachedEngine.ops.invalidate) {
            this._cachedEngine.ops.invalidate();
        }
    }

    async _hydrateForIndex(val) {
        if (val && val.isStructure) {
             const LH = this.handle.constructor; 
             const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
             const h = new LH(this.db, buf, val.type, null);
             return await h.reader.resolveSelf();
        }
        return val;
    }

    async _checkAutoCompact(engine, type) {
        const newPtr = engine.ptr;
        let oldPtr = null;
        
        if (this.handle.ptr) {
             const decoded = SmartPointer.decode(this.handle.ptr);
             if (decoded.mode === constants.MODE_BLOCK) {
                 oldPtr = {
                     blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6),
                     offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             }
        } 

        const hasChanged = !oldPtr || 
                           newPtr.blockId !== oldPtr.blockId ||
                           newPtr.length !== oldPtr.length ||
                           newPtr.offset !== oldPtr.offset;

        if (hasChanged) {
            const newPtrBuf = SmartPointer.block(type, newPtr.blockId, newPtr.length, newPtr.isChain, newPtr.offset);
            await this.handle._updatePointer(newPtrBuf);
            this._cachedStructPtrHash = `${newPtr.blockId}:${newPtr.offset}`;
        }
    }

    // B"H: New Graph Cleanup Helper
    async _checkGraphCleanup(ptr) {
        if (!ptr) return;
        // Optimization: Only if graph exists
        const hasGraph = await this.db.root.has("__graph__");
        if (!hasGraph) return;
        
        // Pass pointer buffer directly to deleteNode
        // Note: GraphManager deleteNode is async and handles edge cleanup.
        // We fire and await to ensure consistency for test.
        try {
            await this.db.graph.deleteNode(ptr);
        } catch(e) {
            if(this.db.debug) console.warn("B\"H Graph Cleanup warning: " + e.message);
        }
    }

    async compact() {
        return this.db.execute(async () => {
            return this._compactRaw();
        });
    }

    async _compactRaw() {
        await this.handle.ensureResolved();
        let structPtr = await this._resolveStructPtr();
        if (!structPtr) return false;

        if (this.handle.type === constants.TYPE_SEQUENCE) {
            const engine = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            await engine.compact();
            
            if (engine.ptr.blockId !== structPtr.blockId) {
                const newPtr = SmartPointer.block(this.handle.type, engine.ptr.blockId, engine.ptr.length, engine.ptr.isChain, engine.ptr.offset);
                await this.handle._updatePointer(newPtr);
                return true;
            }
        }
        return false;
    }

    async _resolveStructPtr() {
        if (this.handle.ptr) {
            return await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
        } else if (this.handle === this.db.root && this.db.rootPtrRaw) {
             const decoded = SmartPointer.decode(this.db.rootPtrRaw);
             return {
                 blockId: readPointer48(decoded.payload, 0),
                 length: decoded.payload.readUInt32BE(6),
                 offset: decoded.payload.readUInt32BE(10),
                 isChain: decoded.payload.readUInt8(14) === 1
             };
        }
        return null;
    }

    _extractVector(value) {
        if (!value || typeof value !== 'object') return null;
        const candidates = ['vector', 'embedding', 'vec'];
        for(const c of candidates) {
            if (value[c] && (Array.isArray(value[c]) || value[c] instanceof Float32Array)) {
                return value[c];
            }
        }
        return null;
    }

    async set(key, value, options = {}) {
        return this.db.execute(async () => {
            try {
                this._invalidateEngine(); 
                await this._setRaw(key, value, options);
            } catch (e) {
                console.error(`B"H - Writer.set error: ${e.message}`);
                throw e;
            }
        });
    }

    async _setRaw(key, value, options = {}) {
        await this.handle.ensureResolved();
        
        const isPtr = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;

        if (!this.handle.ptr && this.handle !== this.db.root) {
             await this.handle.ensureResolved();
             if(!this.handle.ptr) throw new Error(`Cannot set '${String(key)}' on undefined path.`);
        }

        const valToSet = isPtr ? value : await this.builder.build(value);
        const path = this.handle.getPath();
        const searchIndexed = await this.db.search.isIndexed(path);
        
        if (this.db.debug) console.log(`B"H Writer._setRaw path="${path}" searchIndexed=${searchIndexed} key=${key}`);

        const vectorIndex = await this.db.vector.getIndex(path);

        let structPtr = await this._resolveStructPtr();
        
        if (this.handle.type === constants.TYPE_SEQUENCE) {
            const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            const index = parseInt(key);
            if (isNaN(index)) throw new Error(`Invalid index '${String(key)}'`);
            
            const len = await seq.length();
            
            let oldPtr = null;
            let oldVal = null;
            
            if (searchIndexed && index < len) {
                try {
                    oldPtr = await seq.getPtr(index);
                    if (oldPtr) oldVal = await this.handle.reader.getItem(index);
                } catch(e) {
                    if (this.db.debug) console.warn(`B"H Writer: Failed to read oldVal for index ${index}. Corruption?`);
                    oldVal = null; // Proceed with update despite corruption
                }
            }

            if (index === len) await seq.push(valToSet);
            else if (index < len) await seq.set(index, valToSet, { skipFree });
            else throw new Error(`Index ${index} out of bounds`);
            
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            if (searchIndexed && index < len) {
                if(this.db.debug) console.log(`B"H Writer Updating Index for ${path}...`);
                try {
                    await this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
                } catch(e) {
                    if(this.db.debug) console.warn("B\"H Index Update failed: " + e.message);
                }
            } else if (searchIndexed && index === len) {
                if(this.db.debug) console.log(`B"H Writer Adding to Index for ${path}...`);
                try {
                    await this.db.search.updateIndex(path, valToSet, null, null, value);
                } catch(e) {
                    if(this.db.debug) console.warn("B\"H Index Add failed: " + e.message);
                }
            }
            
            // B"H: Update Vector Index on Set/Push
            if (vectorIndex) {
                const vec = this._extractVector(value);
                if (vec) await this.db.vector.insert(path, index, vec, valToSet);
            }
            
            return;
        }

        const encodedKey = keyEncoding.encode(key);

        if (this.handle.type === constants.TYPE_MAP) {
            const map = await this._getEngine(structPtr, constants.TYPE_MAP);
            
            let oldPtr = null;
            let oldVal = null;
            
            // B"H: If Search Indexed, fetch old value before overwrite
            if (searchIndexed) {
                try {
                    oldPtr = await map.getPtr(encodedKey);
                    if (oldPtr) {
                        const temp = await SmartPointer.resolve(oldPtr, this.db.allocator);
                        oldVal = await this._hydrateForIndex(temp);
                    }
                } catch(e) {
                    if (this.db.debug) console.warn(`B"H Writer: Failed to read oldVal for key ${key}. Corruption?`);
                    oldVal = null;
                }
            }

            await map.set(encodedKey, valToSet, { isPtr: true, skipFree });
            await this._checkAutoCompact(map, constants.TYPE_MAP);
            
            // B"H: Update Search Index
            if (searchIndexed) {
                try {
                    await this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
                } catch(e) {
                    if(this.db.debug) console.warn("B\"H Index Update failed: " + e.message);
                }
            }

            if (vectorIndex) {
                const vec = this._extractVector(value);
                if (vec) await this.db.vector.insert(path, key, vec, valToSet);
            }
            return;
        }

        const dict = await this._getEngine(structPtr, constants.TYPE_DICTIONARY);
        await dict.set(encodedKey, valToSet, { isPtr: true, skipFree });
    }

    async createMap(key) {
        return this.db.execute(async () => {
            this._invalidateEngine();
            await this.handle.ensureResolved();
            let structPtr = await this._resolveStructPtr();
            
            const map = new MapEngine(this.db.allocator);
            const mapPtr = await map.create();

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const index = parseInt(key);
                const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
                const len = await seq.length();
                if (index === len) await seq.push(mapPtr);
                else await seq.splice(index, 1, mapPtr);
                await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            } else if (this.handle.type === constants.TYPE_MAP) {
                const encodedKey = keyEncoding.encode(key);
                const mapEngine = await this._getEngine(structPtr, constants.TYPE_MAP);
                await mapEngine.set(encodedKey, mapPtr, { isPtr: true });
                await this._checkAutoCompact(mapEngine, constants.TYPE_MAP);
            } else {
                const encodedKey = keyEncoding.encode(key);
                const dict = await this._getEngine(structPtr, constants.TYPE_DICTIONARY);
                await dict.set(encodedKey, mapPtr, { isPtr: true });
            }
        });
    }

    async createList(key) {
        return this.set(key, []);
    }

    async delete(key) {
        return this.db.execute(async () => {
            this._invalidateEngine();
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return false;
            let structPtr = await this._resolveStructPtr();
            const encodedKey = keyEncoding.encode(key);
            
            const path = this.handle.getPath();
            const vectorIndex = await this.db.vector.getIndex(path);
            const searchIndexed = await this.db.search.isIndexed(path);

            if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = await this._getEngine(structPtr, constants.TYPE_DICTIONARY);
                return await dict.delete(encodedKey);
            }
            if (this.handle.type === constants.TYPE_MAP) {
                const map = await this._getEngine(structPtr, constants.TYPE_MAP);
                
                // B"H: FIX - MapEngine.delete now returns {success, deletedPtr} without freeing.
                // We must handle the freeing here AFTER using it for index cleanup.
                const res = await map.delete(encodedKey);
                
                if (res.success && res.deletedPtr) {
                    if (searchIndexed) {
                        try {
                            const temp = await SmartPointer.resolve(res.deletedPtr, this.db.allocator);
                            const oldVal = await this._hydrateForIndex(temp);
                            await this.db.search.updateIndex(path, null, res.deletedPtr, oldVal, null);
                        } catch(e) {
                            if(this.db.debug) console.warn("B\"H Index Cleanup warning: " + e.message);
                        }
                    }
                    
                    await this._checkGraphCleanup(res.deletedPtr);
                    
                    if (vectorIndex) await this.db.vector.delete(path, key);
                    
                    // NOW we free the block
                    await this.db.allocator.free(res.deletedPtr);
                }
                
                await this._checkAutoCompact(map, constants.TYPE_MAP);
                return res.success;
            }
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                 const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
                 const index = parseInt(key);
                 if(!isNaN(index)) {
                     
                     // B"H: Fetch old pointer for cleanup
                     const oldPtr = await seq.getPtr(index);
                     
                     if (searchIndexed && oldPtr) {
                         try {
                             const oldVal = await this.handle.reader.getItem(index);
                             await this.db.search.updateIndex(path, null, oldPtr, oldVal, null);
                         } catch(e) {
                             if(this.db.debug) console.warn("B\"H Index Cleanup warning: " + e.message);
                         }
                     }
                     
                     // B"H: Graph & Vector cleanup
                     if (oldPtr) {
                         await this._checkGraphCleanup(oldPtr);
                         if (vectorIndex) await this.db.vector.delete(path, index);
                     }
                     
                     await seq.splice(index, 1);
                     await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
                     return true;
                 }
            }
        });
    }

    async push(value, options = {}) {
        return this.db.execute(async () => {
            await this.handle.ensureResolved();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            
            const isPtr = (options === true) || (options && options.isPtr);
            const path = this.handle.getPath();
            const isIndexed = await this.db.search.isIndexed(path);
            const vectorIndex = await this.db.vector.getIndex(path);

            const structPtr = await this._resolveStructPtr();
            
            // B"H: Use cached engine to preserve append optimization
            const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            
            const currentLen = await seq.length();
            
            const valToPush = isPtr ? value : await this.builder.build(value);

            await seq.push(valToPush);
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);

            if (isIndexed) {
                try {
                    await this.db.search.updateIndex(path, valToPush, null, null, value);
                } catch(e) {
                    if(this.db.debug) console.warn("B\"H Index Update warning: " + e.message);
                }
            }
            if (vectorIndex) {
                const vec = this._extractVector(value);
                if (vec) await this.db.vector.insert(path, currentLen, vec, valToPush);
            }
        });
    }

    async splice(start, deleteCount, ...args) {
        return this.db.execute(async () => {
            this._invalidateEngine(); // Splice invalidates simple append cache
            await this.handle.ensureResolved();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            
            let options = {};
            let items = args;
            // B"H: Check for options object at the end
            if (args.length > 0) {
                const last = args[args.length - 1];
                if (last && typeof last === 'object' && last._isAwtsmoosOptions) {
                    options = last;
                    items = args.slice(0, -1);
                }
            }

            const path = this.handle.getPath();
            const structPtr = await this._resolveStructPtr();
            const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            const isIndexed = await this.db.search.isIndexed(path);
            const vectorIndex = await this.db.vector.getIndex(path);
            
            const preparedItems = [];
            for(const item of items) preparedItems.push(await this.builder.build(item));
            
            const toRemove = []; // [{ ptr, val }]
            
            // B"H: Always fetch ptrs for graph/search cleanup if deleting
            if (deleteCount > 0) {
                for (let i = 0; i < deleteCount; i++) {
                    const idx = start + i;
                    const ptr = await seq.getPtr(idx);
                    if (ptr) {
                        let val = null;
                        if (isIndexed) {
                            try {
                                val = await this.handle.reader.getItem(idx);
                            } catch(e) {
                                if (this.db.debug) console.warn(`B"H Writer: Corruption detected reading index ${idx}. Deleting anyway.`);
                            }
                        }
                        toRemove.push({ ptr, val });
                    }
                }
            }

            // Cleanup Logic
            let removeIdx = 0;
            for(const r of toRemove) {
                if (isIndexed) {
                    try {
                        await this.db.search.updateIndex(path, null, r.ptr, r.val, null);
                    } catch(e) {
                        if(this.db.debug) console.warn("B\"H Index Cleanup warning: " + e.message);
                    }
                }
                
                // B"H: Only clean graph/vector if we are NOT in a skipFree (Ref) splice
                // skipFree usually implies we are just removing a reference, not deleting the object.
                if (!options.skipFree) {
                    await this._checkGraphCleanup(r.ptr);
                    if (vectorIndex) await this.db.vector.delete(path, start + removeIdx);
                }
                removeIdx++;
            }

            // B"H: Call OPS splice directly to pass options
            await seq.ops.splice(start, deleteCount, preparedItems, options);
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            if (isIndexed) {
                for(let i = 0; i < items.length; i++) {
                    const newVal = items[i];
                    const newPtr = preparedItems[i];
                    try {
                        await this.db.search.updateIndex(path, newPtr, null, null, newVal);
                    } catch(e) {
                        if(this.db.debug) console.warn("B\"H Index Update warning: " + e.message);
                    }
                }
            }

            // B"H: Handle Vector Insertion for spliced items
            if (vectorIndex) {
                if (this.db.debug) console.log(`B"H Writer: Processing vector insertion for ${items.length} items at start=${start}`);
                for(let i = 0; i < items.length; i++) {
                    const val = items[i];
                    const vec = this._extractVector(val);
                    if (vec) {
                        if (this.db.debug) console.log(`B"H Writer: Vector found for item ${i}. Inserting...`);
                        // The HNSW insert expects 'payload' to be the pointer to the item.
                        const ptr = preparedItems[i]; 
                        try {
                            await this.db.vector.insert(path, start + i, vec, ptr);
                        } catch(e) {
                            console.error(`B"H Writer: Vector Insertion Failed: ${e.message}`);
                        }
                    } else {
                        if (this.db.debug) console.log(`B"H Writer: No vector found for item ${i}`);
                    }
                }
            }
        });
    }

    async concat(otherHandle) {
        return this.db.execute(async () => {
            this._invalidateEngine();
            await this.handle.ensureResolved();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            if (otherHandle.ensureResolved) await otherHandle.ensureResolved();
            if (!otherHandle.ptr) return; 

            const structPtr = await this._resolveStructPtr();
            const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            
            let otherRes;
            if (otherHandle.ptr) otherRes = await SmartPointer.resolve(otherHandle.ptr, this.db.allocator);
            else return;

            const otherSeq = new Sequence(this.db.allocator, otherRes);
            await seq.concat(otherSeq);
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            const path = this.handle.getPath();
            if (await this.db.search.isIndexed(path)) {
                await this.db.search.reindex(path);
            }
        });
    }
}
module.exports = Writer;
