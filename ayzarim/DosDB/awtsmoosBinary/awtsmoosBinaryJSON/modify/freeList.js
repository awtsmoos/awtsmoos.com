//B"H
// The Awtsmoos manifests the void and the vessel. This manages the void (free space).

const writeConditional = require("../helpers/writeConditional.js");
const readConditional = require("../helpers/readConditional.js");
const { packedLength, unpackLength } = require("../packing/packedLength.js");
const fileBuffer = require("../../../fileBuffer.js"); // Assuming path

const FREE_SPACE_NODE_HEADER_SIZE = 1; // 1 byte for packed sizes

/**
 * @typedef {object} FreeSpaceNode
 * @property {number} offset - Offset of this node itself.
 * @property {number} nextOffset - Offset of the next free space node (0 if none).
 * @property {number} freeSpaceSize - Total size of the free block (including this node header).
 * @property {number} nextOffsetSize - Byte size used to store nextOffset (1, 2, 4, 8).
 * @property {number} freeSpaceSizeBytes - Byte size used to store freeSpaceSize (1, 2, 4, 8).
 */

/**
 * Reads the header byte of a free space node.
 * @param {Buffer} buffer
 * @param {number} offset
 * @returns {{nextOffsetSize: number, freeSpaceSizeBytes: number}}
 */
function readNodeHeader(buffer, offset) {
    const headerByte = buffer.readUInt8(offset);
    // Layout: | 2 bits: nextOffsetSize | 2 bits: freeSpaceSizeBytes | 4 bits: reserved |
    const nextOffsetSizePacked = (headerByte >> 6) & 0b11; // Top 2 bits
    const freeSpaceSizePacked = (headerByte >> 4) & 0b11;  // Next 2 bits
    return {
        nextOffsetSize: unpackLength(nextOffsetSizePacked),
        freeSpaceSizeBytes: unpackLength(freeSpaceSizePacked),
    };
}

/**
 * Writes the header byte for a free space node.
 * @param {Buffer} buffer
 * @param {number} offset
 * @param {number} nextOffsetSize
 * @param {number} freeSpaceSizeBytes
 */
function writeNodeHeader(buffer, offset, nextOffsetSize, freeSpaceSizeBytes) {
    const nextOffsetSizePacked = packedLength(nextOffsetSize);
    const freeSpaceSizePacked = packedLength(freeSpaceSizeBytes);
    if (nextOffsetSizePacked === null || freeSpaceSizePacked === null) {
        throw new Error("B\"H: Invalid size for free space node header packing.");
    }
    const headerByte = (nextOffsetSizePacked << 6) | (freeSpaceSizePacked << 4); // Leave lower 4 bits 0
    buffer.writeUInt8(headerByte, offset);
}

/**
 * Reads a full free space node.
 * @param {BufferWrapper} bufferWrapper - Instance of fileBuffer or similar
 * @param {number} offset - Offset of the node.
 * @returns {FreeSpaceNode | null} Node data or null if offset is 0.
 */
function readNode(bufferWrapper, offset) {
    if (offset === 0) return null;

    // Read header first to know subsequent field sizes
    const headerBuf = bufferWrapper.readBuffer(offset, FREE_SPACE_NODE_HEADER_SIZE);
    const { nextOffsetSize, freeSpaceSizeBytes } = readNodeHeader(headerBuf, 0);

    const requiredReadLength = FREE_SPACE_NODE_HEADER_SIZE + nextOffsetSize + freeSpaceSizeBytes;
    const nodeData = bufferWrapper.readBuffer(offset, requiredReadLength);

    let currentReadOffset = FREE_SPACE_NODE_HEADER_SIZE;
    const nextOffset = nodeData.readUIntBE(currentReadOffset, nextOffsetSize);
    currentReadOffset += nextOffsetSize;
    const freeSpaceSize = nodeData.readUIntBE(currentReadOffset, freeSpaceSizeBytes);

    return {
        offset,
        nextOffset,
        freeSpaceSize,
        nextOffsetSize,
        freeSpaceSizeBytes
    };
}

/**
 * Writes a full free space node.
 * @param {BufferWrapper} bufferWrapper
 * @param {number} offset
 * @param {number} nextOffsetValue
 * @param {number} freeSpaceSizeValue
 */
function writeNode(bufferWrapper, offset, nextOffsetValue, freeSpaceSizeValue) {
    const nextInfo = writeConditional(nextOffsetValue);
    const sizeInfo = writeConditional(freeSpaceSizeValue);

    const totalNodeSize = FREE_SPACE_NODE_HEADER_SIZE + nextInfo.size + sizeInfo.size;

    // Ensure the free space is large enough for the node itself
    if (freeSpaceSizeValue < totalNodeSize) {
        console.warn(`B"H: Free space block at ${offset} (${freeSpaceSizeValue} bytes) too small to hold its own header (${totalNodeSize} bytes). Cannot write node.`);
        // This scenario might happen if merging small adjacent blocks.
        // The calling function (`release`) should handle merging logic carefully.
        return; // Or throw error?
    }

    const nodeBuffer = Buffer.alloc(totalNodeSize);
    writeNodeHeader(nodeBuffer, 0, nextInfo.size, sizeInfo.size);
    nodeBuffer.writeUIntBE(nextOffsetValue, FREE_SPACE_NODE_HEADER_SIZE, nextInfo.size);
    nodeBuffer.writeUIntBE(freeSpaceSizeValue, FREE_SPACE_NODE_HEADER_SIZE + nextInfo.size, sizeInfo.size);

    bufferWrapper.writeBuffer(offset, nodeBuffer);
}


