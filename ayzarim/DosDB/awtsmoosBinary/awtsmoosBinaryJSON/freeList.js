//B"H
// B"H
const writeConditional = require("./helpers/writeConditional.js");
const readConditional = require("./helpers/readConditional.js");
const { packedLength } = require("./packing/packedLength.js");

const FREE_LIST_ENTRY_HEADER_SIZE = 2; // 1 byte for packed sizes, 1 byte reserved/flags (maybe later)
const MIN_FREE_BLOCK_SIZE_FOR_REUSE = FREE_LIST_ENTRY_HEADER_SIZE + 1 + 1; // Header + min 1 byte size + min 1 byte next offset

// Structure of a free block entry (stored at the *start* of the free space):
// [ packedSizes (1 byte: sizeOf_blockSize(4 bits) | sizeOf_nextOffset(4 bits)) ]
// [ flags (1 byte, future use) ] // Currently unused = 0
// [ blockSize (variable, size indicated by packedSizes) ]
// [ nextFreeOffset (variable, size indicated by packedSizes, 0 means end of list) ]

function readFreeBlock(buffer, offset) {
    if (offset === 0 || offset >= buffer.length) {
        return null; // End of list or invalid offset
    }
    try {
        const packedSizesByte = buffer.readUInt8(offset);
        //const flags = buffer.readUInt8(offset + 1); // Reserved for now

        const sizeOfBlockSizePacked = (packedSizesByte >> 4) & 0x0F;
        const sizeOfNextOffsetPacked = packedSizesByte & 0x0F;

        const sizeOfBlockSize = unpackLength(sizeOfBlockSizePacked);
        const sizeOfNextOffset = unpackLength(sizeOfNextOffsetPacked);

        let currentReadOffset = offset + FREE_LIST_ENTRY_HEADER_SIZE;

        const blockSize = readConditional.readUIntBuffer(buffer, currentReadOffset, sizeOfBlockSize);
        currentReadOffset += sizeOfBlockSize;

        const nextFreeOffset = readConditional.readUIntBuffer(buffer, currentReadOffset, sizeOfNextOffset);

        return {
            entryOffset: offset,
            blockSize: blockSize,
            nextFreeOffset: nextFreeOffset,
            headerSize: FREE_LIST_ENTRY_HEADER_SIZE,
            totalEntrySize: FREE_LIST_ENTRY_HEADER_SIZE + sizeOfBlockSize + sizeOfNextOffset // Size of the metadata *within* the free block
        };
    } catch (e) {
        console.error("B\"H - Error reading free block at offset:", offset, e);
        return null;
    }
}

function writeFreeBlock(buffer, offset, blockSize, nextFreeOffset) {
    try {
        const blockSizeInfo = writeConditional(blockSize);
        const nextOffsetInfo = writeConditional(nextFreeOffset);

        const packedSizesByte = (
            (packedLength(blockSizeInfo.size) << 4) |
            packedLength(nextOffsetInfo.size)
        );

        let currentWriteOffset = offset;
        buffer.writeUInt8(packedSizesByte, currentWriteOffset);
        currentWriteOffset++;
        buffer.writeUInt8(0, currentWriteOffset); // Flags byte
        currentWriteOffset++;


        blockSizeInfo.buffer.copy(buffer, currentWriteOffset);
        currentWriteOffset += blockSizeInfo.size;

        nextOffsetInfo.buffer.copy(buffer, currentWriteOffset);
        currentWriteOffset += nextOffsetInfo.size;

        return currentWriteOffset - offset; // Return size of header written
    } catch (e) {
        console.error("B\"H - Error writing free block at offset:", offset, e);
        throw e;
    }
}

// Finds the first free block large enough. Returns { block: freeBlockInfo, prevOffset: offsetOfPreviousBlock }
// freeListHeadOffset should be the *value* of the offset, read from the footer.
function findFreeSlot(buffer, freeListHeadOffset, sizeNeeded) {
    let currentOffset = freeListHeadOffset;
    let prevOffset = 0; // Indicates head

    while (currentOffset !== 0) {
        const block = readFreeBlock(buffer, currentOffset);
        if (!block) break; // End of list or error

        // Check if the total block size (including its own header) is sufficient
        if (block.blockSize >= sizeNeeded) {
            return { block, prevOffset };
        }

        prevOffset = currentOffset;
        currentOffset = block.nextFreeOffset;
    }
    return null; // No suitable block found
}

