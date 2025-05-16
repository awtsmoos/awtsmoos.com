//B"H
/*
    free space manager
*/
const writeConditional = require("../../helpers/writeConditional.js");

var {
	packedLength,
	unpackLength
} = require("../../packing/packedLength.js")

/**
 * 
 * @param {Array} metadata array or 
 * reference to metadata array of obj 
 * @param {*} newFreeSpaceList Array of the
 * entire updated free space list
 * @param {*} options (IF deleted a key, entry is 
 *  the last entry we deleted from last list,
 * which now makes that the new free space
 * to insert in the sorted list.
 * 
 * IF "operation" is "added", then 
 * we took away "entry" from previous list.
 * )
 * @returns 
 */
function updateSortedFreeSpaceAcrossMetadata(
    metadata, 

    options = {
		buffer=null,
        entry = {
            offset= 0,
            size= 0
        }={},
        operation= "deleted"
    } = {}
) {
	return metadata; //TODO
	if(!buffer) {
		return null;
	}
	if(!Array.isArray(metadata) || !metadata.length) {
		return metadata;
	}
	if(!Array.isArray(newFreeSpaceList)) {
		return metadata;
	}
    var entry = options?.entry;
    /*
        if the last entry that was deleted
        (and is now free space) was provided,
        then attempt to modify the 
        metadata object without rewriting 
        everything.
    */
	if(entry) {
		var {
			offset,
			size
		} = entry;
		var slotThatsJustBarelySmaller = null;
		var slot;
		var lastSize = 0;
		var first = metadata[0];

		
		var firstPageOffset = metadata?.[0]?.freeSpacePageOffset;

		
		var res = insertFreeSpaceEntry({
			buffer, 
			entry: {
				offset,
				size
			},
			
			firstPageOffset
		});
		var s = res.success
		if(s) {
			var eo = s.entryOffset;
			if(s.first) {
				metadata[0].freeSpacePageOffset = eo;
				return metadata
			}
		}
		
		

		
	}
}


/*
	first
	look for place to insert new free
	space entry in existing free
	space pages.

	Or if no free pages exist,
	make new one and insert this entry
	as first one.


	Then, we need to modify
	the free page itself (
	if one already existed)

	since we are adding, then
	the page will get bigger

	in that case, before marking
	that space as "empty",
	we conceptually "add" the
	new serialized page to the 
	end of the data section.

	Then, we mark the old
	space it occupied as "free".

	This involves searching through the 
	free list again to find where it
	belongs, which involves 
	appending it again 
	to another page, which causes that
	page to grow, which then repeats the
	cycle, potentially for al 
	existing free space pages..
*/
function insertFreeSpaceEntry({
	buffer, //file buffer / input "buffer" of main data
	entry, //free space (offset, size)
	firstPageOffset = 0, //0 is null 
	

}) {
	var entrySize = entry.size;
	var entryOffset = entry.offset;
	if(!firstPageOffset) {
		/*
			we need to make the first page
		*/
		var pageToMake = serializeFreeSpacePage({
			entries: [
				entry
			],
			nextPageOffset: 0,
			extraEntries: 10
		});

		/*
			since this is "officially" the first
			free space page, check if the newly
			added free space entry itself
			is big enough to hold it
		*/

		
		if(entrySize >= pageToMake.length) {
			
			var wrote = actuallyWriteToFreeSpace({
				buffer,
				freeSpaceOffset: entryOffset,
				freeSpaceLength: entrySize,
				firstPageOffset,
				data: pageToMake
			});
			
			if(wrote.error) {
				return wrote;
			}

			

			return {
				success: {
					wrote,
					entryOffset,
					entrySize,
					first: true
				}
			}
		}

	} else {
		var firstPage = getFreeSpacePage(
			buffer,
			firstPageOffset
		);
		var newPageInfo = lookThroughSortedEntriesToSeeIfFits(
			buffer,
			firstPage,
			entry
		);
		if(newPageInfo.bigger) {
			/*
				make new page 
				at end of chain.

				It's at the end of the chain.
				because it's currently
				bigger than all other 
				entries across
				all other pages.

				Just because it's 
				at the end of the
				logical chain of 
				sorted free space entry
				pages,
				doesn't mean its actually
				at the end of all data.

				We should search through
				the free space list
				to see if this new,
				small page (which has just
				this entry and some 
				empty buffer zone entries)
				can fit in the free list itself.


				(meaning, see if we can CLAIM some
				existing free space, not make more 
				free space).


				
			*/
			if(newPageInfo.error) {
				return {
					error: {
						message: "Issue when adding new entries",
						newPageInfo,

					}
				}
			}

			var previousPage = newPageInfo?.previousPage;
			var prevPageIndex = previousPage?.pageOffset;
			if(!prevPageIndex) {
				return {
					error: {
						message: `Not first page, yet don't have prev page.`,
						newPageInfo
					}
				}
			}

			var newPageInChain = serializeFreeSpacePage({
				entries: [
					entry
				],
				previousPageOffset: prevPageIndex
			});

			
			
			var seeIfThisNewPageItselfCanFitInExistingFreeSpace = 
				findAndClaimFreeSpace({
					buffer,
					firstPageOffset,
					data: newPageInChain
				});
			var er = seeIfThisNewPageItselfCanFitInExistingFreeSpace.error;
			if(er) {
				return er;
			}
			var suc = seeIfThisNewPageItselfCanFitInExistingFreeSpace.success;
			if(suc) return suc;

		} else {
			var {
				serialized,
			} = newPageInfo;
			/*
				delete old location of page,
				and rewrite the serialized
				page to new free-est location
			*/
			var olderOffset = firstPage.pageOffset;
			var olderLength = firstPage.pageSize;

			var newSize = serialized.length;

		}

	}
}

