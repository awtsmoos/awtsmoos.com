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

    async ensureOpen() {
        if (!this.pager.handle) {
            this.log("Opening Database...");
            await this.pager.init();
            await this.allocator.init();
            this.log("Database Opened.");
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
                    this.log("Auto-Checkpointing WAL (Limit Exceeded)...");
                    if (this.allocator) await this.allocator.saveState();
                    await this.pager.checkpoint();
                    this.log("WAL Checkpoint Complete.");
                }

                return result;
            } catch (e) {
                console.error("B\"H: DB Execution Error:", e);
                throw e;
            }
        };
        this.executionQueue = this.executionQueue.then(task, task);
        return this.executionQueue;
    }

    /**
     * Manual Checkpoint.
     * Flushes everything to .db and clears .wal.
     */
    async checkpoint() {
        return this.execute(async () => {
            this.log("Performing Manual Checkpoint...");
            if (this.allocator) await this.allocator.saveState();
            if (this.pager) await this.pager.checkpoint();
        });
    }

    /**
     * Closes the database connection.
     * Waits for pending operations, saves state, CHECKS POINTS (Clears WAL), and closes file handles.
     */
    async close() {
        this.log("Closing Database...");
        
        // 1. Wait for all pending tasks to complete
        await this.executionQueue;
        
        // 2. Perform Final Checkpoint (Safe to delete WAL now)
        try {
            this.log("Final Checkpoint...");
            if (this.allocator) await this.allocator.saveState();
            if (this.pager) await this.pager.checkpoint();
        } catch (e) {
            console.error("B\"H: Error during final checkpoint:", e);
        }

        // 3. Close Pager (closes file)
        if (this.pager) {
            await this.pager.close();
        }
        
        this.log("Database Closed.");
    }

    async _readChainSafe(ptr) {
        if (!ptr) {
            this.log("_readChainSafe: Null pointer provided.");
            return null;
        }

        this.log(`Reading Chain: Block ${ptr.blockId}, Off ${ptr.offset}, Len ${ptr.length}, Chain? ${ptr.isChain}`);
        
        if (!ptr.isChain) {
            const block = await this.allocator.readBlockLocked(ptr.blockId);
            if (!block) return null;
            return block.subarray(ptr.offset, ptr.offset + ptr.length);
        } else {
            const endBlockId = Math.floor(((ptr.blockId * constants.BLOCK_SIZE) + ptr.offset + ptr.length - 1) / constants.BLOCK_SIZE);
            const blocksToRead = (endBlockId - ptr.blockId) + 1;
            
            this.log(`Reading ${blocksToRead} sequential blocks for chain.`);

            const rawChain = await this.allocator.readSequentialLocked(ptr.blockId, blocksToRead);
            const buffer = Buffer.alloc(ptr.length);
            
            let bufOffset = 0;
            let rem = ptr.length;
            
            for (let i = 0; i < blocksToRead; i++) {
                const blockView = rawChain.subarray(i * constants.BLOCK_SIZE, (i + 1) * constants.BLOCK_SIZE);
                const start = (i === 0) ? ptr.offset : constants.UNIT_SIZE;
                const avail = constants.BLOCK_SIZE - start;
                const copy = Math.min(rem, avail);
                
                blockView.copy(buffer, bufOffset, start, start + copy);
                bufOffset += copy;
                rem -= copy;
            }
            return buffer;
        }
    }

    async _writeChainSafe(ptr, buffer) {
        this.log(`Writing Chain: Block ${ptr.blockId}, Len ${buffer.length}`);
        
        if (!ptr.isChain) {
            await this.allocator.writeUserSpace(ptr, buffer);
        } else {
            let remaining = buffer;
            let currentBlock = ptr.blockId;
            
            while (remaining.length > 0) {
                const blk = await this.allocator.readBlockLocked(currentBlock);
                // Allocate overflow block if it doesn't exist (though allocator should have done this)
                if (!blk) throw new Error(`Chain Write: Missing Block ${currentBlock}`);

                const start = (currentBlock === ptr.blockId) ? ptr.offset : constants.UNIT_SIZE;
                const avail = constants.BLOCK_SIZE - start;
                const toWrite = Math.min(remaining.length, avail);
                
                remaining.subarray(0, toWrite).copy(blk, start);
                await this.allocator.writeBlockLocked(currentBlock, blk);
                
                remaining = remaining.subarray(toWrite);
                currentBlock++;
            }
        }
    }

    async _writeMetaValue(value) {
        // Serialize value to buffer
        const fullBuf = serializeValue(value, true);
        
        // Allocate space for Data
        const ptr = await this.allocator.allocate(fullBuf.length);
        
        // Write Data
        await this._writeChainSafe(ptr, fullBuf);
        
        // Create Meta Block (pointing to Data)
        const metaBuf = Buffer.alloc(32);
        // Type 0 = VALUE default in LiveHandle logic
        metaBuf.writeUInt8(0, 0); 
        this._writePtrToBuf(metaBuf, 1, ptr);
        
        const metaPtr = await this.allocator.allocate(32);
        await this.allocator.writeUserSpace(metaPtr, metaBuf);
        return metaPtr;
    }
    
    async _resolveValueFull(metaPtr) {
        // B"H: Stage 2 - Inline Value Support
        // If the B-Tree reader returned an inline value object (VAL_INLINE), 
        // we skip the disk read and decode the buffer directly.
        if (metaPtr && metaPtr.isInline) {
            const parser = require('./deserialize/parser.js');
            // metaPtr.data contains the raw serialized buffer [Type][Len][Data]
            // We pass it directly to the parser.
            return parser.parse(metaPtr.data);
        }

        // Standard Pointer Logic
        const metaBuf = await this._readChainSafe(metaPtr);
        if (!metaBuf) return undefined;

        const dataPtr = this._readPtrFromBuf(metaBuf, 1);
        if (!dataPtr) return undefined;

        const valBuf = await this._readChainSafe(dataPtr);
        if (!valBuf) return undefined;

        const parser = require('./deserialize/parser.js');
        return parser.parse(valBuf);
    }

    /**
     * Helper: Writes a pointer structure to a buffer.
     * Fixed size: 6 (Block) + 4 (Off) + 4 (Len) + 1 (Chain) = 15 bytes.
     */
    _writePtrToBuf(buf, offset, ptr) {
        writePointer48(buf, ptr.blockId, offset);
        buf.writeUInt32BE(ptr.offset, offset + 6);
        buf.writeUInt32BE(ptr.length, offset + 10);
        buf.writeUInt8(ptr.isChain ? 1 : 0, offset + 14);
    }
    
    _readPtrFromBuf(buf, offset) {
        if (!buf || offset + 15 > buf.length) return null;
        const b = readPointer48(buf, offset);
        const o = buf.readUInt32BE(offset + 6);
        const l = buf.readUInt32BE(offset + 10);
        const c = buf.readUInt8(offset + 14);
        
        // Valid pointer check: Length > 0
        if (l === 0) return null;
        
        return { blockId: b, offset: o, length: l, isChain: c === 1 };
    }

    async _loadRootTree() {
        const sb = await this.pager.readBlock(0);
        // B"H: Correct Offset is 64 (ROOT_PTR_OFFSET)
        const ROOT_OFFSET = 64; 
        
        const ptr = this._readPtrFromBuf(sb, ROOT_OFFSET);
        
        if (!ptr || ptr.length === 0) {
            this.log("No Root Tree found. Creating new.");
            const tree = new BTree(this.allocator);
            await tree.getRoot(); 
            await this._writeRootPtrToSB(tree.rootPtr);
            return tree;
        }
        
        return new BTree(this.allocator, ptr);
    }

    async _writeRootPtrToSB(ptr) {
        this.log(`Writing Root Ptr to SuperBlock: ${JSON.stringify(ptr)}`);
        const sb = await this.pager.readBlock(0);
        // B"H: Correct Offset is 64
        const ROOT_OFFSET = 64; 
        this._writePtrToBuf(sb, ROOT_OFFSET, ptr);
        await this.pager.writeBlock(0, sb);
    }
}

module.exports = AwtsmoosDB;