// Updates the free list after using a part of a block.
// Returns the actual offset where data can be written.
// NOTE: Modifies the buffer directly. Needs the *footer object* to update the head if necessary.
function useFreeSlot(buffer, footerInfo, foundSlot, sizeUsed) {
    const { block, prevOffset } = foundSlot;
    const remainingSize = block.blockSize - sizeUsed;
    const dataWriteOffset = block.entryOffset; // Data starts where the free block *was*

    if (remainingSize < MIN_FREE_BLOCK_SIZE_FOR_REUSE) {
        // Not enough space left to be a usable free block, remove it from the list
        if (prevOffset === 0) { // Removing the head
            footerInfo.freeListHeadOffset = block.nextFreeOffset;
        } else {
            // Update previous block's next pointer to skip the used block
            const prevBlock = readFreeBlock(buffer, prevOffset);
            if (prevBlock) {
                writeFreeBlock(buffer, prevBlock.entryOffset, prevBlock.blockSize, block.nextFreeOffset);
            } else {
                console.error("B\"H - Error: Could not read previous block at", prevOffset, "when trying to remove block at", block.entryOffset);
                // Attempt recovery? Maybe just leave the dangling pointer for now.
            }
        }
        // The entire block is now 'data', no free block header remains here.
    } else {
        // Enough space remains, create a new free block header *after* the used space
        const newFreeBlockOffset = block.entryOffset + sizeUsed;
        writeFreeBlock(buffer, newFreeBlockOffset, remainingSize, block.nextFreeOffset);

        // Update the list pointer to point to this *new* header location
        if (prevOffset === 0) { // The original block was the head
            footerInfo.freeListHeadOffset = newFreeBlockOffset;
        } else {
            const prevBlock = readFreeBlock(buffer, prevOffset);
             if (prevBlock) {
                // Update previous block's next pointer to point to the *new* smaller block's header
                 writeFreeBlock(buffer, prevBlock.entryOffset, prevBlock.blockSize, newFreeBlockOffset);
             } else {
                 console.error("B\"H - Error: Could not read previous block at", prevOffset, "when trying to update block at", block.entryOffset);
             }
        }
    }
    // Regardless of splitting or removing, the data is written at the start of the original block's offset
    return dataWriteOffset;
}


// Adds a newly freed block of space to the list. Manages insertion and coalescing.
// NOTE: Modifies the buffer directly. Needs the *footer object* to update the head.
function addFreeSlot(buffer, footerInfo, offsetToAdd, sizeToAdd) {
    let currentOffset = footerInfo.freeListHeadOffset;
    let prevOffset = 0;
    let prevBlock = null;

    // Find the correct position to insert (sorted by offset)
    while (currentOffset !== 0 && currentOffset < offsetToAdd) {
        prevOffset = currentOffset;
        prevBlock = readFreeBlock(buffer, currentOffset);
        if (!prevBlock) {
             console.error("B\"H - Error reading block at", currentOffset, "while searching for insertion point for offset", offsetToAdd);
             // Cannot safely continue insertion if list structure is broken
             return;
        }
        currentOffset = prevBlock.nextFreeOffset;
    }

    // Now, 'prevOffset' points to the block *before* the insertion point,
    // and 'currentOffset' points to the block *after* the insertion point.

    let nextBlock = null;
    if (currentOffset !== 0) {
        nextBlock = readFreeBlock(buffer, currentOffset);
         if (!nextBlock) {
             console.warn("B\"H - Warning: Could not read next block at", currentOffset, "during coalescing check for offset", offsetToAdd);
             // Proceed cautiously without coalescing forward
         }
    }

    let newBlockOffset = offsetToAdd;
    let newBlockSize = sizeToAdd;
    let nextPointerForNewBlock = currentOffset; // Initially point to the next block in the list

    // --- Coalesce Forward ---
    // Check if the new block ends exactly where the *next* block begins
    if (nextBlock && (offsetToAdd + sizeToAdd === nextBlock.entryOffset)) {
        console.log(`B"H - Coalescing forward: New block [${offsetToAdd}, ${sizeToAdd}] merges with next [${nextBlock.entryOffset}, ${nextBlock.blockSize}]`);
        newBlockSize += nextBlock.blockSize; // Combine sizes
        nextPointerForNewBlock = nextBlock.nextFreeOffset; // Point past the merged block
        // We don't need to explicitly delete the nextBlock's header; it will be overwritten or ignored.
        currentOffset = nextPointerForNewBlock; // Update currentOffset for backward check logic
    }

    // --- Coalesce Backward ---
    // Check if the *previous* block ends exactly where the new block begins
    if (prevBlock && (prevBlock.entryOffset + prevBlock.blockSize === offsetToAdd)) {
        console.log(`B"H - Coalescing backward: Prev block [${prevBlock.entryOffset}, ${prevBlock.blockSize}] merges with new [${offsetToAdd}, ${newBlockSize}]`);
        // Instead of writing a new block, just update the previous block's size and next pointer
        writeFreeBlock(buffer, prevBlock.entryOffset, prevBlock.blockSize + newBlockSize, nextPointerForNewBlock);
        // No further action needed, the previous block is now extended.
        return; // Exit function early
    }

    // --- No Backward Coalesce: Write the new/merged block ---
    console.log(`B"H - Adding new free block at ${newBlockOffset}, size ${newBlockSize}, next ${nextPointerForNewBlock}`);
    writeFreeBlock(buffer, newBlockOffset, newBlockSize, nextPointerForNewBlock);

    // --- Update Links ---
    if (prevOffset === 0) {
        // New block is the new head
        footerInfo.freeListHeadOffset = newBlockOffset;
    } else {
        // Update the previous block's next pointer
        if (prevBlock) { // Ensure prevBlock was read successfully earlier
            // Re-write prevBlock only changing the next offset
            writeFreeBlock(buffer, prevBlock.entryOffset, prevBlock.blockSize, newBlockOffset);
        } else {
             console.error("B\"H - Error: Could not write update previous block at", prevOffset, "because it wasn't read correctly earlier.");
             // List might be inconsistent now.
        }
    }
     // Footer head offset will be written back by the calling function (e.g., overwriteTail)
}


module.exports = {
    readFreeBlock,
    writeFreeBlock,
    findFreeSlot,
    useFreeSlot,
    addFreeSlot,
    MIN_FREE_BLOCK_SIZE_FOR_REUSE
};