//B"H
/*
    free space manager
*/
const writeConditional = require("../helpers/writeConditional.js");

var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")

// Define these constants at the module level or pass them around.
// These are examples; they should be tuned.
const MAX_ENTRIES_PER_PAGE = 50; // Reduced for easier testing of splits
// const MAX_ENTRIES_PER_PAGE = 5; // Reduced for easier testing of splits
// const MAX_PAGE_SERIALIZED_SIZE = 1024; // If a page's byte size exceeds this, it might be split. (Split by entry count is primary)


/**
 * 
 * @param {Array} metadata Main metadata array. metadata[0] holds pointers to free space chain.
 * @param {object} options
 * @param {object} options.buffer - The fileBuffer instance.
 * @param {object} options.entry - The newly freed block {offset, size} from data area.
 * @param {number} options.initialNextAvailablePageOffset - Crucial: the offset after which new/relocated pages can be reliably appended.
 *                                                        This should be the end of all existing data AND free space pages.
 * @returns {{metadata: Array, newEndOfDataAndPages: number}} The potentially modified metadata array and the new end offset.
 */
function updateSortedFreeSpaceAcrossMetadata(
    metadata, 
    options = {
		buffer: null,
        entry: { 
            offset: 0,
            size: 0
        },
        // operation: "deleted", // Kept for context, not directly used in new logic flow
        initialNextAvailablePageOffset: -1 
    }
) {
	var buffer = options?.buffer;
	if(!buffer) {
		// console.error("Buffer not provided to updateSortedFreeSpaceAcrossMetadata");
		return { metadata, newEndOfDataAndPages: options.initialNextAvailablePageOffset }; 
	}
	if(!Array.isArray(metadata) || !metadata.length) {
		return { metadata, newEndOfDataAndPages: options.initialNextAvailablePageOffset };
	}
    if (options.initialNextAvailablePageOffset < 0) { 
        // console.error("initialNextAvailablePageOffset must be provided and be non-negative.");
        return { metadata, newEndOfDataAndPages: options.initialNextAvailablePageOffset };
    }

    let pageTransactionState = {
        buffer: buffer,
        pendingBlocksToProcess: [], 
        finalPageOperations: [], 
        nextAvailableOffsetForNewOrRelocatedPages: options.initialNextAvailablePageOffset,
        currentHeadPageOffset: metadata[0]?.freeSpacePageOffset || 0,
        updateMeta0HeadPointer: (newHeadOffset, _newHeadSerializedLength) => { // _newHeadSerializedLength not used by meta[0] currently
            if (metadata[0]) {
                metadata[0].freeSpacePageOffset = newHeadOffset;
            }
            pageTransactionState.currentHeadPageOffset = newHeadOffset;
        }
    };

	if(options.entry && options.entry.size > 0) { 
        pageTransactionState.pendingBlocksToProcess.push({...options.entry});
    }

    let iteration = 0;
    const MAX_ITERATIONS_SAFETY_NET = Math.max(20, MAX_ENTRIES_PER_PAGE * 2); 

    while(pageTransactionState.pendingBlocksToProcess.length > 0 && iteration < MAX_ITERATIONS_SAFETY_NET) {
        let blockToInsert = pageTransactionState.pendingBlocksToProcess.shift(); 
        if (!blockToInsert || blockToInsert.size <= 0) continue; 

        _traverseAndProcessBlock(
            blockToInsert,
            pageTransactionState,
            pageTransactionState.currentHeadPageOffset, 
            0, 
            pageTransactionState.updateMeta0HeadPointer 
        );
        iteration++;
    }

    if (iteration >= MAX_ITERATIONS_SAFETY_NET && pageTransactionState.pendingBlocksToProcess.length > 0) {
        // console.warn("Max iterations reached. Some free blocks may not have been processed:", pageTransactionState.pendingBlocksToProcess);
    }

    pageTransactionState.finalPageOperations.sort((a,b) => a.offset - b.offset);
    for (const op of pageTransactionState.finalPageOperations) {
        if (op.type === "write") {
            buffer.writeBuffer(op.offset, op.pageBuffer);
        }
    }
    
	return { metadata, newEndOfDataAndPages: pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages };
}


/**
 * Traverses the page chain to find/create a page for blockToInsert.
 * Manages page modifications, relocations, and splits.
 * @param {object} blockToInsert - The data block {offset, size} to add to free space.
 * @param {object} pageTransactionState - Shared state object.
 * @param {number} currentPageChainOffset - Offset of the current page in the chain being checked.
 * @param {number} predecessorPageOriginalOffset - The original offset of the page whose 'nextPage' points to currentPageChainOffset.
 *                                                 0 if currentPageChainOffset is the head (pointed to by metadata[0]).
 * @param {function} predecessorLinkUpdater - Callback to update the predecessor's nextPage pointer.
 *                                            Called as: predecessorLinkUpdater(newOffsetForThisSpot, newSizeForThisSpot)
 */
