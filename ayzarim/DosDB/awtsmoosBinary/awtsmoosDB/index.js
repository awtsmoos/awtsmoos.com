
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

class AwtsmoosDB_V2 {
    constructor(filePath, options = {}) {
        this.pager = new Pager(filePath);
        this.allocator = new AllocatorV2(this.pager, this);
        this.lock = new ReadWriteLock();
        this.root = null; 
        this.rootPtrRaw = null;
        this.debug = options.debug || false; 
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.debugBlocks = new Set();
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
            const rootPtr = await dict.create(); // This is a SmartPointer Buffer
            
            // Decode to get details for SuperBlock storage
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
    }

    async close() {
        await this.pager.close();
        this.root = null;
    }

    async execute(fn) {
        return this.lock.runWrite(fn);
    }

    async batch(fn) {
        return this.lock.runWrite(async () => {
            this.pager.startBatch();
            try {
                await fn();
            } finally {
                await this.pager.endBatch();
            }
        });
    }

    async read(fn) {
        return this.lock.runRead(fn);
    }

    async waitForIdle() { 
        return this.lock.runWrite(async () => {
            // B"H: Group Commit - Sync to disk when idle
            await this.pager.sync();
        });
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
        if (!raw) return null; // B"H: Safety Check against corruption

        const buf = Buffer.allocUnsafe(totalSize); // B"H: Optimization - allocUnsafe since we copy into it
        
        let readOff = 0; 
        let writeOff = 0; 
        let remaining = totalSize;

        for(let i=0; i<blocksNeeded; i++) {
            const start = (i===0) ? startOffset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining, avail);
            
            // B"H: Boundary check
            if (readOff + start + chunk > raw.length) {
                // If raw buffer is smaller than expected, partial fill or fail?
                // For safety, break and return what we have (or null if critical).
                // Usually indicates corruption or partial write recovery.
                break;
            }
            
            raw.copy(buf, writeOff, readOff + start, readOff + start + chunk);
            
            writeOff += chunk;
            remaining -= chunk;
            readOff += constants.BLOCK_SIZE;
        }
        
        // If we allocated unsafe and didn't fill completely due to break, the end is garbage.
        // But totalSize should match what's available.
        return buf;
    }

    async _writeChainSafe(ptr, buffer) {
        let remaining = buffer;
        let currentBlock = ptr.blockId;
        let isFirst = true;
        
        while(remaining.length > 0) {
            const start = (isFirst && ptr.offset) ? ptr.offset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining.length, avail);
            
            let blk;
            // Optimization: If writing full block, skip read.
            if (start === 0 && chunk === constants.BLOCK_SIZE) {
                blk = Buffer.allocUnsafe(constants.BLOCK_SIZE);
            } else {
                blk = await this.allocator.v1.readBlockLocked(currentBlock);
                if (!blk) {
                     blk = Buffer.allocUnsafe(constants.BLOCK_SIZE);
                     blk.fill(0); // Zero out if new block
                }
            }

            remaining.subarray(0, chunk).copy(blk, start);
            await this.allocator.v1.writeBlockLocked(currentBlock, blk);
            
            remaining = remaining.subarray(chunk);
            currentBlock++;
            isFirst = false;
        }
    }
}

module.exports = AwtsmoosDB_V2;
