//B"H
/**
 * @file io.js
 * @description
 *  Physical block I/O. Strictly immediate transmission.
 */

const constants = require('../../constants.js');

module.exports = {
    /**
     * @description Reads a sequence of data spanning block boundaries.
     */
    readChainSafe: (db, ptr) => {
        if (!ptr || ptr.blockId === 0) return null;

        const totalSize = ptr.length || constants.BLOCK_SIZE;
        const startOffset = (ptr.offset === 0) ? constants.HEADER_SIZE : (ptr.offset || constants.HEADER_SIZE);
        
        const firstBlockAvailable = constants.BLOCK_SIZE - startOffset;
        if (totalSize <= firstBlockAvailable) {
            const block = db.pager.readBlock(ptr.blockId);
            const copy = Buffer.allocUnsafe(totalSize);
            block.copy(copy, 0, startOffset, startOffset + totalSize);
            return copy;
        }

        const megaBuffer = Buffer.allocUnsafe(totalSize);
        let bytesGathered = 0;
        let currentBlockId = ptr.blockId;

        while (bytesGathered < totalSize) {
            const block = db.pager.readBlock(currentBlockId);
            const isFirst = bytesGathered === 0;
            const readStart = isFirst ? startOffset : constants.HEADER_SIZE;
            const readAvailable = constants.BLOCK_SIZE - readStart;
            const chunkToCopy = Math.min(totalSize - bytesGathered, readAvailable);

            if (chunkToCopy <= 0) break;
            block.copy(megaBuffer, bytesGathered, readStart, readStart + chunkToCopy);
            bytesGathered += chunkToCopy;
            currentBlockId++;
        }

        return megaBuffer;
    },

    /**
     * @description Persists data across block boundaries.
     */
    writeChainSafe: (db, ptr, data) => {
        if (!ptr || ptr.blockId === 0) return;
        
        let bytesWritten = 0;
        let currentBlockId = ptr.blockId;

        while (bytesWritten < data.length) {
            const isFirst = bytesWritten === 0;
            const writeStart = isFirst ? (ptr.offset || constants.HEADER_SIZE) : constants.HEADER_SIZE;
            const writeAvail = constants.BLOCK_SIZE - writeStart;
            const chunk = Math.min(data.length - bytesWritten, writeAvail);

            let block = db.pager.readBlock(currentBlockId);
            data.copy(block, writeStart, bytesWritten, bytesWritten + chunk);
            
            db.pager.writeBlock(currentBlockId, block);
            
            bytesWritten += chunk;
            currentBlockId++;
        }
    }
};