function _traverseAndProcessBlock(
	blockToInsert,
	pageTransactionState,
	currentPageChainOffset,
    predecessorPageOriginalOffset,
    predecessorLinkUpdater 
) {
	const { buffer } = pageTransactionState;

	if (!currentPageChainOffset) { 
		let newPageObject = { entries: [blockToInsert], nextPage: 0 };
		let serializedNewPage = serializeFreeSpacePage(newPageObject);
		if (!serializedNewPage) { /* console.error("Failed to serialize new free space page."); */ return; }

        let newAssignedOffset = pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages;
        pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages += serializedNewPage.length;
        
        pageTransactionState.finalPageOperations.push({
            type: "write",
            offset: newAssignedOffset,
            pageBuffer: serializedNewPage
        });
        
        predecessorLinkUpdater(newAssignedOffset, serializedNewPage.length);
		return;
	}

	var parsedPage = getFreeSpacePage(buffer, currentPageChainOffset);

	if (parsedPage.error) {
		// console.error("Error reading free space page at", currentPageChainOffset, parsedPage.error);
        _traverseAndProcessBlock(blockToInsert, pageTransactionState, 0, predecessorPageOriginalOffset, predecessorLinkUpdater);
		return;
	}

    // *** CRITICAL FIX #1 (Merging) would go into _addEntryToPageOrHandleCapacity ***
    // *** CRITICAL FIX #2 (Empty Pages) would be checked after pageModificationAttempt returns,
    //     if it indicates an entry was *removed* or page otherwise emptied. ***
    let pageModificationAttempt = _addEntryToPageOrHandleCapacity(parsedPage, blockToInsert);

    if (pageModificationAttempt.action === "entry_added_rewrite_page") {
        let { newPageBuffer } = pageModificationAttempt;
        let oldPageDiskSize = parsedPage.pageSize;

        if (newPageBuffer.length <= oldPageDiskSize) {
            pageTransactionState.finalPageOperations.push({
                type: "write",
                offset: currentPageChainOffset, 
                pageBuffer: newPageBuffer
            });
            
			if (newPageBuffer.length < oldPageDiskSize) {
				pageTransactionState.pendingBlocksToProcess.push({
					offset: currentPageChainOffset + newPageBuffer.length,
					size: oldPageDiskSize - newPageBuffer.length
				});
			}
        } else {
			pageTransactionState.pendingBlocksToProcess.push({ 
				offset: currentPageChainOffset,
				size: oldPageDiskSize
			});

            let newAssignedOffset = pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages;
            pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages += newPageBuffer.length;

            pageTransactionState.finalPageOperations.push({
                type: "write",
                offset: newAssignedOffset,
                pageBuffer: newPageBuffer
            });
            predecessorLinkUpdater(newAssignedOffset, newPageBuffer.length);
        }

    } else if (pageModificationAttempt.action === "page_split") {
        // *** CRITICAL FIX #3 for page split sizing START ***
        let { page1_obj_template, newPage2_Serialized } = pageModificationAttempt; // Modified return
        
        pageTransactionState.pendingBlocksToProcess.push({
            offset: currentPageChainOffset,
            size: parsedPage.pageSize
        });

        // Place Page 2 first to know its offset
        let page2NewOffset = pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages;
        pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages += newPage2_Serialized.length;
        pageTransactionState.finalPageOperations.push({
            type: "write",
            offset: page2NewOffset,
            pageBuffer: newPage2_Serialized
        });
        
        // Now finalize Page 1 with correct nextPage pointer to Page 2
        page1_obj_template.nextPage = page2NewOffset;
        let final_newPage1_Serialized = serializeFreeSpacePage(page1_obj_template);
        if (!final_newPage1_Serialized) {
            // console.error("Failed to serialize page 1 of split. Freeing page 2's new slot.");
            pageTransactionState.pendingBlocksToProcess.push({ offset: page2NewOffset, size: newPage2_Serialized.length });
            // And predecessor link needs to be reverted or handled, this is a tricky error state.
            // For now, predecessorLinkUpdater won't be called, original link might persist to old page or be broken.
            return;
        }
        
        let page1NewOffset = pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages;
        pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages += final_newPage1_Serialized.length;
        pageTransactionState.finalPageOperations.push({
            type: "write",
            offset: page1NewOffset,
            pageBuffer: final_newPage1_Serialized
        });

        predecessorLinkUpdater(page1NewOffset, final_newPage1_Serialized.length);
        // *** CRITICAL FIX #3 for page split sizing END ***

    } else if (pageModificationAttempt.action === "go_to_next_page") {
        _traverseAndProcessBlock(
            blockToInsert,
            pageTransactionState,
            parsedPage.nextPage, 
            currentPageChainOffset, 
            (newNextPageOffsetValue, newNextPageSizeValue) => {
                if (parsedPage.nextPage !== newNextPageOffsetValue) {
                    let oldNextPtr = parsedPage.nextPage;
                    parsedPage.nextPage = newNextPageOffsetValue;
                    let reserializedCurrentPage = serializeFreeSpacePage(parsedPage);
                    if (!reserializedCurrentPage) {
                        // console.error("Failed to reserialize current page after updating nextPage pointer.");
                        parsedPage.nextPage = oldNextPtr; 
                        return; 
                    }

                    let oldSelfDiskSize = parsedPage.pageSize;
                    if (reserializedCurrentPage.length <= oldSelfDiskSize) {
                        pageTransactionState.finalPageOperations.push({
                            type: "write",
                            offset: currentPageChainOffset,
                            pageBuffer: reserializedCurrentPage
                        });
                        if (reserializedCurrentPage.length < oldSelfDiskSize) {
                            pageTransactionState.pendingBlocksToProcess.push({
                                offset: currentPageChainOffset + reserializedCurrentPage.length,
                                size: oldSelfDiskSize - reserializedCurrentPage.length
                            });
                        }
                    } else { 
                        pageTransactionState.pendingBlocksToProcess.push({
                            offset: currentPageChainOffset,
                            size: oldSelfDiskSize
                        });
                        let newLoc = pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages;
                        pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages += reserializedCurrentPage.length;
                        pageTransactionState.finalPageOperations.push({
                            type: "write",
                            offset: newLoc,
                            pageBuffer: reserializedCurrentPage
                        });
                        predecessorLinkUpdater(newLoc, reserializedCurrentPage.length);
                    }
                }
            }
        );
    }
}


/**
 * Decides how to handle adding an entry to a page: add it, split the page, or suggest going to the next page.
 * @param {object} parsedPage - The already loaded and parsed page object {entries, nextPage, pageOffset, pageSize}.
 * @param {object} entry_to_add - The free block {offset, size} to add.
 * @returns {object} An object describing the action:
 *  - {action: "entry_added_rewrite_page", newPageBuffer: Buffer}
 *  - {action: "page_split", page1_obj_template: object, newPage2_Serialized: Buffer } // MODIFIED for fix #3
 *  - {action: "go_to_next_page"}
 */