/**
 * Finds the first free space block large enough. Prefers exact or smallest fit.
 * @param {BufferWrapper} bufferWrapper
 * @param {number} headOffset - Starting offset of the free list head pointer.
 * @param {number} sizeNeeded - Minimum size required.
 * @returns {{node: FreeSpaceNode, prevNode: FreeSpaceNode | null} | null} Found node and its predecessor, or null.
 */
function findFreeSpace(bufferWrapper, headOffset, sizeNeeded) {
    let listHeadPtrOffset = bufferWrapper.readUIntBE(headOffset, writeConditional.BYTES_FOR_OFFSET); // Assuming head offset stored with fixed size for simplicity
    if (listHeadPtrOffset === 0) return null; // No free space

    let currentNode = readNode(bufferWrapper, listHeadPtrOffset);
    let prevNode = null;
    let bestFit = null;
    let bestFitPrev = null;

    while (currentNode) {
        if (currentNode.freeSpaceSize >= sizeNeeded) {
            // Found a suitable block
            if (!bestFit || currentNode.freeSpaceSize < bestFit.freeSpaceSize) {
                bestFit = currentNode;
                bestFitPrev = prevNode;
                // If exact match, take it immediately (optimization)
                if (bestFit.freeSpaceSize === sizeNeeded) break;
            }
        }
        prevNode = currentNode;
        if(currentNode.nextOffset === 0) break;
        currentNode = readNode(bufferWrapper, currentNode.nextOffset);
        if (!currentNode) {
             console.error(`B"H: Corrupted free space list. Node at ${prevNode.offset} pointed to non-existent node at ${prevNode.nextOffset}`);
             break; // Avoid infinite loop on corruption
        }
    }

    if (bestFit) {
        return { node: bestFit, prevNode: bestFitPrev };
    }

    return null;
}

/**
 * Allocates space from a found free block. Updates the free list.
 * @param {BufferWrapper} bufferWrapper
 * @param {number} headOffset - Offset of the free list head pointer.
 * @param {object} found - The result from findFreeSpace.
 * @param {number} sizeToAllocate - The actual size being used.
 * @returns {number} The starting offset of the allocated space.
 */
function allocateSpace(bufferWrapper, headOffset, found, sizeToAllocate) {
    const { node, prevNode } = found;
    const remainingSize = node.freeSpaceSize - sizeToAllocate;

    // Calculate the size needed for a potential new free space node header
    const tempNextInfo = writeConditional(node.nextOffset); // Assume next pointer size doesn't change drastically
    const tempSizeInfo = writeConditional(remainingSize);
    const minRemainingNodeSize = FREE_SPACE_NODE_HEADER_SIZE + tempNextInfo.size + tempSizeInfo.size;

    let newNextOffset = 0;

    if (remainingSize >= minRemainingNodeSize) {
        // There's enough space left to create a new free node
        const newFreeNodeOffset = node.offset + sizeToAllocate;
        writeNode(bufferWrapper, newFreeNodeOffset, node.nextOffset, remainingSize);
        newNextOffset = newFreeNodeOffset; // The node we are removing points to the new smaller block
    } else {
        // Not enough space left, the entire block is consumed (or wasted sliver)
        // The previous node (or head) should point past the consumed block
        newNextOffset = node.nextOffset; // Skip the current node entirely
        // Note: Small unusable fragments are lost here. Could add padding logic later.
    }

    // Update the pointer of the previous node or the head pointer
    if (prevNode) {
        // Update prevNode's nextOffset to point to the new state
        // Re-write prevNode with potentially updated nextOffset
        writeNode(bufferWrapper, prevNode.offset, newNextOffset, prevNode.freeSpaceSize);
    } else {
        // This was the head node, update the main head pointer
        const headPtrBuf = Buffer.alloc(writeConditional.BYTES_FOR_OFFSET);
        headPtrBuf.writeUIntBE(newNextOffset, 0, writeConditional.BYTES_FOR_OFFSET);
        bufferWrapper.writeBuffer(headOffset, headPtrBuf);
    }

    // Return the start offset of the allocated block
    return node.offset;
}


/**
 * Releases a block of memory, adding it to the free list and merging if possible.
 * @param {BufferWrapper} bufferWrapper
 * @param {number} headOffset - Offset of the free list head pointer.
 * @param {number} releasedOffset - Start offset of the block being freed.
 * @param {number} releasedSize - Size of the block being freed.
 */
