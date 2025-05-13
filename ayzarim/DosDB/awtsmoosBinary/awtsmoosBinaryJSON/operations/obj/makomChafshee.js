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
    newFreeSpaceList,
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

	}
}

function lookThroughSortedEntriesToSeeIfFits(
	buffer,
	parsedPage,
	entry={
		offset=0,
		size=0
	}=0
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
	} else {
		/*
			our size is bigger than
			the biggest entry.

			Therefore, we must check 
			next page.
		*/
		var nextPageOffset = parsedPage?.nextPage;
		if(nextPageOffset) {
			var nextPage = 
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
	var allOffsets = entries.map(q => q.entryOffset)
	var allEntryLengths = entries.map(q => q.entryLength);

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
			entry.entryOffset,
			0,
			maxOffset
		);
		entry.writeUIntBE(
			entry.entryLength,
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
			var entryOffset = pageBuffer.readUIntBE(
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
				entryOffset,
				entryLength
			});

		}

		var nextPage = pageBuffer.readUIntBE(
			offset,
			sizeOfOffsetOfNextPage
		)

		return {
			entries,
			nextPage
		}
	} catch(e) {

	}
}

function parseFreeSpacePage(pageBuffer) {
	var offset = 0;
	var firstByte = pageBuffer.readUInt8(offset);

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
	var numberOfEntriesInThisPage = pageBuffer.readUIntBE(
		offset,
		byteSizeOfNumberOfEntries
	)
	offset += byteSizeOfNumberOfEntries;
	
}
//findChunkOfFreeSpaceEntries

module.exports = {
    updateSortedFreeSpaceAcrossMetadata
};