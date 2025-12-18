
// B"H
const Pager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const LiveHandle = require('./api/liveHandle/index.js');
const constants = require('./constants.js');
const Dictionary = require('./structure/dictionary/index.js');
const { readPointer48, writePointer48 } = require('./utils/binaryHelpers.js');
const ReadWriteLock = require('./core/concurrency.js');
const GraphManager = require('./api/graphManager.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const Query = require('./api/query/index.js');

class AwtsmoosDB_V2 {
    constructor(filePath, options = {}) {
        // B"H: Configuration Defaults
        let finalCacheSize = options.cacheSize || 5000;
        
        // Helper: Allow user to define cache in MB directly
        if (options.cacheSizeMB) {
            const bytes = options.cacheSizeMB * 1024 * 1024;
            finalCacheSize = Math.ceil(bytes / constants.BLOCK_SIZE);
        }

        this.config = {
            cacheSize: finalCacheSize,
            debug: options.debug || false,
            ...options
        };

        this.pager = new Pager(filePath, this.config);
        this.allocator = new AllocatorV2(this.pager, this, this.config);
        this.lock = new ReadWriteLock();
        this.root = null; 
        this.rootPtrRaw = null;
        this.debug = this.config.debug; 
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.debugBlocks = new Set();
        
        this.mutationCount = 0;
        
        this._pendingIndexOps = [];
        this._isFlushing = false;
        this._flushPromise = null;
        
        this.sysCache = {
            search: new Set(),
            vector: new Set(),
            loaded: false
        };

        this.structureCache = new Map();
        // B"H: Scale structure cache with general cache size (approx 60%)
        this.STRUCT_CACHE_LIMIT = Math.floor(this.config.cacheSize * 0.6); 
    }

    async ensureOpen() {
        if (this.root) return;
        await this.open();
    }

    async open() {
        await this.pager.init();
        await this.allocator.init();

        const sb = await this.allocator.v1.readBlockLocked(0);
        const savedRootId = readPointer48(sb, 64);
        const savedRootLen = sb.readUInt32BE(70);
        const savedRootOff = sb.readUInt32BE(74);
        const savedRootChain = sb.readUInt8(78);

        const SmartPointer = require('./utils/smartPointer.js');

        if (savedRootId === 0) {
            if (this.debug) console.log("B\"H [Boot] Creating new Root Dictionary...");
            
            const dict = new Dictionary(this.allocator);
            const rootPtr = await dict.create(); 
            
            const decoded = SmartPointer.decode(rootPtr);
            const blockId = readPointer48(decoded.payload, 0);
            const len = decoded.payload.readUInt32BE(6);
            const off = decoded.payload.readUInt32BE(10);
            const isChain = decoded.payload.readUInt8(14);

            await this.allocator.v1.updateSuperBlock((block) => {
                writePointer48(block, blockId, 64);
                block.writeUInt32BE(len, 70);
                block.writeUInt32BE(off, 74);
                block.writeUInt8(isChain, 78);
            });
            
            this.rootPtrRaw = rootPtr;
        } else {
            this.rootPtrRaw = SmartPointer.block(constants.TYPE_DICTIONARY, savedRootId, savedRootLen, savedRootChain === 1, savedRootOff);
        }

        this.root = new LiveHandle(this, this.rootPtrRaw, constants.TYPE_DICTIONARY, null);
        
        await this._initSystemMaps();
        await this._preloadSysCache();
    }
    
    async _initSystemMaps() {
        const sysMaps = ["__sys_vector__", "__sys_search__", "__graph__"];
        
        await this.batch(async () => {
            for (const name of sysMaps) {
                const exists = await this.has(this.root, name);
                if (!exists) {
                    if (this.debug) console.log(`B"H [Boot] Initializing System Map: ${name}`);
                    await this.createMap(this.root, name);
                }
            }
        });
    }
    
    async _preloadSysCache() {
        if (await this.has(this.root, "__sys_search__")) {
            const h = this.root.__sys_search__;
            for await (const k of this.streamKeys(h)) {
                this.sysCache.search.add(k);
            }
        }
        
        if (await this.has(this.root, "__sys_vector__")) {
            const h = this.root.__sys_vector__;
            for await (const k of this.streamKeys(h)) {
                if (!k.startsWith("__")) this.sysCache.vector.add(k);
            }
        }
        
        this.sysCache.loaded = true;
    }

    async createMap(parentHandle, key) {
        const h = parentHandle[constants.SYMBOLS.INTERNALS] || parentHandle;
        if (!h.writer) throw new Error("Invalid Parent Handle");
        await h.writer.createMap(key);
    }

    async createList(parentHandle, key) {
        const h = parentHandle[constants.SYMBOLS.INTERNALS] || parentHandle;
        if (!h.writer) throw new Error("Invalid Parent Handle");
        await h.writer.createList(key);
    }

    async createObject(parentHandle, key) {
        const h = parentHandle[constants.SYMBOLS.INTERNALS] || parentHandle;
        if (!h.writer) throw new Error("Invalid Parent Handle");
        await h.writer.createObject(key);
    }

    async compact(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.writer) throw new Error("B\"H: Invalid Handle for compaction");
        return await h.writer.compact();
    }

    async query(handle, criteria) {
        return Query.execute(handle, criteria);
    }

    async has(handle, key) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.isLiveHandle) return false;
        
        await h.ensureResolved();
        const result = await h.nav.resolveKey(key);
        return result !== null;
    }
    
    async size(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.reader) return 0;
        return await h.reader.length();
    }

    async stats(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.reader) return { count: 0, size: 0 };
        return await h.reader.stats();
    }

    async *streamKeys(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.isLiveHandle) throw new Error("B\"H: Invalid Handle");
        yield* h.reader.keys();
    }

    async *streamValues(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.isLiveHandle) throw new Error("B\"H: Invalid Handle");
        yield* h.reader.values();
    }

    async *streamEntries(handle) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.isLiveHandle) throw new Error("B\"H: Invalid Handle");
        yield* h.reader.entries();
    }

    async keys(handle) {
        const arr = [];
        for await (const k of this.streamKeys(handle)) arr.push(k);
        return arr;
    }

    async values(handle) {
        const arr = [];
        for await (const v of this.streamValues(handle)) arr.push(v);
        return arr;
    }

    async entries(handle) {
        const arr = [];
        for await (const e of this.streamEntries(handle)) arr.push(e);
        return arr;
    }

    async *range(handle, start, end) {
        const h = handle && handle[constants.SYMBOLS.INTERNALS] ? handle[constants.SYMBOLS.INTERNALS] : handle;
        if (!h || !h.isLiveHandle) throw new Error("B\"H: Invalid Handle");
        yield* h.reader.range(start, end);
    }

    async close() {
        await this.waitForIdle(); 
        await this.pager.close();
        this.root = null;
    }

    async execute(fn) {
        return this.lock.runWrite(async () => {
            const hasWaiters = this.lock.writeQueue.length > 0;
            // B"H: Capture batch state
            const alreadyBatching = this.pager.isBatching;
            
            if (!alreadyBatching) {
                this.pager.startBatch();
            }
            
            try {
                const res = await fn();
                // B"H: Optimization - Only trigger background flush if NOT in a batch
                // If we are batching, we want to accumulate all index ops and flush them at the end of the batch.
                if (!alreadyBatching) {
                    this._triggerBackgroundFlush();
                }
                return res;
            } finally {
                if (this.allocator) {
                    await this.allocator.flushHeap();
                    // B"H: Optimization - Only flush pages, do not force SuperBlock write here
                    // Only explicit checkpoints or closes should force SB write.
                    if (this.allocator.v1) await this.allocator.v1.flush(); 
                }
                
                // B"H: CRITICAL FIX - Do not touch batch state if we are nested in a larger batch.
                // We must respect the outer transaction boundary.
                if (!alreadyBatching) {
                    if (!hasWaiters) {
                        await this.pager.endBatch();
                    }
                }
            }
        });
    }

    async batch(fn) {
        return this.lock.runWrite(async () => {
            // B"H: Check nesting BEFORE starting new batch layer
            const isNested = this.pager.isBatching;
            
            this.pager.startBatch();
            try {
                await fn();
            } finally {
                // B"H: Only flush if we are the outermost batch
                if (!isNested) {
                    // B"H: CRITICAL FIX - Must AWAIT background tasks processing 
                    // to ensure Pending Index Ops are written to Index Cache BEFORE we flush cache to disk.
                    await this._flushBackgroundTasks();

                    if (this.vector && this.vector.indexes) {
                        for (const index of this.vector.indexes.values()) {
                            await index.flushCache();
                        }
                    }
                    
                    if (this.search) await this.search.flush();

                    if (this.allocator) {
                        await this.allocator.flushHeap();
                        if (this.allocator.v1) await this.allocator.v1.flush();
                    }
                }
                await this.pager.endBatch();
            }
        });
    }

    async read(fn) {
        return this.lock.runRead(fn);
    }

    async waitForIdle() { 
        return this.lock.runWrite(async () => {
            await this._flushBackgroundTasks();

            if (this.vector && this.vector.indexes) {
                for (const index of this.vector.indexes.values()) {
                    await index.flushCache();
                }
            }
            
            if (this.search) await this.search.flush();

            if (this.allocator) {
                await this.allocator.flushHeap();
                if (this.allocator.v1) {
                    await this.allocator.v1.flush();
                    // B"H: Checkpoint - Save SuperBlock explicitly here to persist cursor state
                    await this.allocator.v1._saveStateInternal();
                }
            }
            
            await this.pager.sync();
        });
    }
    
    _triggerBackgroundFlush() {
        if (this._isFlushing) return;
        this._flushBackgroundTasks().catch(e => {
            console.error("B\"H Background Flush Async Error:", e);
        });
    }

    async _flushBackgroundTasks() {
        if (this._isFlushing && this._flushPromise) {
            return this._flushPromise;
        }
        
        if (this._pendingIndexOps.length === 0) return Promise.resolve();

        this._isFlushing = true;
        let resolveFlush;
        this._flushPromise = new Promise(r => resolveFlush = r);

        try {
            let failsafe = 0;
            while (this._pendingIndexOps.length > 0) {
                if (failsafe++ > 100000) {
                    console.warn("B\"H: Background Task Loop Limit Reached (Possible Infinite Recursion)");
                    break;
                }
                const op = this._pendingIndexOps.shift();
                try {
                    await op();
                } catch(e) {
                    console.error("B\"H Background Task Failed:", e);
                }
            }
        } finally {
            this._isFlushing = false;
            this._flushPromise = null;
            if (resolveFlush) resolveFlush();
        }
    }

    async _readChainSafe(ptr) {
        if (!ptr || !ptr.blockId) return null;
        
        const totalSize = ptr.length || constants.BLOCK_SIZE;
        const startOffset = ptr.offset || 0;
        
        const firstBlockCap = constants.BLOCK_SIZE - startOffset;
        let blocksNeeded = 1;
        
        if (totalSize > firstBlockCap) {
            const remainingAfterFirst = totalSize - firstBlockCap;
            const subsequentBlockCap = constants.BLOCK_SIZE - constants.HEADER_SIZE;
            blocksNeeded += Math.ceil(remainingAfterFirst / subsequentBlockCap);
        }

        const raw = await this.allocator.v1.readSequentialLocked(ptr.blockId, blocksNeeded);
        if (!raw) return null; 

        const buf = Buffer.alloc(totalSize); 
        
        let readOff = 0; 
        let writeOff = 0; 
        let remaining = totalSize;

        for(let i=0; i<blocksNeeded; i++) {
            const start = (i===0) ? startOffset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining, avail);
            
            if (readOff + start + chunk > raw.length) break;
            
            raw.copy(buf, writeOff, readOff + start, readOff + start + chunk);
            
            writeOff += chunk;
            remaining -= chunk;
            readOff += constants.BLOCK_SIZE;
        }
        
        return buf;
    }

    async _writeChainSafe(ptr, buffer) {
        let remaining = buffer;
        let currentBlock = ptr.blockId;
        let isFirst = true;
        
        // B"H: Optimization - Acquire lock once for the entire chain operation
        // This prevents thousands of lock/unlock cycles for large file writes.
        await this.allocator.v1.executeLocked(async () => {
            while(remaining.length > 0) {
                const start = (isFirst && ptr.offset) ? ptr.offset : constants.HEADER_SIZE;
                const avail = constants.BLOCK_SIZE - start;
                const chunk = Math.min(remaining.length, avail);
                
                // B"H: FIX - Invalidate the Allocator's read cache for this block.
                // We are writing directly to the Pager's dirty buffer (or active page).
                // If Allocator has a stale copy in blockCache, subsequent reads will be wrong.
                if (this.allocator.v1.blockCache) {
                    this.allocator.v1.invalidateCache(currentBlock);
                }

                let dirtyBuf = null;
                // Since we are inside executeLocked, activePage access is safe
                if (this.allocator.v1.activePage.id === currentBlock && this.allocator.v1.activePage.buffer) {
                    dirtyBuf = this.allocator.v1.activePage.buffer;
                    this.allocator.v1.activePage.dirty = true;
                } else {
                    dirtyBuf = this.pager.getDirtyBuffer(currentBlock);
                }
                
                if (dirtyBuf) {
                    remaining.subarray(0, chunk).copy(dirtyBuf, start);
                    await this.allocator.v1._writeBlockSynced(currentBlock, dirtyBuf);
                } else {
                    let blk = await this.allocator.v1._readBlockSynced(currentBlock);
                    if (!blk) {
                         if (this.debug) console.warn(`B"H _writeChainSafe: Auto-formatting missing/uninitialized Block ${currentBlock}`);
                         blk = this.allocator.v1.formatBlock(constants.BLOCK_TYPE.PAGE); 
                    }
                    remaining.subarray(0, chunk).copy(blk, start);
                    await this.allocator.v1._writeBlockSynced(currentBlock, blk);
                }
                
                remaining = remaining.subarray(chunk);
                currentBlock++;
                isFirst = false;
            }
        });
        
        this.mutationCount++;
    }
    
    cacheStructure(blockId, structure) {
        const offset = (structure.selfPtr && structure.selfPtr.offset) || (structure.ptr && structure.ptr.offset) || 0;
        
        if (!this.structureCache.has(blockId)) {
            if (this.structureCache.size >= this.STRUCT_CACHE_LIMIT) {
                const firstKey = this.structureCache.keys().next().value;
                this.structureCache.delete(firstKey);
            }
            this.structureCache.set(blockId, new Map());
        }
        
        const blockCache = this.structureCache.get(blockId);
        blockCache.set(offset, structure);
    }
    
    getCachedStructure(blockId, offset = 0) {
        if (blockId && typeof blockId === 'object' && blockId.blockId !== undefined) {
            offset = blockId.offset || 0;
            blockId = blockId.blockId;
        }
        
        if (blockId === null || blockId === undefined) return undefined;

        const blockCache = this.structureCache.get(blockId);
        if (!blockCache) return undefined;
        return blockCache.get(offset);
    }
}

module.exports = AwtsmoosDB_V2;
