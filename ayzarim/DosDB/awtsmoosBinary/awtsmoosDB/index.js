
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
        // B"H: Debug Blocks disabled
        this.debugBlocks = new Set([/* 13, 18, 23, 28, 33 */]);
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

    // B"H: High-Performance Batch Mode
    // Disables WAL syncing for duration of fn(), then syncs once.
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
        return this.lock.runWrite(async () => {});
    }

    async _readChainSafe(ptr) {
        if (!ptr || !ptr.blockId) return null;
        
        const totalSize = ptr.length || constants.BLOCK_SIZE;
        const startOffset = ptr.offset || 0;
        
        if (this.debugBlocks.has(ptr.blockId)) {
             console.log(`B"H _readChainSafe B${ptr.blockId} Off=${startOffset} Len=${totalSize}`);
        }

        const firstBlockCap = constants.BLOCK_SIZE - startOffset;
        let blocksNeeded = 1;
        
        if (totalSize > firstBlockCap) {
            const remainingAfterFirst = totalSize - firstBlockCap;
            const subsequentBlockCap = constants.BLOCK_SIZE - constants.HEADER_SIZE;
            blocksNeeded += Math.ceil(remainingAfterFirst / subsequentBlockCap);
        }

        const raw = await this.allocator.v1.readSequentialLocked(ptr.blockId, blocksNeeded);
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
        
        if (this.debugBlocks.has(ptr.blockId)) {
             const preview = buf.toString('hex', 0, 8);
             console.log(`B"H _readChainSafe B${ptr.blockId} Data=${preview}`);
        }
        
        return buf;
    }

    async _writeChainSafe(ptr, buffer) {
        let remaining = buffer;
        let currentBlock = ptr.blockId;
        let isFirst = true;
        
        if (this.debugBlocks.has(ptr.blockId)) {
             const preview = buffer.toString('hex', 0, 8);
             console.log(`B"H _writeChainSafe B${ptr.blockId} Off=${ptr.offset} Len=${buffer.length} Data=${preview}`);
        }

        while(remaining.length > 0) {
            const start = (isFirst && ptr.offset) ? ptr.offset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining.length, avail);
            
            let blk = await this.allocator.v1.readBlockLocked(currentBlock);
            if (!blk) {
                 console.error(`B"H CRITICAL: _writeChainSafe missing block B${currentBlock}.`);
                 throw new Error(`Critical: Block B${currentBlock} missing during chain write.`);
            }

            remaining.subarray(0, chunk).copy(blk, start);
            await this.allocator.v1.writeBlockLocked(currentBlock, blk);
            
            // B"H: Verify Immediate Readback for debug target blocks
            if (this.debugBlocks.has(currentBlock)) {
                const verify = await this.allocator.v1.readBlockLocked(currentBlock);
                const written = verify.subarray(start, start + chunk);
                const expected = remaining.subarray(0, chunk);
                if (written.compare(expected) !== 0) {
                    console.error(`B"H CRITICAL: Write Verification Failed on Block ${currentBlock}! Disk/Cache Mismatch.`);
                } else {
                    console.log(`B"H Block ${currentBlock} Write Verified.`);
                }
            }

            remaining = remaining.subarray(chunk);
            currentBlock++;
            isFirst = false;
        }
    }
}

module.exports = AwtsmoosDB_V2;
