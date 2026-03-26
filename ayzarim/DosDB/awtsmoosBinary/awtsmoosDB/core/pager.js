
// B"H
/**
 * @file pager.js
 * @description
 *  The Sefirah of Yesod - The Physical Foundation.
 *  STRICTLY SYNCHRONOUS.
 * 
 *  THE TIKKUN OF THE SCRIBE'S JOURNAL:
 *  During a batch, the Scribe no longer carves the stone with every command.
 *  He records the decrees in a temporary `writeJournal`. When the batch ends,
 *  he sorts the decrees, merges adjacent commands into a single scroll,
 *  and performs the Great Inscription in one linear, lightning-fast motion.
 */

const fs = require('fs');
const constants = require('../constants.js');

class SynchronousPager {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.fd = null;
        
        this.CACHE_LIMIT = 1024; 
        this.BATCH_LIMIT = 4096; 
        this.isBatching = false; 
        
        this.cache = new Map();
        
        // B"H: The Scribe's Journal. Key: blockId, Value: Buffer
        this.writeJournal = new Map();
        
        this.knownFileSize = 0;
        this.ioWrites = 0;
        this.ioReads = 0;
    }

    init() {
        if (this.fd !== null) return;
        
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, Buffer.alloc(0));
        }
        this.fd = fs.openSync(this.filePath, 'r+');
        this.knownFileSize = fs.fstatSync(this.fd).size;
    }

    readBlock(blockId) {
        if (this.fd === null) this.init();

        // 1. Journal Hit (Highest Priority)
        if (this.writeJournal.has(blockId)) {
            return this.writeJournal.get(blockId);
        }
        
        // 2. Memory Cache Hit
        if (this.cache.has(blockId)) {
            return this.cache.get(blockId);
        }

        // 3. Disk Read
        this.ioReads++;
        const buffer = Buffer.allocUnsafe(constants.BLOCK_SIZE);
        const position = blockId * constants.BLOCK_SIZE;

        if (position >= this.knownFileSize) {
            buffer.fill(0);
        } else {
            const bytesRead = fs.readSync(this.fd, buffer, 0, constants.BLOCK_SIZE, position);
            if (bytesRead < constants.BLOCK_SIZE) {
                buffer.fill(0, bytesRead); 
            }
        }

        this._manageCache(blockId, buffer);
        return buffer;
    }

    writeBlock(blockId, buffer) {
        if (this.fd === null) this.init();
        
        // B"H: During a batch, all decrees are written to the ephemeral journal.
        if (this.isBatching) {
            const journalBuf = Buffer.allocUnsafe(constants.BLOCK_SIZE);
            buffer.copy(journalBuf);
            this.writeJournal.set(blockId, journalBuf);
            return;
        }
        
        // --- Standard (Non-Batch) Write Path ---
        let cachedBuf = this.cache.get(blockId);
        
        if (cachedBuf) {
            buffer.copy(cachedBuf);
            this.cache.delete(blockId);
            this.cache.set(blockId, cachedBuf);
        } else {
            cachedBuf = Buffer.allocUnsafe(constants.BLOCK_SIZE);
            buffer.copy(cachedBuf); 
            this._manageCache(blockId, cachedBuf);
        }
        
        // Direct synchronous flush for non-batched operations
        this._flushRun(blockId, [cachedBuf]);
    }

    _manageCache(blockId, buffer) {
        const limit = this.CACHE_LIMIT;
        
        if (this.cache.size >= limit && !this.cache.has(blockId)) {
            const keyToEvict = this.cache.keys().next().value;
            this.cache.delete(keyToEvict);
        }

        this.cache.set(blockId, buffer);
    }

    _flushRun(startBlockId, blocks) {
        if (blocks.length === 0) return;
        this.ioWrites++;
        
        const position = startBlockId * constants.BLOCK_SIZE;
        const runSize = blocks.length * constants.BLOCK_SIZE;

        if (blocks.length === 1) {
            fs.writeSync(this.fd, blocks[0], 0, constants.BLOCK_SIZE, position);
        } else {
            const megaBuffer = Buffer.concat(blocks);
            fs.writeSync(this.fd, megaBuffer, 0, runSize, position);
        }
        
        if (position + runSize > this.knownFileSize) {
            this.knownFileSize = position + runSize;
        }
    }
    
    _applyJournal() {
        if (this.writeJournal.size === 0) return;
        
        const sortedIds = Array.from(this.writeJournal.keys()).sort((a, b) => a - b);
        
        let currentRun = [];
        let startBlockId = -1;

        for (let i = 0; i < sortedIds.length; i++) {
            const blockId = sortedIds[i];
            const buf = this.writeJournal.get(blockId);

            // Update the permanent cache
            this._manageCache(blockId, buf);

            if (currentRun.length === 0) {
                startBlockId = blockId;
                currentRun.push(buf);
            } else if (blockId === startBlockId + currentRun.length) {
                currentRun.push(buf);
            } else {
                this._flushRun(startBlockId, currentRun);
                startBlockId = blockId;
                currentRun = [buf];
            }
        }
        
        if (currentRun.length > 0) {
            this._flushRun(startBlockId, currentRun);
        }
        
        this.writeJournal.clear();
    }

    fsync(hard = false) {
        if (this.fd === null) return;
        
        this._applyJournal();
        
        if (!this.isBatching && this.cache.size > this.CACHE_LIMIT) {
            this._shrinkCache();
        }
        
        if (hard) fs.fsyncSync(this.fd);
    }
    
    _shrinkCache() {
        // No-op in this model as non-dirty pages aren't tracked separately
    }

    close() {
        if (this.fd !== null) {
            this.fsync(true); 
            fs.closeSync(this.fd);
            this.fd = null;
        }
        this.cache.clear();
        this.writeJournal.clear();
    }
}

module.exports = SynchronousPager;