function findAndClaimFreeSpace({
	buffer,
	firstPageOffset,
	data//to insert
}) {
	var possibleFreeSpaceEntry = 
		findFreeSpaceEntry({
			buffer,
			sizeNeeded: data.length,
			pageOffset: firstPageOffset
		});

	var er = possibleFreeSpaceEntry.error;
	if(
		er
	) {
		if(er.code == "TOO_BIG_FOR_ALL") {
			/*
				this means that even
				the size of our new, tiny
				page is too big for
				all currently available
				free space slots.

				So we got to tell whoever
				called this function to
				add it to end.

				It should also know to 
				update the pointer
				of the previous page,
				if it exists,
				to the new offset at 
				the end of the file.
			*/
			return {
				pageAtEnd: newPageInChain,
				previousPageToUpdate: prevPageIndex
			}
		} else {
			return {
				error: {
					message: "Issue trying to find free space",
					details: er
				}
			}
		}
	}

	var suc = possibleFreeSpaceEntry.success;
	if(suc) {
		/*
			we were able to find the specific entry,
			and page, to CLAIM.

			Now, we need to actually claim it
			(which REMOVES it from the list and updates the list)
		*/
		var cl = claimFreeSpaceEntry({
			buffer,
			newData: data,
			entry: suc.entry,
			page: suc.page,
			firstPageOffset
		});
		return cl;

	}
}

