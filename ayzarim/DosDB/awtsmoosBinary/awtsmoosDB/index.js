
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
    }

    async close() {
        await this.waitForIdle(); // Ensure flush
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
                // B"H: Flush all caches before commit
                if (this.vector && this.vector.indexes) {
                    for (const index of this.vector.indexes.values()) {
                        await index.flushCache();
                    }
                }
                if (this.allocator) {
                    await this.allocator.flushHeap(); // Flush small objects
                    if (this.allocator.v1) await this.allocator.v1.flush(); // Flush block allocator active page
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
            // B"H: Flush HNSW Caches
            if (this.vector && this.vector.indexes) {
                for (const index of this.vector.indexes.values()) {
                    await index.flushCache();
                }
            }
            // B"H: Flush Allocators
            if (this.allocator) {
                await this.allocator.flushHeap();
                if (this.allocator.v1) await this.allocator.v1.flush();
            }
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
        if (!raw) return null; 

        const buf = Buffer.allocUnsafe(totalSize); 
        
        let readOff = 0; 
        let writeOff = 0; 
        let remaining = totalSize;

        for(let i=0; i<blocksNeeded; i++) {
            const start = (i===0) ? startOffset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining, avail);
            
            if (readOff + start + chunk > raw.length) {
                break;
            }
            
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
        
        while(remaining.length > 0) {
            const start = (isFirst && ptr.offset) ? ptr.offset : constants.HEADER_SIZE;
            const avail = constants.BLOCK_SIZE - start;
            const chunk = Math.min(remaining.length, avail);
            
            // B"H: ATOMIC READ-MODIFY-WRITE FIX
            // We must hold the allocator lock for the entire duration of reading the block,
            // modifying it, and writing it back. This prevents race conditions where
            // concurrent writes to the same block (e.g., activePage) overwrite each other.
            await this.allocator.v1.executeLocked(async () => {
                let blk;
                
                // Optimization: If writing a full block from 0, no need to read.
                if (start === 0 && chunk === constants.BLOCK_SIZE) {
                    blk = Buffer.allocUnsafe(constants.BLOCK_SIZE);
                } else {
                    // Use _readBlockSynced (internal) to avoid recursive locking issues if any (though lock is reentrant)
                    blk = await this.allocator.v1._readBlockSynced(currentBlock);
                    if (!blk) {
                         blk = Buffer.allocUnsafe(constants.BLOCK_SIZE);
                         blk.fill(0); 
                    }
                }
    
                remaining.subarray(0, chunk).copy(blk, start);
                await this.allocator.v1._writeBlockSynced(currentBlock, blk);
            });
            
            remaining = remaining.subarray(chunk);
            currentBlock++;
            isFirst = false;
        }
    }
}

module.exports = AwtsmoosDB_V2;
