// B"H
/**
 * @namespace AwtsmoosDB
 * @description 
 *  A vessel for the Or Ein Sof (Infinite Light) to dwell within the binary dust.
 */
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
     * @description Identifies an AwtsmoosDB Handle via the registry.
     */
    isHandle(obj) {
        return HandleRegistry.isHandle(obj);
    }

    /**
     * @description Safely retrieves the internal metadata of a handle.
     */
    _getSoul(handle) {
        return HandleRegistry.getSoul(handle);
    }

    /**
     * @description Ensures a handle is up-to-date.
     */
    async ensureResolved(handle, force = false) {
        const soul = this._getSoul(handle);
        if (soul && soul.ensureResolved) {
             return await soul.ensureResolved(force);
        }
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

        this.root = new LiveHandle(this, this.rootPtrRaw, constants.TYPE_DICTIONARY, null);
        await this._initSystemMaps();
        await this._preloadSysCache();
    }
    
    async _initSystemMaps() {
        const sysMaps = ["__sys_vector__", "__sys_search__", "__graph__", "ai"];
        await this.batch(async () => {
            for (const name of sysMaps) {
                if (!await this.has(this.root, name)) await this.createMap(this.root, name);
            }
        });
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

    async compact(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.writer) return await soul.writer.compact();
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

    async *streamKeys(handle) {
        const soul = this._getSoul(handle);
        if (soul && soul.reader) yield* soul.reader.keys();
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
            if (this.allocator) await this.allocator.flushHeap();
            await this.pager.sync();
        });
    }

    async _flushBackgroundTasks() {
        while (this._pendingIndexOps.length > 0) {
            const op = this._pendingIndexOps.shift();
            try { await op(); } catch(e) { console.error("B\"H Background Task Failed:", e); }
        }
    }

    async _readChainSafe(ptr) {
        if (!ptr || !ptr.blockId) return null;
        const raw = await this.allocator.v1.readSequentialLocked(ptr.blockId, Math.ceil(ptr.length / constants.BLOCK_SIZE) + 1);
        const buf = Buffer.alloc(ptr.length);
        raw.copy(buf, 0, ptr.offset || 0, (ptr.offset || 0) + ptr.length);
        return buf;
    }

    async _writeChainSafe(ptr, buffer) {
        await this.allocator.v1.writeBlockLocked(ptr.blockId, buffer);
        this.mutationCount++;
    }
    
    cacheStructure(blockId, structure) {
        if (this.structureCache.size >= this.STRUCT_CACHE_LIMIT) this.structureCache.delete(this.structureCache.keys().next().value);
        this.structureCache.set(blockId, structure);
    }
    
    getCachedStructure(ptr) {
        return this.structureCache.get(ptr.blockId);
    }
}

module.exports = AwtsmoosDB_V2;