function _addEntryToPageOrHandleCapacity(parsedPage, entry_to_add) {
	let entries = [...parsedPage.entries]; 

    // *** CRITICAL FIX #1 (Merging) PLACEMENT HINT ***
    // Before inserting, iterate 'entries'. If 'entry_to_add' is adjacent or overlapping
    // with any 'existing_entry' in 'entries':
    //   1. Calculate merged block {newOffset, newSize}.
    //   2. Remove 'existing_entry' from 'entries'.
    //   3. Update 'entry_to_add' = {offset: newOffset, size: newSize}.
    //   4. Restart check for merge with remaining 'entries' (or use a more sophisticated loop).
    // This loop continues until no more merges with 'entry_to_add' are possible.
    // Then proceed to sort/insert 'entry_to_add'.
	
	let inserted = false;
	for (let i = 0; i < entries.length; i++) {
		if (entry_to_add.size <= entries[i].size) { 
			entries.splice(i, 0, entry_to_add);
			inserted = true;
			break;
		}
	}
	if (!inserted) {
		entries.push(entry_to_add); 
	}
	
	if (entries.length > MAX_ENTRIES_PER_PAGE) {
		const splitPoint = Math.ceil(entries.length / 2);
		const entries1 = entries.slice(0, splitPoint);
		const entries2 = entries.slice(splitPoint);
        
        // MODIFIED for fix #3: Return page1 as an object template
        var page1_obj_template = { entries: entries1, nextPage: 0 /* Placeholder for Page 2 offset */ };
		var page2Obj = { entries: entries2, nextPage: parsedPage.nextPage };
        
        // var newPage1_Serialized = serializeFreeSpacePage(tempPage1Obj); // Deferred
        var newPage2_Serialized = serializeFreeSpacePage(page2Obj);

        if (!newPage2_Serialized) { // Check if page2 serialization failed
            // console.error("Failed to serialize page 2 for split. Falling back.");
            return { action: "go_to_next_page" };
        }
		return {
			action: "page_split",
			page1_obj_template: page1_obj_template, // MODIFIED
			newPage2_Serialized: newPage2_Serialized  // MODIFIED
		};

	} else { 
        // *** CRITICAL FIX #2 (Empty Pages) PLACEMENT HINT ***
        // If 'entries' is now empty (e.g. because a block was *used* and this was the last one,
        // or merging resulted in this page's only entry moving to another), this function
        // should return a special action like "page_emptied".
        // _traverseAndProcessBlock would then:
        //   1. Add parsedPage.pageSize at parsedPage.pageOffset to pendingBlocksToProcess.
        //   2. Call predecessorLinkUpdater with parsedPage.nextPage (to bypass this page).
        // For now, just handling additions.
		var newPageObject = {
			entries: entries, 
			nextPage: parsedPage.nextPage 
		};
		var newPageBuffer = serializeFreeSpacePage(newPageObject);
        if (!newPageBuffer) {
            // console.error("Failed to serialize page after adding entry. Falling back.");
            return { action: "go_to_next_page" }; 
        }
		return {
			action: "entry_added_rewrite_page",
			newPageBuffer: newPageBuffer
		};
	}
}


function serializeFreeSpacePage(
	{
		entries,
		nextPage = 0
	}={}
) {

	if(!Array.isArray(entries)) {
		// console.error("Serialize: entries is not an array");
		return null;
	}
	var entryCount = entries?.length;
	var entryCountData = writeConditional( 
		entryCount
	)
	var nextPageData = writeConditional( 
		nextPage
	);

	let maxOffsetVal = 0;
	let maxEntryLengthVal = 0;
	if (entryCount > 0) {
		maxOffsetVal = Math.max(0, ...entries.map(q => q.offset || 0));
		maxEntryLengthVal = Math.max(0, ...entries.map(q => q.size || 0));
	}
	
	var bytesForEntryOffset = writeConditional(maxOffsetVal).size; 
	var bytesForEntrySize = writeConditional(maxEntryLengthVal).size;   
    var bytesForNextPageOffset = nextPageData.size;

    bytesForEntryOffset = Math.max(1, bytesForEntryOffset);
    bytesForEntrySize = Math.max(1, bytesForEntrySize);
    bytesForNextPageOffset = Math.max(1, bytesForNextPageOffset);
    let bytesForEntryCount = Math.max(1, entryCountData.size);


	var firstByte = Buffer.from([
		(packedLength(bytesForEntryCount) & 0b11) | 
		((packedLength(bytesForEntryOffset) & 0b11) << 2) |
		((packedLength(bytesForEntrySize) & 0b11) << 4) | 
		((packedLength(bytesForNextPageOffset) & 0b11) << 6) 
	]);

    var headerBuffer = Buffer.concat([
        firstByte,
        entryCountData.buffer 
    ]);
	
	var singleEntryDiskLength = bytesForEntryOffset + bytesForEntrySize; 
	var allEntriesBufferLength = entryCount * singleEntryDiskLength;
	var entriesBuffer = Buffer.alloc(allEntriesBufferLength);
	
    var currentOffsetInEntriesBuffer = 0;
	for(const entryData of entries) { 
		entriesBuffer.writeUIntBE( 
			entryData.offset,
			currentOffsetInEntriesBuffer, 
			bytesForEntryOffset
		);
		currentOffsetInEntriesBuffer += bytesForEntryOffset;
		entriesBuffer.writeUIntBE(
			entryData.size,
			currentOffsetInEntriesBuffer, 
			bytesForEntrySize
		);
		currentOffsetInEntriesBuffer += bytesForEntrySize;
	}

	var fullPageBuffer = Buffer.concat([
		headerBuffer,
		entriesBuffer,
		nextPageData.buffer 
	]);
	return fullPageBuffer;
}

