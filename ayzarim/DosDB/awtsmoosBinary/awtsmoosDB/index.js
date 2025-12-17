


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
        this.pager = new Pager(filePath, options);
        this.allocator = new AllocatorV2(this.pager, this);
        this.lock = new ReadWriteLock();
        this.root = null; 
        this.rootPtrRaw = null;
        this.debug = options.debug || false; 
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.debugBlocks = new Set();
        
        // B"H: Global Mutation Counter for Strong Consistency & Hot Path Caching
        this.mutationCount = 0;
        
        // B"H: Deferred Index Queue for High Throughput
        this._pendingIndexOps = [];
        
        // B"H: System Metadata Cache (Fast Lookup for Indexed Paths)
        this.sysCache = {
            search: new Set(),
            vector: new Set(),
            loaded: false
        };

        // B"H: Global Parsed Structure Cache (High-Level Object Cache)
        // Stores parsed MapNodes, SequenceNodes, etc. to avoid buffer parsing overhead.
        // Key: BlockID (Number) -> Value: Map<Offset, Object>
        // This allows multiple structures to exist in the same Heap Page (Block) without collision.
        this.structureCache = new Map();
        this.STRUCT_CACHE_LIMIT = 5000; 
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
        
        // B"H: Initialize System Maps synchronously
        await this._initSystemMaps();
        
        // B"H: Preload Metadata Cache for Performance
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
        // Optimistic Load: Read all keys from __sys_search__ and __sys_vector__ into memory
        // This makes isIndexed() checks instantaneous.
        
        // Search
        if (await this.has(this.root, "__sys_search__")) {
            const h = this.root.__sys_search__;
            for await (const k of this.streamKeys(h)) {
                this.sysCache.search.add(k);
            }
        }
        
        // Vector
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
            // B"H: SMART BATCHING (Group Commit)
            // If the lock queue has waiting writers, we stay in "Batch Mode"
            // effectively grouping multiple logical writes into a single disk sync.
            
            const hasWaiters = this.lock.writeQueue.length > 0;
            const alreadyBatching = this.pager.isBatching;
            
            if (!alreadyBatching) {
                this.pager.startBatch();
            }
            
            try {
                const res = await fn();
                // Flush in-memory background tasks (indexing) but don't force disk sync yet
                await this._flushBackgroundTasks(true);
                return res;
            } finally {
                // Ensure Heap and Caches are flushed to Pager (Memory)
                if (this.allocator) {
                    await this.allocator.flushHeap();
                    if (this.allocator.v1) await this.allocator.v1.flush();
                }
                
                // If we started the batch, we are responsible for it.
                if (!alreadyBatching) {
                    // Only commit to disk if NO ONE else is waiting.
                    // If waiters exist, we leave the batch open (Depth=1).
                    // The last waiter (who sees hasWaiters=false) will close it.
                    if (!hasWaiters) {
                        await this.pager.endBatch();
                    } else {
                        // Pass baton: We leave Depth at 1. 
                        // The next writer sees alreadyBatching=true.
                        // They do their work.
                        // They check hasWaiters.
                        // Eventually, the last writer calls endBatch().
                    }
                } else {
                    // We joined an existing batch.
                    // If we are the last one, we MUST close it (force sync).
                    // But `pager.endBatch` decrements depth.
                    // If we didn't increment depth, we shouldn't decrement.
                    
                    // CRITICAL FIX: The Pager's batch depth logic is recursive counter.
                    // If we rely on shared batch, we must manage the counter correctly or bypass it.
                    
                    // Simplified: Since we didn't increment, we don't decrement.
                    // But if we are the last waiter, the batch is effectively "Orphaned" if the starter exited.
                    // Actually, the starter exited but LEFT the depth at 1.
                    
                    if (!hasWaiters) {
                        // We are the caboose. We must flush.
                        // We call endBatch() to decrement the 1 left by the leader.
                        await this.pager.endBatch();
                    }
                }
            }
        });
    }

    async batch(fn) {
        return this.lock.runWrite(async () => {
            this.pager.startBatch();
            try {
                await fn();
            } finally {
                await this._flushBackgroundTasks(true); 
                
                if (this.vector && this.vector.indexes) {
                    for (const index of this.vector.indexes.values()) {
                        await index.flushCache();
                    }
                }
                if (this.allocator) {
                    await this.allocator.flushHeap();
                    if (this.allocator.v1) await this.allocator.v1.flush();
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
            if (this.allocator) {
                await this.allocator.flushHeap();
                if (this.allocator.v1) await this.allocator.v1.flush();
            }
            // Force sync regardless of batch state to ensure durability
            await this.pager.sync();
        });
    }
    
    async _flushBackgroundTasks(isInsideBatch = false) {
        if (this._pendingIndexOps.length === 0) return;

        const runTasks = async () => {
            while (this._pendingIndexOps.length > 0) {
                const op = this._pendingIndexOps.shift();
                try {
                    await op();
                } catch(e) {
                    console.error("B\"H Background Task Failed:", e);
                }
            }
        };

        if (!isInsideBatch && !this.pager.isBatching) {
            this.pager.startBatch();
            try {
                await runTasks();
            } finally {
                await this.pager.endBatch();
            }
        } else {
            await runTasks();
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
        
        // B"H: Removed excessively verbose logging to focus on logic errors
        // if (this.debug) {
        //      const headHex = buffer.length >= 4 ? buffer.subarray(0, 4).toString('utf8') : "N/A";
        //      console.log(`B"H _writeChainSafe: Start B${ptr.blockId} (Off: ${ptr.offset}, Len: ${buffer.length}) [HEAD:${headHex}]`);
        // }

        while(remaining.length > 0) {
            const start = (isFirst && ptr.offset) ? ptr.offset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining.length, avail);
            
            await this.allocator.v1.executeLocked(async () => {
                // B"H: Invalidate ENTIRE Page in Global Structure Cache
                // Any write to a block invalidates all cached structures within that block.
                this.structureCache.delete(currentBlock);

                let dirtyBuf = null;
                if (this.allocator.v1.activePage.id === currentBlock && this.allocator.v1.activePage.buffer) {
                    dirtyBuf = this.allocator.v1.activePage.buffer;
                    // B"H: CRITICAL FIX - Mark active page as dirty so it gets flushed to Pager!
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
                
                // B"H: Redundant invalidate for safety
                this.structureCache.delete(currentBlock);
            });
            
            remaining = remaining.subarray(chunk);
            currentBlock++;
            isFirst = false;
        }
        
        this.mutationCount++;
    }
    
    // B"H: Cache Management Helper - Updated for Composite Keys (BlockID -> Map<Offset, Struct>)
    cacheStructure(blockId, structure) {
        // Ensure structure has an offset
        const offset = (structure.selfPtr && structure.selfPtr.offset) || (structure.ptr && structure.ptr.offset) || 0;
        
        if (!this.structureCache.has(blockId)) {
            if (this.structureCache.size >= this.STRUCT_CACHE_LIMIT) {
                // Eviction Strategy: Remove oldest Block
                const firstKey = this.structureCache.keys().next().value;
                this.structureCache.delete(firstKey);
            }
            this.structureCache.set(blockId, new Map());
        }
        
        const blockCache = this.structureCache.get(blockId);
        blockCache.set(offset, structure);
    }
    
    getCachedStructure(blockId, offset = 0) {
        // Handle object ptr passed as first arg
        if (typeof blockId === 'object' && blockId.blockId !== undefined) {
            offset = blockId.offset || 0;
            blockId = blockId.blockId;
        }
        
        const blockCache = this.structureCache.get(blockId);
        if (!blockCache) return undefined;
        
        return blockCache.get(offset);
    }
}

module.exports = AwtsmoosDB_V2;
