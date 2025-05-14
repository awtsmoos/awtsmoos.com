//B"H
/*
    free space manager
*/
const writeConditional = require("../helpers/writeConditional.js");

var {
	packedLength,
	unpackLength
} = require("../packing/packedLength.js")

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
        operation: "deleted"
    } = {}
) {
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

		var firstPageSize = metadata?.[0]?.freeSpacePageLength
		var firstPageOffset = metadata?.[0]?.freeSpacePageOffset;

		
		insertFreeSpaceEntry(
			buffer, {
				offset,
				size
			},
			firstPageSize,
			firstPageOffset
		)
		
		

		
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
function insertFreeSpaceEntry(
	buffer, 
	entry, 
	firstPageOffset, 
	firstPageLength
) {
	if(!firstPageOffset) {
		/*
			we need to make the first page
		*/
	} else {
		var firstPage = getFreeSpacePage(
			buffer,
			firstPageOffset,
			firstPageLength
		);
		var newPageInfo = lookThroughSortedEntriesToSeeIfFits(
			buffer,
			firstPage,
			entry
		);
		if(newPageInfo.bigger) {
			/*
				make new page 
				at end of chain,
				look through free space
				list to see where it goes 
				and/or append to end of data
				section
			*/
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
	entry
) {
	var entries = parsedPage?.entries;
	if(!Array.isArray(entries)) {
		return null;
	}

	var last = entries[entries.length - 1];
	if(size <= last) {
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
			if(size < entry.size) {
				lastEntry = en;
				index++;
				continue;
			} else {
				foundEntry = lastEntry;
				break;

			}
			
		}

		/*
			insert our entry into 
			the current free space
			page
		*/
		entries.splice(index, 0, foundEntry);

		/*
			serialize new, BIGGER free 
			space page, which needs to 
			later be rewritten in a new
			location, and the old 
			free page needs to be dealt with.
		*/
		var serialized = serializeFreeSpacePage({
			entries,
			nextPage
		});
		var pageOffset/*current page
		 offset in buffer (soon to be OLD page)*/ = parsedPage.pageOffset;
		return {
			serialized,
			pageOffset//offset of OLD page entry
		}

	} else {
		/*
			our size is bigger than
			the biggest entry.

			Therefore, we must check 
			next page.
		*/
		var nextPageOffset = parsedPage?.nextPage;
		if(nextPageOffset) {
			var nextPage = getFreeSpacePage(
				buffer,
				nextPageOffset
			);
			return lookThroughSortedEntriesToSeeIfFits(
				buffer,
				nextPage,
				entry
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
				bigger: true

			}
		}
	}
}

function serializeFreeSpacePage(
	{
		entries,
		nextPage = 0
	}={}
) {

	if(!Array.isArray(entries)) {
		return null;
	}
	var entryLength = entries?.length;
	if(!entryLength) return null;
	var entryLengthData = writeConditional(
		entryLength
	)
	var nextPageData = writeConditional(
		nextPage
	);
	var nextPageByteSize = nextPageData.size;
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
				nextPageByteSize
			) << 6
			//0b11000000
		)
	]);
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

	var nextPageBuffer = nextPageData.buffer;
	var fullPageBuffer = Buffer.concat([
		firstByte,
		entryBuffer,
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
		var sizeOfOffsetOfNextPage = unpackLength(
			(0b11000000 & firstByte)
			>> 6
		);

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
			sizeOfOffsetOfNextPage
		);

		var totalByteSizeOfPage = (
			1/*header*/ + 
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

		var nextPage = pageBuffer.readUIntBE(
			offset,
			sizeOfOffsetOfNextPage
		)

		return {
			entries,
			nextPage,
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