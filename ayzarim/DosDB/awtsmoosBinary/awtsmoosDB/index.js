//B"H
/**
 * @namespace AwtsmoosDB
 * @description 
 *  A vessel for the Or Ein Sof (Infinite Light) to dwell within the binary dust.
 */
const Pager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const constants = require('./constants.js');
const Dictionary = require('./structure/dictionary/index.js');
const { readPointer48, writePointer48 } = require('./utils/binaryHelpers.js');
const ReadWriteLock = require('./core/concurrency.js');
const GraphManager = require('./api/graphManager.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const Query = require('./api/query/index.js');
const AIManager = require('./api/ai/index.js');
const HandleRegistry = require('./core/handleRegistry.js');

class AwtsmoosDB_V2 {
    constructor(filePath, options = {}) {
        let finalCacheSize = options.cacheSize || 5000;
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
        this.ai = new AIManager(this);
        
        this.mutationCount = 0;
        this._pendingIndexOps = [];
        this._isFlushing = false;
        
        this.sysCache = { search: new Set(), vector: new Set(), loaded: false };
        this.structureCache = new Map();
        this.STRUCT_CACHE_LIMIT = Math.floor(this.config.cacheSize * 0.6); 
    }

    /**
     * @description Identifies if an object is an AwtsmoosDB Handle.
     */
    isHandle(obj) {
        return HandleRegistry.isHandle(obj);
    }

    /**
     * @description Unwraps a handle to its internal soul.
     */
    _getSoul(handle) {
        return HandleRegistry.getSoul(handle);
    }

    async ensureResolved(handle, force = false) {
        const soul = this._getSoul(handle);
        if (soul && soul.ensureResolved) {
             return await soul.ensureResolved(force);
        }
    }

    async query(handle, queryObj) {
        return await Query.execute(handle, queryObj);
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
        
        // B"H: Genesis inside a batch for atomicity
        await this.batch(async () => {
            if (savedRootId === 0) {
                const dict = new Dictionary(this.allocator);
                const rootPtr = await dict.create(); 
                const decoded = SmartPointer.decode(rootPtr);
                await this.allocator.v1.updateSuperBlock((block) => {
                    writePointer48(block, readPointer48(decoded.payload, 0), 64);
                    block.writeUInt32BE(decoded.payload.readUInt32BE(6), 70);
                    block.writeUInt32BE(decoded.payload.readUInt32BE(10), 74);
                    block.writeUInt8(decoded.payload.readUInt8(14), 78);
                });
                this.rootPtrRaw = rootPtr;
            } else {
                this.rootPtrRaw = SmartPointer.block(constants.TYPE_DICTIONARY, savedRootId, savedRootLen, savedRootChain === 1, savedRootOff);
            }

            this.root = HandleRegistry.createHandle(this, this.rootPtrRaw, constants.TYPE_DICTIONARY, null);
            
            await this._initSystemMaps();
            await this._preloadSysCache();
        });
    }

    /**
     * @description Ensures the database is open. Idempotent.
     */
    async ensureOpen() {
        if (this.root) return;
        return await this.open();
    }

    /**
     * @description Pashut (Simple) API - Set value on root.
     */
    async set(key, value) {
        if (!this.root) await this.ensureOpen();
        return await this.root.set(key, value);
    }

    /**
     * @description Pashut (Simple) API - Get value from root.
     */
    async get(key) {
        if (!this.root) await this.ensureOpen();
        return await this.root[key];
    }
    
    async _initSystemMaps() {
        const sysMaps = ["__sys_vector__", "__sys_search__", "__graph__", "ai"];
        for (const name of sysMaps) {
            if (!await this.has(this.root, name)) await this.createMap(this.root, name);
        }
    }
    
    async _preloadSysCache() {
        if (await this.has(this.root, "__sys_search__")) {
            for await (const k of this.streamKeys(this.root.__sys_search__)) this.sysCache.search.add(k);
        }
        if (await this.has(this.root, "__sys_vector__")) {
            for await (const k of this.streamKeys(this.root.__sys_vector__)) {
                if (!k.startsWith("__")) this.sysCache.vector.add(k);
            }
        }
        this.sysCache.loaded = true;
    }

    async has(handle, key) {
        const soul = this._getSoul(handle);
        if (!soul) return false;
        await soul.ensureResolved();
        return (await soul.nav.resolveKey(key)) !== null;
    }

    async createMap(handle, key) {
        const soul = this._getSoul(handle);
        if (soul && soul.writer) await soul.writer.createMap(key);
    }

    async createList(handle, key) {
        const soul = this._getSoul(handle);
        if (soul && soul.writer) await soul.writer.createList(key);
    }

    async createObject(handle, key) {
        const soul = this._getSoul(handle);
        if (soul && soul.writer) await soul.writer.createObject(key);
    }

    async compact(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.writer) return await soul.writer.compact();
    }

    async stats(handle) {
        const soul = this._getSoul(handle);
        if (!soul || !soul.reader) return { count: 0, size: 0, capacity: 0, fragmentation: 0 };
        return await soul.reader.stats();
    }

    async size(handle) {
        const soul = this._getSoul(handle);
        if (!soul || !soul.reader) return 0;
        return await soul.reader.length();
    }

    async keys(handle) {
        const soul = this._getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const k of soul.reader.keys()) arr.push(k);
        return arr;
    }

    async values(handle) {
        const soul = this._getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const v of soul.reader.values()) arr.push(v);
        return arr;
    }

    async entries(handle) {
        const soul = this._getSoul(handle);
        if (!soul || !soul.reader) return [];
        const arr = [];
        for await (const e of soul.reader.entries()) arr.push(e);
        return arr;
    }

    async *streamKeys(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.keys();
    }

    async *streamValues(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.values();
    }

    async *streamEntries(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.entries();
    }

    async *range(handle, start, end) {
        const soul = this._getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.range(start, end);
    }

    async close() {
        await this.waitForIdle(); 
        await this.pager.close();
        this.root = null;
    }

    async batch(fn) {
        return this.lock.runWrite(async () => {
            const isNested = this.pager.isBatching;
            if (!isNested) this.pager.startBatch();
            try { return await fn(); } finally {
                if (!isNested) {
                    await this._flushBackgroundTasks();
                    if (this.allocator) await this.allocator.flushHeap();
                    await this.pager.endBatch();
                }
            }
        });
    }

    async execute(fn) { return this.lock.runWrite(fn); }
    async read(fn) { return this.lock.runRead(fn); }

    async waitForIdle() { 
        return this.lock.runWrite(async () => {
            await this._flushBackgroundTasks();
            if (this.allocator) {
                await this.allocator.flushHeap();
                await this.allocator.v1.flush(); // B"H: Vital Persistence Fix
            }
            await this.pager.sync();
        });
    }

    async _flushBackgroundTasks() {
        if (this._isFlushing) return;
        this._isFlushing = true;
        try {
            while (this._pendingIndexOps.length > 0) {
                const tasks = this._pendingIndexOps;
                this._pendingIndexOps = [];
                for (const task of tasks) await task();
            }
            await this.search.flush();
            // B"H: Optimization - Check for recursive task additions
            if (this._pendingIndexOps.length > 0) await this._flushBackgroundTasks();
        } finally {
            this._isFlushing = false;
        }
    }

    cacheStructure(ptr, node) {
        const key = ptr.blockId + ':' + (ptr.offset || 0);
        if (this.structureCache.size >= this.STRUCT_CACHE_LIMIT) {
             const it = this.structureCache.keys();
             this.structureCache.delete(it.next().value);
        }
        this.structureCache.set(key, node);
    }

    getCachedStructure(ptr) {
        const key = ptr.blockId + ':' + (ptr.offset || 0);
        return this.structureCache.get(key);
    }

    evictStructure(ptr) {
        const key = ptr.blockId + ':' + (ptr.offset || 0);
        this.structureCache.delete(key);
    }

    async _readChainSafe(ptr) {
        if (!ptr || ptr.blockId === 0) return null;
        if (!ptr.isChain) {
            const block = await this.allocator.v1.readBlockLocked(ptr.blockId, true);
            if (!block) return null;
            if (ptr.offset + ptr.length > block.length) return block.subarray(ptr.offset);
            return block.subarray(ptr.offset, ptr.offset + ptr.length);
        }
        const availablePerBlock = constants.BLOCK_SIZE - constants.HEADER_SIZE;
        const blocksNeeded = Math.ceil(ptr.length / availablePerBlock);
        const mega = Buffer.allocUnsafe(ptr.length);
        let bytesRead = 0;
        for (let i = 0; i < blocksNeeded; i++) {
            const bid = ptr.blockId + i;
            const block = await this.allocator.v1.readBlockLocked(bid, true);
            const chunk = Math.min(availablePerBlock, ptr.length - bytesRead);
            block.copy(mega, bytesRead, constants.HEADER_SIZE, constants.HEADER_SIZE + chunk);
            bytesRead += chunk;
        }
        return mega;
    }

    async _writeChainSafe(ptr, data) {
        if (!ptr || ptr.blockId === 0) return;
        if (!ptr.isChain) {
            let block = await this.allocator.v1.readBlockLocked(ptr.blockId, false);
            if (!block) block = this.allocator.v1.formatBlock(constants.BLOCK_TYPE.PAGE);
            data.copy(block, ptr.offset);
            await this.allocator.v1.writeBlockLocked(ptr.blockId, block);
            return;
        }
        const availablePerBlock = constants.BLOCK_SIZE - constants.HEADER_SIZE;
        let bytesWritten = 0;
        for (let i = 0; bytesWritten < data.length; i++) {
            const bid = ptr.blockId + i;
            let block = await this.allocator.v1.readBlockLocked(bid, false);
            if (!block) block = this.allocator.v1.formatBlock(constants.BLOCK_TYPE.OVERFLOW);
            const chunk = Math.min(availablePerBlock, data.length - bytesWritten);
            data.copy(block, constants.HEADER_SIZE, bytesWritten, bytesWritten + chunk);
            await this.allocator.v1.writeBlockLocked(bid, block);
            bytesWritten += chunk;
        }
    }
}

module.exports = AwtsmoosDB_V2;