//B"H
/**
 * @file pager.js
 * @description
 *  The Sefirah of Yesod - The Synchronous Foundation.
 *  Uses strictly synchronous I/O to unify the Hand and the Disk.
 */

const fs = require('fs');
const constants = require('../constants.js');

class SynchronousPager {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.fd = null;
        this.cache = new Map();
        // B"H: Capped for 20MB limit. 256 * 4KB = 1MB cache.
        this.CACHE_LIMIT = 256; 
        this.knownFileSize = 0;
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
        if (this.cache.has(blockId)) return this.cache.get(blockId);

        const buffer = Buffer.allocUnsafe(constants.BLOCK_SIZE);
        const position = blockId * constants.BLOCK_SIZE;

        if (position >= this.knownFileSize) {
            buffer.fill(0);
        } else {
            const bytesRead = fs.readSync(this.fd, buffer, 0, constants.BLOCK_SIZE, position);
            if (bytesRead < constants.BLOCK_SIZE) buffer.fill(0, bytesRead);
        }

        this._addToCache(blockId, buffer);
        return buffer;
    }

    writeBlock(blockId, buffer) {
        if (this.fd === null) this.init();
        const position = blockId * constants.BLOCK_SIZE;
        fs.writeSync(this.fd, buffer, 0, constants.BLOCK_SIZE, position);
        
        const endPos = position + constants.BLOCK_SIZE;
        if (endPos > this.knownFileSize) this.knownFileSize = endPos;

        this._addToCache(blockId, buffer);
        fs.fsyncSync(this.fd); // B"H: Instant persistence
    }

    _addToCache(blockId, buffer) {
        if (this.cache.size >= this.CACHE_LIMIT) {
            const first = this.cache.keys().next().value;
            this.cache.delete(first);
        }
        this.cache.set(blockId, buffer);
    }

    truncate(blockCount) {
        if (this.fd === null) this.init();
        const size = blockCount * constants.BLOCK_SIZE;
        fs.ftruncateSync(this.fd, size);
        this.knownFileSize = size;
        this.cache.clear();
    }

    close() {
        if (this.fd !== null) {
            fs.closeSync(this.fd);
            this.fd = null;
        }
        this.cache.clear();
    }
}

module.exports = SynchronousPager;
