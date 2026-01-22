// B"H
/**
 * @file io.js
 * @description 
 *  The Sefirah of Da'at (Knowledge). The Bridge of I/O.
 *  Strictly Synchronous.
 *  CRITICAL FIX: Updates Allocator context when writing to shared blocks.
 */
const constants = require('../../constants.js');

module.exports = {
    readChainSafe: (db, ptr) => {
        if (!ptr || ptr.blockId === undefined) return null;
        
        const blockId = Number(ptr.blockId);
        if (blockId < 0) return null;

        const totalSize = ptr.length || constants.BLOCK_SIZE;
        // B"H: Reliable offset determination. Root and structure headers often start at HEADER_SIZE (32).
        const startOffset = (ptr.offset === 0 && !ptr.isChain) ? constants.HEADER_SIZE : (ptr.offset || 0);
        
        const firstBlockAvailable = constants.BLOCK_SIZE - startOffset;
        let resultBuffer = Buffer.allocUnsafe(totalSize);
        
        // B"H: Use the Cache-Coherent Reader from Allocator
        const block = db.allocator.v1.readBlockLocked(blockId);
        
        if (!block) {
            return null;
        }

        // Single Block Read
        if (totalSize <= firstBlockAvailable) {
            if (startOffset + totalSize > block.length) {
                return null;
            }
            block.copy(resultBuffer, 0, startOffset, startOffset + totalSize);
        } else {
            // Chained Read
            let bytesGathered = 0;
            let currentBlockId = blockId;

            while (bytesGathered < totalSize) {
                const blk = (currentBlockId === blockId) ? block : db.allocator.v1.readBlockLocked(currentBlockId);
                const isFirst = bytesGathered === 0;
                const readStart = isFirst ? startOffset : constants.HEADER_SIZE;
                const readAvailable = constants.BLOCK_SIZE - readStart;
                const chunkToCopy = Math.min(totalSize - bytesGathered, readAvailable);

                if (chunkToCopy <= 0) break;
                
                if (blk) {
                    blk.copy(resultBuffer, bytesGathered, readStart, readStart + chunkToCopy);
                } else {
                    resultBuffer.fill(0, bytesGathered); 
                }
                
                bytesGathered += chunkToCopy;
                currentBlockId++;
            }
        }
        return resultBuffer;
    },

    writeChainSafe: (db, ptr, data) => {
        if (!ptr || ptr.blockId === undefined) return;
        
        const blockId = Number(ptr.blockId);
        const startOffset = (ptr.offset === 0 && !ptr.isChain) ? constants.HEADER_SIZE : (ptr.offset || 0);
        
        let bytesWritten = 0;
        let currentBlockId = blockId;

        while (bytesWritten < data.length) {
            const isFirst = bytesWritten === 0;
            const writeStart = isFirst ? startOffset : constants.HEADER_SIZE;
            const writeAvail = constants.BLOCK_SIZE - writeStart;
            const chunk = Math.min(data.length - bytesWritten, writeAvail);

            let block = db.allocator.v1.readBlockLocked(currentBlockId);
            
            if (!block) {
                block = Buffer.alloc(constants.BLOCK_SIZE); 
            }
            
            data.copy(block, writeStart, bytesWritten, bytesWritten + chunk);
            
            // SYNC 1: Update Pager (The Disk Cache)
            db.pager.writeBlock(currentBlockId, block);
            
            // SYNC 2: Update Allocator Active Page (The RAM Hot-Path)
            if (db.allocator.v1.activePage.id === currentBlockId) {
                block.copy(db.allocator.v1.activePage.buffer);
            }
            
            bytesWritten += chunk;
            currentBlockId++;
        }
    }
};