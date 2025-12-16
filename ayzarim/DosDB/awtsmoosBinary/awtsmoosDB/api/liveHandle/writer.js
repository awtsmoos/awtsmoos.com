
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
        await this.db.graph.deleteNode(ptr);
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
                oldPtr = await seq.getPtr(index);
                if (oldPtr) oldVal = await this.handle.reader.getItem(index);
            }

            if (index === len) await seq.push(valToSet);
            else if (index < len) await seq.set(index, valToSet, { skipFree });
            else throw new Error(`Index ${index} out of bounds`);
            
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            if (searchIndexed && index < len) {
                if(this.db.debug) console.log(`B"H Writer Updating Index for ${path}...`);
                await this.db.search.updateIndex(path, valToSet, oldPtr, oldVal, value);
            } else if (searchIndexed && index === len) {
                if(this.db.debug) console.log(`B"H Writer Adding to Index for ${path}...`);
                await this.db.search.updateIndex(path, valToSet, null, null, value);
            }
            
            return;
        }

        const encodedKey = keyEncoding.encode(key);

        if (this.handle.type === constants.TYPE_MAP) {
            const map = await this._getEngine(structPtr, constants.TYPE_MAP);
            // If setting overwrites an existing key, we should check if we need to clean up graph/search.
            // Map.set in current implementation doesn't return old value easily unless we query.
            // For now, simple set.
            await map.set(encodedKey, valToSet, { isPtr: true, skipFree });
            await this._checkAutoCompact(map, constants.TYPE_MAP);
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

            if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = await this._getEngine(structPtr, constants.TYPE_DICTIONARY);
                return await dict.delete(encodedKey);
            }
            if (this.handle.type === constants.TYPE_MAP) {
                const map = await this._getEngine(structPtr, constants.TYPE_MAP);
                const res = await map.delete(encodedKey);
                
                // B"H: If delete returned deletedPtr, clean up graph
                if (res.success && res.deletedPtr) {
                    await this._checkGraphCleanup(res.deletedPtr);
                }
                
                await this._checkAutoCompact(map, constants.TYPE_MAP);
                return res.success;
            }
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                 const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
                 const index = parseInt(key);
                 if(!isNaN(index)) {
                     const path = this.handle.getPath();
                     const isIndexed = await this.db.search.isIndexed(path);
                     
                     // B"H: Fetch old pointer for cleanup
                     const oldPtr = await seq.getPtr(index);
                     
                     if (isIndexed && oldPtr) {
                         const oldVal = await this.handle.reader.getItem(index);
                         await this.db.search.updateIndex(path, null, oldPtr, oldVal, null);
                     }
                     
                     // B"H: Graph cleanup
                     if (oldPtr) await this._checkGraphCleanup(oldPtr);
                     
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
                await this.db.search.updateIndex(path, valToPush, null, null, value);
            }
            if (vectorIndex) {
                const vec = this._extractVector(value);
                if (vec) await this.db.vector.insert(path, currentLen, vec, valToPush);
            }
        });
    }

    async splice(start, deleteCount, ...items) {
        return this.db.execute(async () => {
            this._invalidateEngine(); // Splice invalidates simple append cache
            await this.handle.ensureResolved();
            if (this.handle.type !== constants.TYPE_SEQUENCE) throw new Error("Not a sequence");
            
            const path = this.handle.getPath();
            const structPtr = await this._resolveStructPtr();
            const seq = await this._getEngine(structPtr, constants.TYPE_SEQUENCE);
            const isIndexed = await this.db.search.isIndexed(path);
            
            const preparedItems = [];
            for(const item of items) preparedItems.push(await this.builder.build(item));
            
            const toRemove = []; // [{ ptr, val }]
            
            // B"H: Always fetch ptrs for graph/search cleanup if deleting
            if (deleteCount > 0) {
                for (let i = 0; i < deleteCount; i++) {
                    const idx = start + i;
                    const ptr = await seq.getPtr(idx);
                    if (ptr) {
                        const val = isIndexed ? await this.handle.reader.getItem(idx) : null;
                        toRemove.push({ ptr, val });
                    }
                }
            }

            await seq.splice(start, deleteCount, ...preparedItems);
            await this._checkAutoCompact(seq, constants.TYPE_SEQUENCE);
            
            // Cleanup
            for(const r of toRemove) {
                if (isIndexed) await this.db.search.updateIndex(path, null, r.ptr, r.val, null);
                // Graph cleanup
                await this._checkGraphCleanup(r.ptr);
            }
            
            if (isIndexed) {
                for(let i = 0; i < items.length; i++) {
                    const newVal = items[i];
                    const newPtr = preparedItems[i];
                    await this.db.search.updateIndex(path, newPtr, null, null, newVal);
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