/*

	this function actually 
	claims and updates
	the linked list (to claim all
	or partial amount of needed space)
	if successful.

	Called (usually?)
	after already FINDING 
	what specific entry,
	in what specific page,
	you want to claim.

	This then takes the claim
	"out" of the page,
	and rewrites the page.
	Possibly rewrites it 
	in the same place with the
	same length and with 
	some buffer entries,
	to reduce cascading 
	writes across other free
	space pages, or, if too small,
	"concatenates" the
	additional / empty free
	space entries (including ones 
	that have already been deleted)

	to certain amount, then marks
	the REMAINING free space
	as "free", in the list.

	If our page becomes empty,
	and has potentially some 
	leftover empty entries left,
	then mark that remaining space as
	free, and determine
	if we have nextPage or prevPage
	pointers and combine the ones
	before and/or after.
*/
function claimFreeSpaceEntry({
	buffer,
	entry = {
		offset=0,
		size=0
	}={},
	entryIndex,
	firstPageOffset,
	page, //PARSED page
	newData //data to actually write to free space
}) {
	var ents = page?.entries;
	if(!Array.isArray(ents)) {
		return {
			error: {
				message: "No parsed page found",
				code: "INVALID_PAGE",
				tried: page
			}
		}
	}
	if(!newData) {
		return {
			error: {
				message: "No new data to write provided",
				code: "NO_DATA"
			}
		}
	}

	
	var pageOffset = page?.pageOffset;
	if(!pageOffset) {
		return {
			error: {
				message: "Page offset out of bounds",
				code: "P_OFFSET_OUT_OF_BOUNDS",
				page
			}
		}
	}

	var entrySize = entry.size;
	var entryOffset = entry.offset;
	if(!entrySize || !entryOffset) {
		return {
			error: {
				message: "Entry Parameters Out of Bounds",
				code: "ENTRY_OUT_OF_BOUNDS",
				entry
			}
		}
	}

	var foundEntry = null;
	var indexOfFound = -1;
	var smaller = null;
	var i;
	for(i = 0; i < ents.length; i++) {
		var ent = ents[i];
		if(ent.size < entrySize) {
			smaller = ent;
		} else {
			foundEntry = ent;
			indexOfFound = i;
			break;
		}
	}

	/*
		cross reference to be sure
	*/
	var hasIt = null;
	if(entryIndex || entryIndex === 0) {
		hasIt = ents[entryIndex];
		if(!hasIt) {
			/*
				if entryIndex is provided
				we should always find it
			*/
			return {
				indexOfFounderror: {
					message: "Issue when tracking entry Index",
					code: "ENTRY_INDEX_ISSUE",
					page,
					entry,
					entryIndex
				}
			}
		}
	}
	if(!foundEntry) {
		return {
			error: {
				message: "Weird, can't find the entry",
				code: "CANT_FIND_ENTRY",
				page,
				entry,
				entryIndex,
				hasIt
			}
		}
	}

	if(
		hasIt &&
		(
			hasIt.size != foundEntry.size ||
			hasIt.offset != foundEntry.offset
		)
	) {
		/*
			this means we have "both" from
			our own logic and entryindex
			but they don't match

		*/
		return {
			error: {
				message: "Found entry, and entry index mismatach",
				code: "ENTRY_INDEX_MISMATCH",
				foundEntry,
				entryIndex,
				hasIt,
				page,
				entry
			}
		}
	}

	if(indexOfFound < 0) {
		/*
			this should never happen

			but just in case
		*/
		return {
			error: {
				message: "Weird index issue",
				code: "INDEX_OF_FOUND_INVALID",
				indexOfFound,
				page,
				entry,
				i,
				foundEntry
			}
		}
	}

	var removed = page.entries.splice(
		indexOfFound,
		1
	);

	/*
		gotta figure out 
		how many extra entries to add
	*/
	var updatedPage = serializeFreeSpacePage({
		entries: page.entries,
		nextPageOffset: page.nextPageOffset,
		previousPageOffset: page.previousPageOffset,
		extraEntries: 0 //adjust later based on size etc.
	});

	/*
		need to mark our old page
		as "empty" and rewrite our new claimed page
	*/

	var pageWrote = insertFreeSpaceEntry({
		buffer,
		entry: {
			offset: page.pageOffset,
			size: page.pageSize
		},
		firstPageOffset
	});

	if(pageWrote.error) {
		return pageWrote;
	}

	var newPageWritten = findAndClaimFreeSpace({
		buffer,
		firstPageOffset,
		data: updatedPage
	})

	if(newPageWritten.error) {
		return newPageWritten;
	}


	var wrote = actuallyWriteToFreeSpace({
		buffer,
		freeSpaceLength: entrySize,
		freeSpaceOffset: entryOffset,
		data: newData,
		firstPageOffset
	});

	if(wrote.error) {
		return wrote;
	}

	return {
		success: {
			wroteUpdatedPage: newPageWritten,
			wroteNewData: wrote,
			markedOldPageAsEmpty: pageWrote
		}
	}



}