function getFreeSpacePage(buffer, pageOffsetInFile) {
	try {
		var currentReadOffset = pageOffsetInFile; 
        var pageDataSource = buffer; 

        if (pageOffsetInFile === 0 && buffer.length < 256 /* Heuristic: if it's a small buffer passed, it might be THE page */ ) {
             // This heuristic is weak. If pageOffsetInFile is 0, it means either it's the actual start
             // of the file buffer, OR the caller has already given us an isolated page buffer.
             // The original code assumed if pageOffsetInFile is 0, then read from start of passed buffer.
             // This is only safe if the caller ensures 'buffer' is either the full file or an isolated page.
             // Let's stick to that: if pageOffsetInFile is an offset into 'buffer'.
        }


		var firstByte = pageDataSource.readUInt8(currentReadOffset); 

		var bytesForEntryCount = unpackLength(
			0b00000011 & firstByte
		);
		var bytesForEntryOffset = unpackLength(
			(0b00001100 & firstByte)
			>> 2
		);
		var bytesForEntrySize = unpackLength( 
			(0b00110000 & firstByte)
			>> 4
		); 
		var bytesForNextPageOffset = unpackLength( 
			(0b11000000 & firstByte)
			>> 6
		);

		currentReadOffset++; 
		var numberOfEntriesInThisPage = pageDataSource.readUIntBE(
			currentReadOffset,
			bytesForEntryCount
		);

		currentReadOffset += bytesForEntryCount;
		
		var entries = [];
		for(let i = 0; i < numberOfEntriesInThisPage; i++) {
			var entryFileOffset = pageDataSource.readUIntBE( 
				currentReadOffset,
				bytesForEntryOffset
			);
			currentReadOffset += bytesForEntryOffset;

			var entryLength = pageDataSource.readUIntBE(
				currentReadOffset,
				bytesForEntrySize
			);

			currentReadOffset += bytesForEntrySize; 
			entries.push({
				offset: entryFileOffset, 
				size: entryLength
			});
		}

		var nextPage = pageDataSource.readUIntBE(
			currentReadOffset,
			bytesForNextPageOffset
		)
        currentReadOffset += bytesForNextPageOffset;
        
        const totalPageDiskSize = currentReadOffset - pageOffsetInFile ;


		return {
			entries,
			nextPage,
			pageOffset: pageOffsetInFile, 
			pageSize: totalPageDiskSize 
		}
	} catch(e) {
		return {
			error: {
				message: "Couldn't get/parse page at offset " + pageOffsetInFile,
				stack:e.stack,
                originalException: e, 
				code: "NO_PAGE_OR_CORRUPT" 
			}
		}
	}
}


module.exports = {
    updateSortedFreeSpaceAcrossMetadata
};


Okay, let's reset and provide a clear, detailed guide based *only* on the code from the **first prompt** and the goal of making `makomChafshee.js` (the free space manager) functional for managing free space indicated by deleted data entries.

**Core Goal:** Implement `makomChafshee.js` to track free space arising from deleted key-value pairs. This tracked free space will be organized into "pages" (linked lists of sorted free space entries: `{offset, size}`). These pages themselves will be stored within the file.

**Files from First Prompt:**
1.  `deleteKeyFromJSON.js`
2.  `append.js`
3.  `getFreeSpace.js` (calculates gaps, this is the "old" way of finding free space, will be superseded for finding slots but useful for understanding fragmentation)
4.  `getTotalSpace.js` (calculates total span of data, useful for context)
5.  `makomChafshee.js` (INCOMPLETE - This is the primary file to complete)
6.  `overwriteTail.js` (writes metadata and hash table at the end)

**Conceptual Overview of the Free Space Management (FSM) with Pages:**

1.  **Free Blocks:** When a key-value pair is deleted, the space its value occupied becomes a "free block" (defined by an `offset` and `size`).
2.  **FSM Pages:**
    *   Instead of a single, potentially huge, sorted list of all free blocks (which would be slow to update), we use a linked list of "pages."
    *   Each page contains a sorted list of free block entries. The entries within a page are sorted by `size`.
    *   Pages themselves might be conceptually ordered (e.g., page 1 for smallest blocks, page 2 for medium, etc.), or this can be simpler for now.
    *   Each page stores a pointer (`nextPage` offset) to the next page in the chain.
3.  **Storage of FSM Pages:** These FSM pages are just byte buffers. They need to be stored *somewhere* in the main file.
    *   **Simplest Approach (Target for this Implementation):** FSM pages will be stored in a contiguous block *after* all the main key-value data but *before* the file's main hash table and metadata array.
4.  **Pointer to FSM:** The main file's metadata (specifically, `metadata[0]`, the first entry in the metadata array) will hold:
    *   `freeSpaceOffset`: The file offset where the *first* FSM page begins.
    *   `freeSpaceLength`: The total byte length of the *entire contiguous block* containing all FSM pages.
5.  **Operations:**
    *   **Adding a Free Block (from deleted data):**
        1.  Traverse the FSM page chain.
        2.  Find the appropriate page to insert the new free block entry.
        3.  If the entry fits:
            *   Add it to the page's list of entries.
            *   Re-serialize the page.
            *   If the new serialized page is <= old size: overwrite it in place. Any shrinkage creates a new (tiny) free block (for FSM pages themselves) – this is an advanced problem, ignore for now.
            *   If the new serialized page is > old size: the old page slot is now "free" (again, for FSM pages), and the new, larger page needs to be written at the end of the FSM page block. The predecessor page's `nextPage` pointer (or `metadata[0].freeSpaceOffset`) needs to be updated.
        4.  If the page gets too full (e.g., `MAX_ENTRIES_PER_PAGE`):
            *   Split the page into two.
            *   The old page slot is "freed."
            *   The two new pages are written at the end of the FSM page block.
            *   Pointers are updated (predecessor to page1, page1 to page2, page2 to original next).
        5.  If no page exists or end of chain: Create a new page and write it at the end of the FSM page block. Update pointers.
    *   **Using a Free Block (for `append.js` when `findAvailableSlot` finds one - ADVANCED):** This is the reverse. Find the entry in an FSM page, remove/adjust it, re-serialize page, handle relocation/shrinkage. This is a later step, not for the initial completion of `makomChafshee.js` for *adding* free space.

---

**Detailed Plan for Completing `makomChafshee.js` and Related Changes:**

**I. `makomChafshee.js` - The Core FSM Logic**

*   **Constants:**
    *   `MAX_ENTRIES_PER_PAGE`: e.g., `50`. Threshold for splitting a page.

