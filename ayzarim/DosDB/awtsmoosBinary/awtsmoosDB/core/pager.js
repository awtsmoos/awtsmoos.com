// B"H
/**
 * @file pager.js
 * @description
 *  The Sefirah of Yesod - The Physical Foundation.
 *  STRICTLY SYNCHRONOUS.
 *  Uses an LRU-like Dirty Cache to minimize fs.writeSync calls.
 */

const fs = require('fs');
const constants = require('../constants.js');
const Logger = require('../utils/centralLogger.js');

class SynchronousPager {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.fd = null;
        
        // RAM Limit ~20MB goal.
        // Block Size = 4KB.
        // Cache 1024 blocks = 4MB raw. Overhead ~5-6MB. Safe.
        this.CACHE_LIMIT = 1024; 
        
        // Map<blockId, Buffer>
        this.cache = new Map();
        
        // Set<blockId>
        this.dirtySet = new Set();
        
        this.knownFileSize = 0;
        this.ioWrites = 0;
        this.ioReads = 0;
    }

    init() {
        if (this.fd !== null) return;
        
        // Logger.log("[PAGER]", "Opening file synchronously...");
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, Buffer.alloc(0));
        }
        this.fd = fs.openSync(this.filePath, 'r+');
        this.knownFileSize = fs.fstatSync(this.fd).size;
    }

    readBlock(blockId) {
        if (this.fd === null) this.init();

        // 1. Memory Hit
        if (this.cache.has(blockId)) {
            return this.cache.get(blockId);
        }

        // 2. Disk Read
        this.ioReads++;
        const buffer = Buffer.allocUnsafe(constants.BLOCK_SIZE);
        const position = blockId * constants.BLOCK_SIZE;

        if (position >= this.knownFileSize) {
            buffer.fill(0);
        } else {
            const bytesRead = fs.readSync(this.fd, buffer, 0, constants.BLOCK_SIZE, position);
            if (bytesRead < constants.BLOCK_SIZE) {
                buffer.fill(0, bytesRead); // Zero remaining
            }
        }

        this._manageCache(blockId, buffer, false);
        return buffer;
    }

    writeBlock(blockId, buffer) {
        // Just cache it and mark dirty. Don't write to disk yet unless evicted.
        // This is the key to performance doubling.
        if (this.fd === null) this.init();
        
        const cachedBuf = Buffer.allocUnsafe(constants.BLOCK_SIZE);
        buffer.copy(cachedBuf); // Copy to own persistent buffer
        
        this._manageCache(blockId, cachedBuf, true);
    }

    _manageCache(blockId, buffer, isDirty) {
        // Simple eviction: If full, dump the first key (pseudo-LRU due to Map ordering in JS)
        if (this.cache.size >= this.CACHE_LIMIT) {
            // Find a block to evict
            const iterator = this.cache.keys();
            const firstId = iterator.next().value;
            
            // If the victim is dirty, we MUST write it now
            if (this.dirtySet.has(firstId)) {
                this._flushBlock(firstId, this.cache.get(firstId));
            }
            
            this.cache.delete(firstId);
            this.dirtySet.delete(firstId);
        }

        this.cache.set(blockId, buffer);
        if (isDirty) this.dirtySet.add(blockId);
    }

    _flushBlock(blockId, buffer) {
        this.ioWrites++;
        const position = blockId * constants.BLOCK_SIZE;
        fs.writeSync(this.fd, buffer, 0, constants.BLOCK_SIZE, position);
        
        const endPos = position + constants.BLOCK_SIZE;
        if (endPos > this.knownFileSize) this.knownFileSize = endPos;
    }

    // Force all dirty blocks to disk (Called on batch end or close)
    fsync() {
        if (this.fd === null) return;
        
        if (this.dirtySet.size > 0) {
            // Logger.log("[PAGER]", `Flushing ${this.dirtySet.size} dirty blocks...`);
            for (const blockId of this.dirtySet) {
                const buf = this.cache.get(blockId);
                this._flushBlock(blockId, buf);
            }
            this.dirtySet.clear();
            fs.fsyncSync(this.fd);
        }
    }
    
    close() {
        if (this.fd !== null) {
            this.fsync();
            fs.closeSync(this.fd);
            this.fd = null;
        }
        this.cache.clear();
        this.dirtySet.clear();
        // Logger.log("[PAGER]", `Closed. Stats: ${this.ioReads} reads, ${this.ioWrites} writes.`);
    }
}

module.exports = SynchronousPager;