function actuallyWriteToFreeSpace({
	buffer,
	freeSpaceOffset,
	freeSpaceLength,
	firstPageOffset,
	data
}) {
	if(!Buffer.isBuffer(data)) {
		return {
			error: {
				message: "data must be buffer",
				code: "WRONG_DATA_TYPE"
			}
		}
	}
	var wrote;
	/*
		going to try to actually
		write 
	*/
	try {
		wrote = buffer.write(
			freeSpaceOffset,
			data
		)
		
	} catch(e) {
		return {
			error: {
				message: "System error when writing",
				code: "SYSTEM_WRITE_ERROR",
				e,
				stack: e.stack
			}
		}
	}

	if(wrote.error) {
		return {
			error: {
				message: "Write error",
				details: wrote
			}
		}
	}

	var leftOver = freeSpaceLength - data.length;
	if(leftOver > 0) { /*
			after we write in our 
			new free area, there's still
			some free space unused.
			got to repurpose it.

		*/
		var newOffset = data.length + freeSpaceOffset;
		
		try {
			var er = insertFreeSpaceEntry({
				buffer,
				entry: {
					offset: newOffset,
					size: leftOver
				},
				firstPageOffset
			});

			if(er?.error) {
				return {
					error: {
						message: "Internal error when adding leftovers",
						stack:er
					}
				}
			}
		} catch(e) {
			return {
				error: {
					message: "Couldn't add leftover space",
					stack: e.stack
				}
			}	
		}
	}
}
/*
	This function is used to attempt 
	to find existing free
	space entry that is within 
	the size needed, 
*/
function findFreeSpaceEntry({
	buffer,
	sizeNeeded = 0,
	pageOffset
}) {
	var pageToCheck = getFreeSpacePage(
		buffer,
		pageOffset
	);

	if(pageToCheck.error) {
		return {
			error: pageToCheck.error,
			code: "PAGE_READ_ISSUE",
			pageOffset
		}
	}

	var real = pageToCheck.entries.filter(q => q.size > 0);
	if(!real.length) {
		/*
			page is empty.
			strange. 

			check if it has
			next page anyways
		*/

		var nextPagePoitner = pageToCheck.nextPageOffset;
		if(!nextPagePoitner) {
			return {
				error: {
					message: "no entries and no next page",
					code: "EMPTY_ENTRIES_AND_NO_NEXT"
				}
			}
		}
	}

	var lastReal = pageToCheck.entries[
		pageToCheck.entries.length - 1
	];;

	var ind = pageToCheck.indexOf(lastReal)
	if(ind < 0) {
		/*
			this should never happen
			because we already got it
			from the array
		*/
		return {
			error: {
				message: "Weird array issue",
				code: "ARRAY_MISMATCH_ENTRIES",
				pageToCheck,
				index: ind,
				lastReal
			}
		}
	}
	if(lastReal.size == sizeNeeded) {
		return {
			success: {
				entry: lastReal,
				entryIndex: ind,
				page: pageToCheck
			}
		}
	}
	if(lastReal.size < sizeNeeded) {
		/*
			our size needed is
			greater than
			the greatest one
			available.

			keep checking next page,
			if exists
		*/
		var nextPage = pageToCheck.nextPageOffset;
		if(!nextPage) {
			return {
				error: {
					message: "too big for all pages",
					code: "TOO_BIG_FOR_ALL"
				}
			}
		}

		return findFreeSpaceEntry({
			buffer,
			sizeNeeded,
			pageOffset: nextPage
		});

	}

	/*
		this must mean
		that our size needed is 
		less than the 
		greatest size.

		And since the entries
		are ordered in ordered
		pages that we could have
		maybe checked earlier,

		it should definetely be 
		in THIS page somewhere
	*/
	var greaterSizeClosestToWhatWeWant = null;
	var i = 0;
	var ent;
	for(ent of pageToCheck.entries) {
		if(ent.size >= sizeNeeded) {
			greaterSizeClosestToWhatWeWant = ent;
			i++;
		} else {
	
			break;
		}
	}

	if(!greaterSizeClosestToWhatWeWant) {
		return {
			error: {
				message: "Something went wrong finding it",
				pageToCheck
			}
		}
	}

	return {
		success: {
			entryIndex: i,
			entry: greaterSizeClosestToWhatWeWant,
			page: pageToCheck
		}
	};



}