*   **`updateSortedFreeSpaceAcrossMetadata(metadata, options)` function:**
    *   **Parameters:**
        *   `metadata`: The main metadata array from the file. `metadata[0]` is special.
        *   `options`:
            *   `buffer`: The `fileBuffer` object.
            *   `entry`: The `{offset, size}` of the data block that just became free.
            *   `initialNextAvailablePageOffset`: **Crucial.** This is the file offset *where the FSM page block can start or continue to grow*.
                *   If `metadata[0].freeSpaceOffset` is null/0: this will be `end_of_actual_KV_data`.
                *   If `metadata[0].freeSpaceOffset` exists: this will be `metadata[0].freeSpaceOffset + metadata[0].freeSpaceLength`.
    *   **Return Value:**
        *   `{ metadata: updatedMetadataArray, endOfAllDataAndAllPages: number, totalLengthOfTheFsmPageBlock: number }`
            *   `endOfAllDataAndAllPages`: The offset after all KV data AND the (potentially grown) FSM page block. This is where the main hash table/metadata array will start.
            *   `totalLengthOfTheFsmPageBlock`: The new total length of the contiguous FSM page block.
    *   **Internal State (`pageTransactionState`):**
        *   `buffer`: From options.
        *   `pendingBlocksToProcess`: An array. Initially contains `options.entry`. If page modifications free up old FSM page slots, those slots (as `{offset, size}`) are added here. (This manages the "circular logic" by iteration rather than deep recursion for FSM page slot freeing).
        *   `finalPageOperations`: An array of `{type: "write", offset: number, pageBuffer: Buffer}`. Collects all FSM page writes to be done at the end.
        *   `nextAvailableOffsetForNewOrRelocatedPages`: Initialized from `options.initialNextAvailablePageOffset`. Tracks the current end of the growing FSM page block.
        *   `currentHeadPageOffset`: Initialized from `metadata[0]?.freeSpaceOffset`.
        *   `updateMeta0HeadPointer(newHeadOffset)`: Callback to update `metadata[0].freeSpaceOffset` and `pageTransactionState.currentHeadPageOffset`.
    *   **Main Loop:**
        *   While `pendingBlocksToProcess` is not empty (with a safety iteration limit):
            *   Dequeue a `blockToInsert`.
            *   Call a recursive helper `_traverseAndProcessBlock(blockToInsert, pageTransactionState, pageTransactionState.currentHeadPageOffset, 0, pageTransactionState.updateMeta0HeadPointer)`.
    *   **Finalization:**
        *   Sort `finalPageOperations` by offset and execute them (write FSM pages to buffer).
        *   Calculate `totalLengthOfTheFsmPageBlock`:
            *   If `metadata[0].freeSpaceOffset` was set (or became set during processing): `pageTransactionState.nextAvailableOffsetForNewOrRelocatedPages - metadata[0].freeSpaceOffset`.
            *   Else (no pages created or head pointer not established): `0`.
        *   Update `metadata[0].freeSpaceLength` with this value. If length is 0, set `metadata[0].freeSpaceOffset` to 0.
        *   Return the result object.

