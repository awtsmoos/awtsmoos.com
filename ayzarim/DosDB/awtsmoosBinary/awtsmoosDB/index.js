
// B"H
/**
 * @file index.js
 * @description The Central Nervous System of AwtsmoosDB.
 */
const Pager = require('./core/pager.js');
const Allocator = require('./core/allocator.js');
const LiveHandle = require('./api/liveHandle.js');
const BTree = require('./structure/btree.js');
const constants = require('./constants.js');
const serializeValue = require('./serialize/serializeValue.js');
const { writePointer48, readPointer48 } = require('./utils/binaryHelpers.js');

class AwtsmoosDB {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.debug = options.debug || false;
        // B"H: Auto-Checkpoint Threshold (default 2MB)
        this.walCheckpointLimit = options.walCheckpointLimit || 2 * 1024 * 1024;
        
        this.pager = new Pager(filePath);
        // Pass 'this' to allocator so it can access db.debug for logging
        this.allocator = new Allocator(this.pager, this);
        this.executionQueue = Promise.resolve();
        
        // Root Proxy
        this.root = new LiveHandle(this, Promise.resolve(null), 'ROOT');
        
        if (this.debug) console.log(`[AwtsmoosDB] Initialized at ${filePath}`);
    }

    log(msg) {
        if (this.debug) {
            console.log(`[AwtsmoosDB] ${msg}`);
        }
    }

    // B"H: Alias for tests expecting explicit open()
    async open() {
        return this.ensureOpen();
    }

    async ensureOpen() {
        if (!this.pager.handle) {
            this.log("Opening Database...");
            await this.pager.init();
            await this.allocator.init();
            this.log("Database Opened.");
        }
    }
    
    async close() {
        if (this.pager) {
            this.log("Closing Database...");
            await this.pager.checkpoint();
            await this.pager.close();
            this.log("Database Closed.");
        }
    }

    /**
     * Executes a write operation sequentially.
     * B"H: Added Auto-Checkpoint logic.
     */
    execute(fn) {
        const task = async () => {
            try {
                this.log("Executing Task...");
                const result = await fn();

                // B"H: Check if WAL needs maintenance
                if (this.pager && this.pager.wal && this.pager.wal.currentOffset > this.walCheckpointLimit) {
                    this.log("WAL limit reached. Checkpointing...");
                    await this.pager.checkpoint();
                }
                return result;
            } catch (e) {
                console.error("B\"H [AwtsmoosDB] Execution Error:", e);
                throw e;
            }
        };

        // Chain promises to ensure serial execution (The Event Loop of Creation)
        this.executionQueue = this.executionQueue.then(task, task);
        return this.executionQueue;
    }

    async set(key, value) {
        return this.root.set(key, value);
    }

    async get(key) {
        const res = await this.root[key];
        // B"H: If result is a LiveHandle (deferred), verify existence via Reader
        if (res && res.constructor && res.constructor.name === 'LiveHandle') {
             return await res.reader.resolveSelf();
        }
        return res;
    }

    async waitForIdle() {
        await this.executionQueue;
    }

    // --- Internal Helpers ---

    async _readChainSafe(ptr) {
        if (!ptr || ptr.blockId === 0) return null;
        
        // B"H: FIX - MUST use Allocator to respect Cache!
        if (ptr.isChain) {
            // Calculate blocks needed
            const totalSize = ptr.length;
            const firstBlockCap = constants.BLOCK_SIZE - ptr.offset;
            const subBlockCap = constants.BLOCK_SIZE - constants.HEADER_SIZE;
            
            let blocksNeeded = 1;
            if (totalSize > firstBlockCap) {
                blocksNeeded += Math.ceil((totalSize - firstBlockCap) / subBlockCap);
            }

            // USE ALLOCATOR LOCKED READ
            const raw = await this.allocator.readSequentialLocked(ptr.blockId, blocksNeeded);
            const buf = Buffer.alloc(totalSize);
            
            let readOffset = 0;
            let writeOffset = 0;
            let remaining = totalSize;

            for(let i=0; i<blocksNeeded; i++) {
                const startOff = (i===0) ? ptr.offset : constants.HEADER_SIZE;
                const avail = constants.BLOCK_SIZE - startOff;
                const copyLen = Math.min(remaining, avail);
                
                raw.copy(buf, writeOffset, readOffset + startOff, readOffset + startOff + copyLen);
                
                writeOffset += copyLen;
                remaining -= copyLen;
                readOffset += constants.BLOCK_SIZE;
            }
            return buf;

        } else {
            // USE ALLOCATOR LOCKED READ
            const block = await this.allocator.readBlockLocked(ptr.blockId);
            if (!block) return null;
            return block.subarray(ptr.offset, ptr.offset + ptr.length);
        }
    }

    async _writeChainSafe(ptr, buffer) {
        // This is primarily used by CollectionOps for data blobs.
        // It assumes `ptr` was just allocated with the correct chain structure.
        if (ptr.isChain) {
            let remaining = buffer;
            let currentBlock = ptr.blockId;
            
            while(remaining.length > 0) {
                const start = (currentBlock === ptr.blockId) ? ptr.offset : constants.HEADER_SIZE;
                const avail = constants.BLOCK_SIZE - start;
                const chunk = Math.min(remaining.length, avail);
                
                // Read block via Allocator (cached)
                let blk = await this.allocator.readBlockLocked(currentBlock);
                if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);
                
                // Copy data
                remaining.subarray(0, chunk).copy(blk, start);
                
                // Write block via Allocator (cached)
                await this.allocator.writeBlockLocked(currentBlock, blk);
                
                remaining = remaining.subarray(chunk);
                currentBlock++;
            }
        } else {
             await this.allocator.writeUserSpace(ptr, buffer);
        }
    }
    
    async _loadRootTree() {
        return this.root.tree.getCurrentTree(null);
    }

    async _resolveValueFull(ptr) {
        if (!ptr) return undefined;
        const metaBuf = await this._readChainSafe(ptr);
        if (!metaBuf) return undefined;
        
        // Use parser to handle full structure
        const parser = require('./deserialize/parser.js');
        return parser.parse(metaBuf);
    }
    
    async _writeMetaValue(value) {
        // Serializes value and allocates space
        const fullBuf = serializeValue(value, true);
        const ptr = await this.allocator.allocate(fullBuf.length);
        await this._writeChainSafe(ptr, fullBuf);
        return ptr;
    }
}

module.exports = AwtsmoosDB;