/*
	this function is used to
	ADD new free space
	to existing free space pages,
	or if {bigger} is returned,
	it means that the free 
	space entry is bigger 
	than all available
	slots across all free
	space pages.

	Issue, is that when a free space
	definetely grows, it needs
	to be rewritten, and its old 
	page needs to be marked
	as free, which means
	adding a new free entry
	back to the list.

	need a way of limiting this


	solution:

	allocate each page with a few
	extra entries 

	when adding an new free space
	entry to a desired page
	and its full,
	AND its less than the 
	absolute "max page size" amount:

	upgrade page size by a few entires

	maybe, 5

	insert the new free sapce block

	to fix our earlier recursion issue:

	insert the reference to its OLD
	self in the NEW, bigger
	block

	this works because it has a few
	more entries, so upgrading
	one doesn't cascade to another.

	it holds its own previous version.

*/
function lookThroughSortedEntriesToSeeIfFits(
	buffer,
	parsedPage,
	entry,
	nextPageOffset = 0,
	previousPageOffset = 0
) {
	var entries = parsedPage?.entries;
	if(!Array.isArray(entries)) {
		return null;
	}


	/*
		when initially made
		each page should 
		have some amount of 
		empty entries at 
		the END of the entries list.
	*/

	var lastRealEntry = null;
	var emptyEntries = [];
	var i;
	for(
		i = entries.length - 1;
		i >= 0;
		i--
	) {
		var ent = entries[i];
		if(ent.size == 0 || ent.offset == 0) {
			emptyEntries.push(i);
			continue;
		}

		lastRealEntry = ent;
		break;
	}
	
	var lastEntrySize = lastRealEntry?.size
	if(!lastRealEntry || !lastEntrySize) {
		return {
			error: {
				message: "Doesn't have any real entries",
				code: "NO_REAL_ENTRIES",
				entries
			}
		}
	}
	
	if(size <= lastEntrySize) {
		/**
		 * considering
		 * we're starting
		 * from the page(s) with
		 * the least amounts,
		 * in sorted order,
		 * this condition means
		 * that the size fits 
		 * within this page
		 */
	
		var lastEntry = null;
		var index = 0;
		var foundEntry = null;
		var en;
		for(en of entries) {
			if(entry.size == 0) {
				continue;
			}
			if(size < entry.size) {
				lastEntry = en;
				index++;
				continue;
			} else {
				foundEntry = lastEntry; /*
					the first
					entry in the list
					that it's greater than,
					assuming we are less
					than or equal to 
					the greatest one.
				*/
				break;

			}
		}
		if(!foundEntry) {
			return {
				bigger: true,
				error: true,
				lastEntry,
				parsedPage
			}; /*
				something happened,
				so attempt to
				append new page at 
				the end.

				But still keep track
				that we had an error
				in this case
				which shouldn't have
				happened
			*/
		}
		/*
			insert our entry into 
			the current free space
			page
		*/
		entries.splice(index, 0, foundEntry);

		

		/*
			on inital write we should
			have given it some extra
			entries to allow it to
			be rewrittten in place without
			being immedetely rewritten,
			so we don't cascade writes.

			As we add this new entry
			we also remove 
			one of the empty 
			entry place holders,
			if it exists,
			so we have the same
			byte space
			(unless byte size of 
			next/prevPageOffset or the 
			entry offset / length size for this
			page changed, which is rare).

		*/
		var emptyEntryIndex = emptyEntries[0];
		if(emptyEntryIndex || emptyEntryIndex === 0) {
			var extraEntry = entries[emptyEntryIndex];
			if(
				extraEntry.size == 0 || 
				extraEntry.offset == 0 /*
					double check that 
					we're actually removing 
					an EXTRA entry and not a
					legitamate one.
				*/
			) {
				entries.splice(emptyEntryIndex, 1)
			}
		}
		/*
			serialize new, BIGGER free 
			space page, which needs to 
			later be rewritten in a new
			location, and the old 
			free page needs to be dealt with.
		*/
		var serialized = serializeFreeSpacePage({
			entries,
			nextPageOffset,
			previousPageOffset
		});
		var oldPageSize = parsedPage.pageSize;
		var pageOffset/*current page
		 offset in buffer (soon to be OLD page)*/ = parsedPage.pageOffset;
		return {
			serialized,
			oldPageSize,
			pageOffset//offset of OLD page entry
		}

	} else {
		/*
			our size is bigger than
			the biggest entry.

			Therefore, we must check 
			next page.
		*/
		var nextPageOffset = parsedPage?.nextPageOffset;
		if(nextPageOffset) {
			var curPageOffset = parsedPage.pageOffset;
			var nextPage = getFreeSpacePage(
				buffer,
				nextPageOffset
			);
			return lookThroughSortedEntriesToSeeIfFits(
				buffer,
				nextPage,
				entry,
				0,
				curPageOffset
			)
		} else {
			/*
				our free space entry
				is bigger than all 
				previous entries found 
				in all existent pages.

				Make new page with this entry

				This is only if our 
				free space entry
				does not fit in ANY current 
				FSPs (free space pages).
			*/
			return {
				bigger: true,
				previousPage: parsedPage

			}
		}
	}
}

