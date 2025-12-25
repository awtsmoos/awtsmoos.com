//B"H
/**
 * @file io.js
 * @description
 *  The Sefirah of Yesod - The Foundation of Transmission.
 *  Handles physical data block reads/writes and structure-level caching.
 */

const constants = require('../../constants.js');

module.exports = {
    /**
     * @description 
     *  Safely reads a segment of data that may span multiple blocks.
     *  Ensures that even if data overflows a single block, it is correctly gathered.
     */
    readChainSafe: async (db, ptr) => {
        if (!ptr || ptr.blockId === 0) return null;

        const totalSize = ptr.length || constants.BLOCK_SIZE;
        // B"H: Correct Offset logic - if offset is 0, start at HEADER_SIZE
        const startOffset = (ptr.offset === 0) ? constants.HEADER_SIZE : (ptr.offset || constants.HEADER_SIZE);
        
        // B"H: Optimization - Single Block Read
        const firstBlockAvailable = constants.BLOCK_SIZE - startOffset;
        if (totalSize <= firstBlockAvailable) {
            const block = await db.allocator.v1.readBlockLocked(ptr.blockId, true);
            if (!block) return null;
            const copy = Buffer.allocUnsafe(totalSize);
            block.copy(copy, 0, startOffset, startOffset + totalSize);
            return copy;
        }

        // B"H: Multi-Block Chain Read
        const megaBuffer = Buffer.allocUnsafe(totalSize);
        let bytesGathered = 0;
        let currentBlockId = ptr.blockId;

        while (bytesGathered < totalSize) {
            const block = await db.allocator.v1.readBlockLocked(currentBlockId, true);
            if (!block) break;

            const isFirst = bytesGathered === 0;
            // B"H: Subsequent blocks in a chain ALWAYS skip HEADER_SIZE.
            const readStart = isFirst ? startOffset : constants.HEADER_SIZE;
            const readAvailable = constants.BLOCK_SIZE - readStart;
            const chunkToCopy = Math.min(totalSize - bytesGathered, readAvailable);

            if (chunkToCopy <= 0) break;

            block.copy(megaBuffer, bytesGathered, readStart, readStart + chunkToCopy);
            bytesGathered += chunkToCopy;
            currentBlockId++;
        }

        return bytesGathered === totalSize ? megaBuffer : megaBuffer.subarray(0, bytesGathered);
    },

    /**
     * @description
     *  Safely writes a buffer across a chain of blocks, respecting headers and boundaries.
     */
    writeChainSafe: async (db, ptr, data) => {
        if (!ptr || ptr.blockId === 0) return;
        
        let bytesWritten = 0;
        let currentBlockId = ptr.blockId;

        while (bytesWritten < data.length) {
            const isFirst = bytesWritten === 0;
            // B"H: Protection - Start at 64 if offset is 0
            const writeStart = isFirst ? (ptr.offset || constants.HEADER_SIZE) : constants.HEADER_SIZE;
            const writeAvail = constants.BLOCK_SIZE - writeStart;
            const chunk = Math.min(data.length - bytesWritten, writeAvail);

            let block = await db.allocator.v1.readBlockLocked(currentBlockId, false);
            if (!block) {
                block = db.allocator.v1.formatBlock(ptr.isChain ? constants.BLOCK_TYPE.OVERFLOW : constants.BLOCK_TYPE.PAGE);
            }

            data.copy(block, writeStart, bytesWritten, bytesWritten + chunk);
            
            // B"H: Invalidate caches before writing to physical realm
            db.allocator.v1.invalidateCache(currentBlockId);
            await db.allocator.v1.writeBlockLocked(currentBlockId, block);
            
            bytesWritten += chunk;
            currentBlockId++;
        }
    },

    cacheStructure(db, ptrOrId, node) {
        const blockId = (typeof ptrOrId === 'object') ? ptrOrId.blockId : ptrOrId;
        const offset = (typeof ptrOrId === 'object') ? (ptrOrId.offset || 0) : 0;
        
        const key = blockId + ':' + offset;
        if (db.structureCache.size >= db.STRUCT_CACHE_LIMIT) {
             const it = db.structureCache.keys();
             db.structureCache.delete(it.next().value);
        }
        db.structureCache.set(key, node);
    },

    getCachedStructure(db, ptrOrId) {
        const blockId = (typeof ptrOrId === 'object') ? ptrOrId.blockId : ptrOrId;
        const offset = (typeof ptrOrId === 'object') ? (ptrOrId.offset || 0) : 0;
        const key = blockId + ':' + offset;
        return db.structureCache.get(key);
    },

    evictStructure(db, ptrOrId) {
        const blockId = (typeof ptrOrId === 'object') ? ptrOrId.blockId : ptrOrId;
        const offset = (typeof ptrOrId === 'object') ? (ptrOrId.offset || 0) : 0;
        const key = blockId + ':' + offset;
        db.structureCache.delete(key);
    }
};