*   **`_traverseAndProcessBlock(blockToInsert, state, currentPageChainOffset, predecessorPageOriginalOffset, predecessorLinkUpdater)` function:**
    *   **Base Case (No Current Page):** `!currentPageChainOffset`
        1.  Create a new FSM page object: `newPage = { entries: [blockToInsert], nextPage: 0 }`. (Sort entries if multiple initially).
        2.  `serializedNewPage = serializeFreeSpacePage(newPage)`.
        3.  `newAssignedOffset = state.nextAvailableOffsetForNewOrRelocatedPages`.
        4.  `state.nextAvailableOffsetForNewOrRelocatedPages += serializedNewPage.length`.
        5.  Add `{type: "write", offset: newAssignedOffset, pageBuffer: serializedNewPage}` to `state.finalPageOperations`.
        6.  Call `predecessorLinkUpdater(newAssignedOffset)` (this updates `metadata[0].freeSpaceOffset` or the previous FSM page's `nextPage` pointer).
    *   **Recursive Step (Page Exists):**
        1.  `parsedPage = getFreeSpacePage(state.buffer, currentPageChainOffset)`. Handle errors (e.g., log, try to bypass).
        2.  `modificationResult = _addEntryToPageOrHandleCapacity(parsedPage, blockToInsert)`. This function will try to add the entry and decide if the page needs rewrite, split, or if the entry should go to the next page.
        3.  **Handle `modificationResult.action`:**
            *   `"entry_added_rewrite_page"`:
                *   `newPageBuffer = modificationResult.newPageBuffer`.
                *   If `newPageBuffer.length <= parsedPage.pageSize` (fits/shrunk):
                    *   Add write op for `newPageBuffer` at `currentPageChainOffset`.
                    *   If shrunk, the leftover part of old slot `(currentPageChainOffset + newPageBuffer.length, parsedPage.pageSize - newPageBuffer.length)` becomes a new FSM page slot to manage. Add to `state.pendingBlocksToProcess`. **(SIMPLIFICATION: For now, ignore this freed sub-slot to keep it simpler. Assume exact overwrite or growth.)**
                *   Else (grew too large):
                    *   The old slot `(currentPageChainOffset, parsedPage.pageSize)` is now free for FSM pages. Add to `state.pendingBlocksToProcess`. **(SIMPLIFICATION: Ignore managing FSM page slots for now. Assume growth always means new page at end.)**
                    *   `newAssignedOffset = state.nextAvailableOffsetForNewOrRelocatedPages`. Update `state.nextAvailableOffsetForNewOrRelocatedPages`.
                    *   Add write op for `newPageBuffer` at `newAssignedOffset`.
                    *   Call `predecessorLinkUpdater(newAssignedOffset)`.
            *   `"page_split"`:
                *   `page1_obj_template = modificationResult.page1_obj_template`.
                *   `newPage2_Serialized = modificationResult.newPage2_Serialized`.
                *   The old slot `(currentPageChainOffset, parsedPage.pageSize)` is "freed." Add to `pendingBlocksToProcess` (or simplify by ignoring for now).
                *   Place Page 2: `page2NewOffset = state.nextAvailableOffsetForNewOrRelocatedPages`. Update state. Add write op for `newPage2_Serialized`.
                *   Finalize Page 1: `page1_obj_template.nextPage = page2NewOffset`. `final_newPage1_Serialized = serializeFreeSpacePage(page1_obj_template)`.
                *   Place Page 1: `page1NewOffset = state.nextAvailableOffsetForNewOrRelocatedPages`. Update state. Add write op for `final_newPage1_Serialized`.
                *   Call `predecessorLinkUpdater(page1NewOffset)`.
            *   `"go_to_next_page"`:
                *   Recursively call `_traverseAndProcessBlock(blockToInsert, state, parsedPage.nextPage, currentPageChainOffset, (newNextPageOffset) => { ... })`.
                *   The callback here is tricky: if `parsedPage.nextPage` needs to change to `newNextPageOffset`, then `parsedPage` itself is modified. It needs re-serialization and potential relocation (similar to "entry_added_rewrite_page" logic for `parsedPage` itself).

*   **`_addEntryToPageOrHandleCapacity(parsedPage, entry_to_add)` function:**
    *   **Returns:** `{action: string, ...data}`. Actions: `"entry_added_rewrite_page"`, `"page_split"`, `"go_to_next_page"`.
    *   Work on a copy of `parsedPage.entries`.
    *   **TODO (Crucial for efficiency, but can be deferred for initial pass): Merge `entry_to_add` with any adjacent/overlapping entries already in the page's list.**
    *   Insert `entry_to_add` into the copied `entries` list, maintaining sort order (e.g., by size).
    *   If `entries.length > MAX_ENTRIES_PER_PAGE`:
        *   Split `entries` into `entries1` and `entries2`.
        *   Return `{ action: "page_split", page1_obj_template: {entries: entries1, nextPage: /*placeholder*/0}, newPage2_Serialized: serializeFreeSpacePage({entries: entries2, nextPage: parsedPage.nextPage}) }`.
    *   Else (no split):
        *   Return `{ action: "entry_added_rewrite_page", newPageBuffer: serializeFreeSpacePage({entries: entries, nextPage: parsedPage.nextPage}) }`.
    *   (Consider adding a "go_to_next_page" condition if pages are strictly size-ranged, but for now, only split by count).

*   **`serializeFreeSpacePage({entries, nextPage})` function:** (Already mostly defined in first prompt's `makomChafshee.js`)
    *   Ensure it correctly handles dynamic byte sizes for `entryCount`, `entry.offset`, `entry.size`, and `nextPage` based on their actual maximum values *within that page*.
    *   Uses `packedLength` and `writeConditional` helpers.
    *   Structure: `[headerByte, entryCountVal, entry1_offset, entry1_size, ..., entryN_offset, entryN_size, nextPageVal]`.

*   **`getFreeSpacePage(buffer, pageOffsetInFile)` function:** (Already mostly defined)
    *   The reverse of `serializeFreeSpacePage`. Parses a page from the buffer.
    *   Returns `{entries, nextPage, pageOffset: pageOffsetInFile, pageSize: actualDiskSizeOfPage}`.

**II. `serializeMetadataEntry.js` & `get.js` (from prompt, for `metadata[0]`)**

*   **`serializeMetadataEntry.js` (`entryToBuffer`):**
    *   When serializing `metadata[0]`, if `entry.freeSpaceOffset` and `entry.freeSpaceLength` are present, it correctly includes them and sets the packed bits in `packedLengthSizes`. This is good.
*   **`get.js` (`parseMetadataEntry`):**
    *   It correctly checks the packed bits and reads `freeSpaceOffset` and `freeSpaceLength` if present. This is good.

**III. `deleteKeyFromJSON.js` (Using the new FSM)**

1.  Load `metadata` if not provided (`getObj.getMetadata(buffer)`).
2.  Find and remove the `deletedEntryDetails` from the `metadata` array.
3.  Define the `newlyFreedDataBlock = { offset: deletedEntryDetails.offsetOfValueInMain, size: deletedEntryDetails.valueLength }`.
4.  **Calculate `initialNextAvailablePageOffsetForFSM`:**
    *   `endOfKvData = getOffsetOfEndOfActualData(metadata.filter(m => m !== metadata[0]))` (calculate end of KV data *after* entry was removed from `metadata` array). Max with 3.
    *   If `metadata[0]?.freeSpaceOffset`: `initialNextAvailablePageOffsetForFSM = metadata[0].freeSpaceOffset + (metadata[0].freeSpaceLength || 0)`.
    *   Else: `initialNextAvailablePageOffsetForFSM = endOfKvData`.
5.  Call `fsmResult = updateSortedFreeSpaceAcrossMetadata(metadata, { buffer, entry: newlyFreedDataBlock, initialNextAvailablePageOffset: initialNextAvailablePageOffsetForFSM })`.
6.  `updatedMetadata = fsmResult.metadata`.
7.  `finalEndOfAllDataAndAllPages = fsmResult.endOfAllDataAndAllPages`.
8.  Call `overwriteMetadataAndHashTable(buffer, updatedMetadata, null, finalEndOfAllDataAndAllPages)`.
9.  Return relevant info.

**IV. `append.js` (Interaction with FSM - More Complex & Mostly for Future)**

*   For this initial implementation of `makomChafshee.js` focusing on *tracking newly freed space*, `append.js` doesn't heavily interact with it *yet* for *finding a slot*.
*   **Current `append.js` Behavior (Simplified for now):**
    1.  It will mostly append new data to the end of the current KV data section.
    2.  If `key` already exists:
        *   It calls `markEntryAsDeleted` (which is `deleteKeyFromJSON.js`). This handles freeing the old slot and updating FSM.
        *   `deleteKeyFromJSON` returns the `finalEndOfAllDataAndAllPages` after its FSM operations. This becomes the `current_logical_end_for_append`.
    3.  New data is written at `end_of_current_KV_data` (calculated before potential FSM growth).
    4.  `initialNextAvailablePageOffsetForFSM` for any *final FSM update/init* by append itself:
        *   Calculated similarly to `deleteKeyFromJSON.js`, but *after* new KV data is notionally placed/written.
    5.  `append.js` might call `updateSortedFreeSpaceAcrossMetadata` with `entry: null` if it needs to ensure FSM pages are initialized or if other structural changes necessitate FSM page updates (less common for simple appends).
*   **Future `append.js` (Using FSM to find slots):**
    1.  `findAvailableSlot(sizeNeeded)` would query the FSM pages (traverse `getFreeSpacePage`, look in `entries`).
    2.  If a slot is found:
        *   A new function `markFsmBlockAsUsed(state, usedSlot{offset,size})` would be needed in `makomChafshee.js`. This is the reverse of adding an entry – it removes/shrinks an entry from an FSM page, re-serializes, handles relocation, updates `metadata[0].freeSpaceLength`.
        *   Value data is written into the `usedSlot.offset`.
    3.  If no slot found, append to end as current.

**V. `overwriteTail.js`**

1.  Takes `finalEndOfAllDataAndAllPages` (from `updateSortedFreeSpaceAcrossMetadata` via `append.js` or `deleteKeyFromJSON.js`). This is the offset where the hash table / metadata array / footer begins.
2.  `makeHashTableFromMetadata(metadata)` serializes the `metadata` array. `metadata[0]` (if it exists and was updated) will contain the correct `freeSpaceOffset` and `freeSpaceLength` due to `updateSortedFreeSpaceAcrossMetadata`.
3.  The `dataLength` field written into the file's main header (packed byte) and footer should now be this `finalEndOfAllDataAndAllPages`.

**VI. Helper: `getOffsetOfEndOfActualData(metadataArray)`**

*   Create this small utility function.
*   It iterates through `metadataArray` (which should NOT include `metadata[0]` if `metadata[0]` is purely for FSM pointers and not a real KV entry).
*   Calculates `Math.max(3, ...entry.offsetOfValueInMain + entry.valueLength)`.

---

**Summary of What Needs to be Done (for another AI to start over on `makomChafshee.js` and integrate):**

1.  **Implement `makomChafshee.js` based on the detailed plan in Section I.**
    *   Focus on `updateSortedFreeSpaceAcrossMetadata` as the main entry point.
    *   Implement `_traverseAndProcessBlock` for recursive page handling.
    *   Implement `_addEntryToPageOrHandleCapacity` for adding entries to a page and deciding on splits.
    *   Ensure `serializeFreeSpacePage` and `getFreeSpacePage` are robust.
    *   Correctly manage `pageTransactionState` to handle writes and iterative processing.
    *   Ensure `metadata[0].freeSpaceOffset` and `metadata[0].freeSpaceLength` are accurately updated to reflect the contiguous FSM page block.

2.  **Create `getOffsetOfEndOfActualData(metadataArray)` helper.**

3.  **Modify `deleteKeyFromJSON.js` as per Section III.**
    *   It will calculate the correct `initialNextAvailablePageOffsetForFSM`.
    *   It will call `updateSortedFreeSpaceAcrossMetadata` with the details of the deleted item's value slot.
    *   It will pass the resulting `finalEndOfAllDataAndAllPages` to `overwriteMetadataAndHashTable`.

4.  **Modify `append.js` (Simplified Interaction for now - Section IV):**
    *   If replacing a key, it relies on `deleteKeyFromJSON.js` to handle FSM updates for the old slot.
    *   When appending new data:
        *   Determine where new KV data goes (end of current KV data).
        *   Write this new KV data.
        *   Calculate `initialNextAvailablePageOffsetForFSM` to be *after* this new KV data.
        *   Call `updateSortedFreeSpaceAcrossMetadata` (likely with `entry: null`) to allow FSM to write/update its pages in the designated FSM block.
        *   Pass results to `overwriteMetadataAndHashTable`.
    *   **Defer the "find slot in FSM and use it" logic for `append.js` to a later stage.**

5.  **Modify `overwriteTail.js` as per Section V.**
    *   Use the `finalEndOfAllDataAndAllPages` parameter to determine where the hash table, metadata array, and footer start.
    *   Ensure the `dataLength` in the main file header/footer correctly reflects this `finalEndOfAllDataAndAllPages`.

**Key Simplifications for this "Initial Working" Version:**

*   FSM pages are always written/appended to a **contiguous block**. `metadata[0].freeSpaceLength` refers to the length of this block.
*   When an FSM page is relocated due to growth, its old slot is *not* (yet) added back into a list of "free slots for FSM pages." It's just abandoned, and the FSM page block grows at the end. This avoids immediate deep recursion for managing the FSM's own space.
*   `append.js` does not yet try to find and use free slots from the FSM pages. It appends new data.
*   Merging of adjacent/overlapping free blocks within an FSM page is a TODO but can be deferred for the very first pass if absolutely necessary (though highly recommended for efficiency).

This plan provides a structured approach to get a foundational, working free space manager that uses paged allocation for the free space entries themselves, with a clear path for future enhancements.




B"H
Yo im TRYING TO MAKE A EW FILE FORMAT WITH DYNAMIC ENTRIES INCLUDING NESTED ENTRIES GOING BACK TO ORIGINAL OBJECT NOT NESRTED WIHTIN ITSELF. CURRENTLY TRAKCING FREE SPACE BY LOOKING FOR GAPS IN METADATA ENNTRIES OFFSETS BUT WHE NI ALTER ADD NESTED OBJECTS CANT DO THAT BECAUSE I DONT PLAN ON ADDING unqiue entries at the base level but only indivudally poiting to offsets in the main. can u finish writing makomChafshi.js file and possibly a few changes in append.js to finalzie it? need to write a new "page" (free sapce trakcing is like linked list but isnteado f direct linked list which is brutal in processing time its a linked lsit of "pages" whereeach page has cerrain range of sorted free space entries (offset and size)

need logic to indtialy add firs tpage and keep adding new pages and add entries wihtin page (only rewrite that one page or if it gets too big then split into new page and rewrite pages before and after)

alomst there

The tricky part is that when adding a new page or updating one (which requires rewriting it and marking old space as empty (depedning on if its bigger: may need new slot. if smaller: probably will fit in old slot but remaining space beacuse free again. or maybe would fit in other smaller slot)) whcih is kidn of circular logic since these pages are meant to find free space but hwen updating / adding / removing them we also need to update the free space to account for them themselves so not sure how to do that

The logic in makomChafshi is incomplete, but dont redo the logic that already exists. notice how the lengths of the entry offsets and lengrhs are dynamic (per page, even though within each page they are the same)

This is by design because maybe it'll keep growing and the total offset size of the entire file may be big, but each individual page may still be able to deal with earlier parts of the file that have smaller by sizes for each offset etc. anyways just competely the logic

Please do NOT rewrite ALL of the code, even though u can. i want to save the ocmments and line breaks of all code and even the logic of the vast majority of it, currently i just need help rewriting insertFreeSpaceEntry and maybe edits to other funcionts IF needed,

the logic i think is infnite recursion unless u help

when i add a new free espace entry, i llook for the "page" of sroted free spce entries that it fits in

if it fits i fit it and researlizae that entire page to bytes. now i need to:

mark the "old" entry space as free, which includes the entire proceess of finding new free space pages it fits in. if found, then I dit that NEW page, then I'm stuck with the same problem (have to mark old page as deleted then rewrite other one) and it seems to keep going forever

and i need to figure out hwat to do if no fre siz pages sexited yet.

and other issues. also i think i need to fix append and overrwiteTail in the cases whre i need to add free space pages at the end of the data seciotn, possibly along with other daa thatw awas already planned on being added, need to account for it

keep all liens breaks the same and keep all comments, possibly add ur own for necessary fixes

a potential proposed solution with "stub" redirects, what do u think any issues?

(from another ai:)

🧾 Overview: Flat-File Object System with Dynamic Free Space Tracking
🗂 File Structure
One monolithic file (Buffer) divided dynamically.

All objects (root-level and nested) store their data in the same global data area.

Every object maintains its own metadata array of offsets & sizes pointing to entries in the global data area.

🧱 Original Free Space Strategy: Gap Finder
Originally, free space was found using a gap-finder strategy:

You scan the root metadata array.

Sort entries by offset.

Look for gaps between entries (e.g., offset[i+1] > offset[i] + size[i]).

Allocate into those gaps.

✅ Pros
Simple, fast for flat root metadata.

Requires no extra metadata.

❌ Cons
Fails when entries are nested:

Nested objects write their data into the global data area.

The root metadata no longer sees them.

Gap-finder now misidentifies valid occupied space as free, leading to corruption.

✅ New Strategy: Global Free Space Pages with Pointer-Stubs
All allocation and deallocation is now managed by a linked list of free-space pages.

📘 Free Space Page Format
Each page contains:

js
Copy
Edit
{
  entries: [ { offset, size }, ... ]  // sorted by size (or offset)
  nextPage: offset (to next page)
}
Stored somewhere inside the same file.

Pages are linked using a nextPage pointer.

🔁 Allocation & Deallocation
📤 Allocation (allocate(size))
Start at the first free-space page (root pointer).

Resolve any stubs (see below).

Scan entries to find first hole ≥ size.

Allocate:

If entry == exact size → remove it.

If entry > size → reduce entry and rewrite page.

If no hole fits:

Walk to nextPage.

If none, append new data at end of file.

🗑 Deallocation (free(offset, size))
Insert {offset, size} into the sorted entry list of the first page.

Serialize the page:

If the updated page fits in its original location → overwrite in-place.

If it doesn’t fit anymore:

Allocate new space for the bigger page.

Write new version there.

Overwrite the old page with a stub pointing to the new one.

Do not add old page to free list.

🔄 Copy-on-Write and Stub Records
Why?
Rewriting a free-space page can’t generate another free-space entry — or you'd trigger recursive bookkeeping writes → infinite loop.

🪧 Solution: Stubs
A stub is a small record placed at the old page offset:

js
Copy
Edit
[ STUB_MAGIC ][ varint(newOffset) ]
Any time a pointer (like nextPage) is followed, you:

Read the byte at that offset.

If it’s STUB_MAGIC, follow its varint to the new page location.

Otherwise, parse as a normal page.

✅ Benefits
Breaks infinite recursion.

Old page space is not lost:

Treated as small usable region.

Overwritten in future allocations.

⚙️ Insertion Logic Summary
js
Copy
Edit
function insertFreeEntry(entry) {
  let offset = resolveStubChain(rootFreePageOffset);
  let page = parsePage(buffer, offset);

  if (page.canFitNewEntry(entry)) {
    let updated = page.addEntry(entry);

    if (updated.serialized.length <= page.pageSize) {
      writeInPlace(offset, updated.serialized);
    } else {
      let newOffset = allocateSpace(updated.serialized.length);
      writeAt(newOffset, updated.serialized);
      overwriteWithStub(offset, newOffset);
      // Optionally, update parent pointer
    }
  } else if (page.nextPage) {
    insertFreeEntryAt(page.nextPage, entry);
  } else {
    createNewTailPage(entry);
  }
}
🛑 Critique Points for Review
A second AI reviewing this system should evaluate:

Stub Resolution Cost

Pointer chains could be multiple hops if not collapsed.

Does this add measurable overhead?

Fragmentation Over Time

Do stub leftovers leave unusable “islands”?

Can frequent stub reuse reduce that?

Concurrency / Consistency

Are pointer updates atomic enough?

Can page relocations be interrupted or partially written?

Scaling with Millions of Entries

Is scanning + rewriting page chains efficient at scale?

Does stub reuse keep stub count low?

Crash Recovery

Should stub chains be bounded?

Could redundant chains cause inconsistencies?

🔚 Summary
This system offers a self-contained, fully dynamic flat-file structure where:

All objects (root or nested) share the same free-space system.

Metadata is updated copy-on-write.

Stub pointers replace freed metadata regions, breaking recursion.

No global gap-finding is required, solving nested-tracking problems.