function serializeFreeSpacePage(
	{
		entries,
		nextPageOffset = 0,
		previousPageOffset = 0,
		extraEntries = 5
	}={}
) {

	if(!Array.isArray(entries)) {
		return null;
	}
	entries = entries.concat(...Array.from({
		length: extraEntries
	}).map(q => ({
		offset: 0,
		size: 0
	})));

	var entryLength = entries?.length;
	if(!entryLength) return null;
	var entryLengthData = writeConditional(
		entryLength
	)
	var prevPageData = writeConditional(
		previousPageOffset

	)

	var prevPageByteSize = prevPageData.size;
	var nextPageData = writeConditional(
		nextPageOffset
	);
	var nextPageByteSize = nextPageData.size;
	var pagePointerSize = Math.max(
		prevPageByteSize,
		nextPageByteSize
	)

	var entryLengthSize = entryLengthData.size;
	var allOffsets = entries.map(q => q.offset)
	var allEntryLengths = entries.map(q => q.size);

	var maxEntryLength = Math.max(...allEntryLengths);
	var maxOffset = Math.max(...allOffsets);


	var offsetSize = writeConditional(maxOffset).size;
	var entryLengthSize = writeConditional(maxEntryLength).size;

	var firstByte = Buffer.from([
		packedLength(
			entryLengthSize
		) | 
		//0b00000011
		(
			packedLength(
				offsetSize
			) << 2
			//0b00001100
		) | (
			packedLength(
				entryLengthSize
			) << 4
			//0b00110000
		) | (
			packedLength(
				pagePointerSize
			) << 6
			//0b11000000
		)
	]);
	var extraReservedHeader = Buffer.from([0])
	var singleEntryLength = (
		maxEntryLength +
		maxOffset
	);
	var entryBufferLength = entryLength * singleEntryLength;

	var entryBuffer = Buffer.alloc(
		entryBufferLength
	);
	var offset = 0;
	var entry;
	for(entry of entries) {
		var entry = Buffer.alloc(singleEntryLength);
		entry.writeUIntBE(
			entry.offset,
			0,
			maxOffset
		);
		entry.writeUIntBE(
			entry.size,
			maxOffset,
			maxEntryLength
		);
		entry.copy(entryBuffer, offset);
		offset += singleEntryLength;

	}

	var prevPageBuffer = prevPageData.buffer;

	var nextPageBuffer = nextPageData.buffer;
	var fullPageBuffer = Buffer.concat([
		firstByte,
		extraReservedHeader,
		entryBuffer,

		prevPageBuffer,
		nextPageBuffer
	])
	return fullPageBuffer;
}
/*
	structure for each free space chunk:

	first byte: byte sizes of:
		number of entries size
		offset size
		length size
		size of next offset
	number of entries
	
	entries:
		offset (of available data)
		size (of that data)
	next page offset
*/
function getFreeSpacePage(buffer, pageOffset) {
	try {
		var offset = pageOffset;
		var firstByte = buffer.readUInt8(offset);

		var byteSizeOfNumberOfEntries = unpackLength(
			0b00000011 & firstByte
		);
		var sizeOfEachEntryOffset = unpackLength(
			(0b00001100 & firstByte)
			>> 2
		);
		var sizeOfEachEntryLength = unpackLength(
			(0b00110000 & firstByte)
			>> 4
		); //even if the lengths are different,
			//we have uniform length for each
			//page
		var sizeOfOffsetOfPagePointer = unpackLength(
			(0b11000000 & firstByte)
			>> 6
		);

		offset++; //reserved byte
		offset++;
		var numberOfEntriesInThisPage = buffer.readUIntBE(
			offset,
			byteSizeOfNumberOfEntries
		);

		offset += byteSizeOfNumberOfEntries;

		var totalByteSizeEntries = (
			numberOfEntriesInThisPage * (
				sizeOfEachEntryOffset + 
				sizeOfEachEntryLength
			)
		);
		var sizeOfRemaining = (
			totalByteSizeEntries +
			sizeOfOffsetOfPagePointer * 2 /*
				next and previous page
				pointers
			*/
		);

		var totalByteSizeOfPage = (
			2 /*header + reserved byte*/ + 
			byteSizeOfNumberOfEntries + 
			sizeOfRemaining
		);

		var pageBuffer = buffer.subarray(
			offset,
			offset + sizeOfRemaining
		);
		

		/*
			only load one page
			of entries at a time 
			into memory.

			Good for huge lists,
			and reduces fragmentation,
			since instead of simple linked
			list that takes forever to 
			traverse,
			we have a linked list of lists..
		*/
		offset = 0;
		var entries = [];
		var i;
		for(i = 0; i < numberOfEntriesInThisPage; i++) {
			var offset = pageBuffer.readUIntBE(
				offset,
				sizeOfEachEntryOffset
			);
			offset += sizeOfEachEntryOffset

			var entryLength = pageBuffer.readUIntBE(
				offset,
				sizeOfEachEntryLength
			);

			offset += entryLength;
			entries.push({
				offset,
				size: entryLength
			});

		}

		var prevPageOffset = pageBuffer.readUIntBE(
			offset,
			sizeOfOffsetOfPagePointer
		)

		offset += sizeOfOffsetOfPagePointer;

		var nextPageOffset = pageBuffer.readUIntBE(
			offset,
			sizeOfOffsetOfPagePointer
		)

		return {
			entries,
			prevPageOffset,
			nextPageOffset,
			pageOffset,//current page offset for records 
			pageSize: totalByteSizeOfPage
		}
	} catch(e) {
		return {
			error: {
				message: "Couldn't get page",
				stack:e.stack,
				code: "NO_PAGE"
			}
		}
	}
}

//findChunkOfFreeSpaceEntries

module.exports = {
    updateSortedFreeSpaceAcrossMetadata
};