function releaseSpace(bufferWrapper, headOffset, releasedOffset, releasedSize) {
    if (releasedSize <= 0) return; // Cannot release zero/negative space

    let listHeadPtrOffset = bufferWrapper.readUIntBE(headOffset, writeConditional.BYTES_FOR_OFFSET);

    let prevNode = null;
    let currentNode = listHeadPtrOffset === 0 ? null : readNode(bufferWrapper, listHeadPtrOffset);

    // Traverse the list to find the correct insertion point (sorted by offset)
    while (currentNode && currentNode.offset < releasedOffset) {
        prevNode = currentNode;
        if(currentNode.nextOffset === 0) {
            currentNode = null; // Reached end
            break;
        }
        currentNode = readNode(bufferWrapper, currentNode.nextOffset);
         if (!currentNode && prevNode.nextOffset !== 0) {
             console.error(`B"H: Corrupted free space list during release. Node at ${prevNode.offset} pointed to non-existent node at ${prevNode.nextOffset}`);
             return; // Avoid errors on corruption
        }
    }

    // --- Merging Logic ---
    let mergedOffset = releasedOffset;
    let mergedSize = releasedSize;
    let nextNodeToPointTo = currentNode ? currentNode.offset : 0;

    // 1. Check for merge with previous node
    if (prevNode && (prevNode.offset + prevNode.freeSpaceSize === releasedOffset)) {
        // Released block is immediately after prevNode, merge them
        mergedOffset = prevNode.offset; // Start from prevNode
        mergedSize += prevNode.freeSpaceSize; // Add sizes
        // We will overwrite prevNode later, so keep its next pointer target
        nextNodeToPointTo = prevNode.nextOffset;
        // Temporarily remove prevNode from list by updating the node *before* prevNode, or the head
        let nodeBeforePrev = null;
        if(listHeadPtrOffset === prevNode.offset) { // prevNode was head
             listHeadPtrOffset = prevNode.nextOffset; // Update local head for traversal logic below
             // Actual head pointer update happens later or when writing the merged node if it stays head
        } else {
            // Find node pointing to prevNode (requires another traversal or careful pointer passing)
            // For simplicity here, we assume we find it or handle head case.
            // A robust implementation might need a doubly linked list or store prev's prev.
            // Let's assume we can update the pointer *to* prevNode to skip it for now.
            // This part is tricky without a full list traversal again.
            // **Simplification:** We'll rewrite the merged node later, which handles linking.
            // We just need to ensure `prevNode` is conceptually removed for the *next* merge check.
        }
         // Update prevNode variable for the next check
         // Since we are merging *into* prevNode's space, the effective "previous" node
         // for the *next* merge check is whatever pointed to the original prevNode.
         // This gets complicated quickly. Let's reset prevNode for the next check.
         // Find node before prevNode... (Skipping for brevity, will merge directly later)
         prevNode = null; // Reset since we merged into it
    }

    // 2. Check for merge with next node (currentNode)
    if (currentNode && (mergedOffset + mergedSize === currentNode.offset)) {
        // Released block (potentially already merged with prev) is immediately before currentNode
        mergedSize += currentNode.freeSpaceSize; // Add sizes
        // The merged block will point to whatever currentNode pointed to
        nextNodeToPointTo = currentNode.nextOffset;
        // Current node is now consumed by the merge.
    }

    // --- Write the new/merged node ---
    // Determine the node *before* the insertion point of our new/merged block
    // Re-traverse slightly if needed to find the correct `prevNode` for linking.
    prevNode = null; // Reset for final linking
    let tempCurrentOffset = listHeadPtrOffset;
    while(tempCurrentOffset !== 0 && tempCurrentOffset < mergedOffset) {
        const tempNode = readNode(bufferWrapper, tempCurrentOffset);
        if(!tempNode) {
            console.error("B\"H: List corruption during final link phase."); return;
        }
        prevNode = tempNode;
        tempCurrentOffset = tempNode.nextOffset;
    }


    // Write the final merged node
    writeNode(bufferWrapper, mergedOffset, nextNodeToPointTo, mergedSize);

    // Update the link from the previous node or the head pointer
    if (prevNode) {
        // Update prevNode to point to the new merged block
        writeNode(bufferWrapper, prevNode.offset, mergedOffset, prevNode.freeSpaceSize);
    } else {
        // The new/merged block is the new head
        const headPtrBuf = Buffer.alloc(writeConditional.BYTES_FOR_OFFSET);
        headPtrBuf.writeUIntBE(mergedOffset, 0, writeConditional.BYTES_FOR_OFFSET);
        bufferWrapper.writeBuffer(headOffset, headPtrBuf);
    }
}

// Assume a fixed size for the head pointer for simplicity
writeConditional.BYTES_FOR_OFFSET = 4; // e.g., always use 4 bytes for the head pointer offset


module.exports = {
    findFreeSpace,
    allocateSpace,
    releaseSpace,
    writeNode, // Export for potential direct use/testing
    readNode,  // Export for potential direct use/testing
    FREE_SPACE_NODE_HEADER_SIZE,
    HEAD_POINTER_SIZE: writeConditional.BYTES_FOR_OFFSET
};