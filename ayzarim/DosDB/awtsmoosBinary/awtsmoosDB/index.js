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
        if (ptr.isChain) {
            // Calculate blocks needed
            const totalSize = ptr.length;
            const firstBlockCap = constants.BLOCK_SIZE - ptr.offset;
            const subBlockCap = constants.BLOCK_SIZE - constants.HEADER_SIZE;
            
            let blocksNeeded = 1;
            if (totalSize > firstBlockCap) {
                blocksNeeded += Math.ceil((totalSize - firstBlockCap) / subBlockCap);
            }

            const raw = await this.allocator.pager.readSequential(ptr.blockId, blocksNeeded);
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
            const block = await this.allocator.pager.readBlock(ptr.blockId);
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
                
                // Read block first to preserve header if needed (though usually we overwrite)
                let blk = await this.allocator.pager.readBlock(currentBlock);
                if (!blk) blk = Buffer.alloc(constants.BLOCK_SIZE);
                
                remaining.subarray(0, chunk).copy(blk, start);
                await this.allocator.pager.writeBlock(currentBlock, blk);
                
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
        
        // Use v1 adapter to decode standard [Type][Len][Data] blocks
        const v1Adapter = require('./deserialize/v1_adapter.js');
        // Meta blocks usually start with Type Byte.
        // However, v1Adapter expects the raw data part sometimes or handles the wrapper?
        // serializeValue produces [Type][Len][Data]. 
        // MetaBlock contains [Type][PtrToHandle] OR just [Type][Len][Data] if inlined?
        // In current Writer.set, we do `_writeMetaValue` which calls `serializeValue`.
        // So the buffer at `ptr` IS the [Type][Len][Data] blob.
        
        // Check for special types (Collections/Trees)
        const type = metaBuf[0] >> 2; // Unpack type from first byte
        
        if (type === constants.VAL_TYPE.OBJECT || type === constants.VAL_TYPE.MAP || type === constants.VAL_TYPE.ARRAY) {
             // For complex types, we might want to return the LiveHandle wrapper if accessed directly?
             // But _resolveValueFull implies "get me the JS value".
        }
        
        // Pass 0 as typeId is irrelevant here because the buffer contains the type header
        // v1Adapter.decode expects just the data if typeId is provided, OR full buffer?
        // Let's look at v1_adapter.decode:
        // It constructs the wrapper. So it expects `buffer` to be just DATA.
        // But `metaBuf` IS the full wrapper.
        
        // FIX: The parser handles full wrappers.
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