
// B"H
/**
 * @file io.js
 * @description 
 *  The Sefirah of Da'at (Knowledge). The Bridge of I/O.
 *  Strictly Synchronous.
 * 
 *  THE TIKKUN OF SINGULAR TRUTH:
 *  The Pager's cache is the absolute, unified source of active memory. 
 *  This I/O bridge now speaks ONLY to the Pager, eliminating all redundant 
 *  synchronization logic and banishing the `TypeError` forever.
 */
const constants = require('../../constants.js');

module.exports = {
    readChainSafe: (db, ptr) => {
        if (!ptr || ptr.blockId === undefined) return null;
        
        const blockId = Number(ptr.blockId);
        if (blockId < 0) return null;

        const totalSize = ptr.length || constants.BLOCK_SIZE;
        const startOffset = (ptr.offset === 0 && !ptr.isChain) ? constants.HEADER_SIZE : (ptr.offset || 0);
        
        const firstBlockAvailable = constants.BLOCK_SIZE - startOffset;
        let resultBuffer = Buffer.allocUnsafe(totalSize);
        
        const block = db.allocator.v1.readBlockLocked(blockId);
        
        if (!block) {
            return null;
        }

        if (totalSize <= firstBlockAvailable) {
            if (startOffset + totalSize > block.length) {
                return null;
            }
            block.copy(resultBuffer, 0, startOffset, startOffset + totalSize);
        } else {
            let bytesWritten = 0;
            let currentBlockId = blockId;

            while (bytesWritten < totalSize) {
                const blk = (currentBlockId === blockId) ? block : db.allocator.v1.readBlockLocked(currentBlockId);
                const isFirst = bytesWritten === 0;
                const readStart = isFirst ? startOffset : constants.HEADER_SIZE;
                const readAvailable = constants.BLOCK_SIZE - readStart;
                const chunkToCopy = Math.min(totalSize - bytesWritten, readAvailable);

                if (chunkToCopy <= 0) break;
                
                if (blk) {
                    blk.copy(resultBuffer, bytesWritten, readStart, readStart + chunkToCopy);
                } else {
                    resultBuffer.fill(0, bytesWritten); 
                }
                
                bytesWritten += chunkToCopy;
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
            
            // B"H: The Pager is the one true gatekeeper. All writes flow through it.
            db.pager.writeBlock(currentBlockId, block);
            
            bytesWritten += chunk;
            currentBlockId++;
        }
    }
};
