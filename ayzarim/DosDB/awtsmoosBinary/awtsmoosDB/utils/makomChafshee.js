// B"H
/**
 * @file makomChafshee.js
 * @description 
 *  "The Free Place" - Manages the void within the vessels.
 *  Handles Linked Pages of Free Space Entries to allow O(1) allocation 
 *  within large binary objects without massive rewrites.
 */

const { writeConditional, packedLength, unpackLength } = require("./binaryHelpers.js");

const MAX_ENTRIES_PER_PAGE = 50; 

/**
 * Updates the free space pages by inserting a new free block (entry).
 * Handles page splitting, creation, and relocation iteratively.
 * 
 * @param {Array} metadata - The main object metadata. metadata[0] holds the `freeSpacePageOffset`.
 * @param {object} options
 * @param {object} options.buffer - The buffer wrapper (must implement read/write/length).
 * @param {object} options.entry - The newly freed block {offset, size}.
 * @param {number} options.initialNextAvailablePageOffset - Where new pages can be safely appended.
 * @returns {{metadata: Array, newEndOfDataAndPages: number}}
 */
function updateSortedFreeSpaceAcrossMetadata(metadata, options = {}) {
    const { buffer, entry, initialNextAvailablePageOffset } = options;

    if (!buffer) return { metadata, newEndOfDataAndPages: initialNextAvailablePageOffset };
    if (!entry || entry.size <= 0) return { metadata, newEndOfDataAndPages: initialNextAvailablePageOffset };
    if (initialNextAvailablePageOffset < 0) return { metadata, newEndOfDataAndPages: initialNextAvailablePageOffset };

    // Transaction State
    let state = {
        buffer,
        pendingBlocks: [ entry ], // Queue of blocks to free
        writes: [], // Deferred writes { offset, data }
        nextAvailOffset: initialNextAvailablePageOffset,
        currentHead: metadata[0]?.freeSpacePageOffset || 0,
        
        // Callback to update the head pointer in metadata[0]
        updateHead: (newOffset) => {
            if (!metadata[0]) metadata[0] = {};
            metadata[0].freeSpacePageOffset = newOffset;
        }
    };

    // Logic implementation placeholder for the "Free Place" algorithm.
    // In V2, most allocation is handled by the core/allocator/bitmap.js.
    // This file is reserved for future inline-blob fragmentation handling.
    
    return { metadata, newEndOfDataAndPages: state.nextAvailOffset };
}

module.exports = { updateSortedFreeSpaceAcrossMetadata };