//B"H

var {
	readFileBytesAtOffset,
    getFileHandle
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js");

var getSuperBlock = require("./getSuperBlock.js");
module.exports = 
/**
 * readBlock:
 * Reads a block (or a chain of blocks) from the filesystem.
 *
 * Parameters:
 *   - filePath: The filesystem file.
 *   - index: The block index to read.
 *   - blockSize: (Optional) Block size; if absent, obtained from the superBlock.
 *   - blockIdByteSize: (Optional) Byte-length for block IDs; if absent, obtained from the superBlock.
 *   - onlyMetadata: If true, only metadata is returned.
 *   - onlyIDs: If true, only block IDs (the chain) are returned.
 *   - superblockInfo: (Optional) Cached superBlock info.
 *
 * Process:
 *   1. Calculate the block offset using: offset = firstBlockOffset + (index - 1) * blockSize.
 *   2. Read fixed metadata: index, isDeleted, nextBlockId, lastBlockId.
 *   3. If lastBlockId is 0, read additional metadata (parentBlockId, createdAt, lastModified, nameByteLength, name).
 *   4. If onlyMetadata is false, read the remainder of the block as data.
 *   5. If the block is chained (nextBlockId ≠ 0), recursively read subsequent blocks.
 */
async function readBlock({
	filePath,
	index,
	blockId,
	blockSize,
	blockIdByteSize,
	onlyMetadata = false,
	onlyIDs = false,
	superblockInfo = null
}) {
	var startTime = performance.now()
	if (!superblockInfo) {
		superblockInfo = await getSuperBlock(filePath);
	}
	index = index || blockId;
	if(!index) return log ?
		console.trace("Couldn't read index", index, blockId) : null;


	blockSize = blockSize || superblockInfo.blockSize;
	blockIdByteSize = blockIdByteSize || 
		superblockInfo.blockIdByteSize;
	const fsMetadataOffset = superblockInfo
		.firstBlockOffset;
	const blockOffset = fsMetadataOffset + (index - 1) * blockSize;

	// Fixed metadata: index, isDeleted, nextBlockId, lastBlockId.
	const fixedMetadataSize = 
		blockIdByteSize + 1 + 
		blockIdByteSize + blockIdByteSize;
	const fixedSchema = {
		index: `uint_${blockIdByteSize * 8}`,
		isDeletedAndType: "uint_8", /**
			really this by shares bits,
			LSB is 1 for isDeleted 0 for not,
			next right most bit over is 0 for 
			type == folder 1 for type==file so
			we need to read that later.
		*/
		nextBlockId: `uint_${blockIdByteSize * 8}`,
		lastBlockId: `uint_${blockIdByteSize * 8}`
	};

	
		
	var fixedMeta = await readFileBytesAtOffset({
		filePath,
		offset: blockOffset,
		schema: fixedSchema
	});
	var bitsToType = {
		0b00: "inChain",
		0b01: "folder",
		0b10: "file",
		0b11: "blockHolder",
		
	}
	fixedMeta.type = bitsToType[
		((
			(fixedMeta.isDeletedAndType & (
				0b00000110
			)) >> 1
		)) || 0
	] 

	fixedMeta.isDeleted = 
			(fixedMeta.isDeletedAndType & (
				0b00000001
			)) //if 1, deleted; 0, available;
		
	
			
	if(onlyMetadata === "small") {
		return {
			metadata: fixedMeta,
			blockId,
			superblockInfo
		}
	}
	let metadata = {
		...fixedMeta
	};

	var dataLength = blockSize - fixedMetadataSize;
	var ind = parseInt(index);
	if(!isNaN(ind)) {
		index = ind;
	}
	let allBlockIDs = [];

	var dataOffset = blockOffset + fixedMetadataSize;
	let additionalMetadataSize = 0;
	var extraMetadataSize = blockIdByteSize

	var isFirstBlock = false;
	if (fixedMeta.type != "inChain") {
		isFirstBlock = true;
		// This is the first (or only) block in the chain.
		const extraSchema = {
			parentBlockId: `uint_${blockIdByteSize * 8}`,
		
		};
		const extraMeta = await readFileBytesAtOffset({
			filePath,
			offset: dataOffset,
			schema: extraSchema
		});
		additionalMetadataSize = extraMetadataSize
		metadata = {
			...metadata,
			...extraMeta
		};
		
		metadata = {
			...metadata
		};
	}

	if(onlyMetadata === true) {
		return {
			metadata,
			superblockInfo,
			blockId
		}
	}

	
	

	
	var nextId = fixedMeta.nextBlockId;
	var times = 0;
	var timesItTookToGetIDsOnly = []
	//allBlockIDs.push(index)
	while (nextId && nextId !== 0) {
		var ct = performance.now()
		allBlockIDs.push(nextId);
		const nextBlock = await readBlock({
			filePath,
			index: nextId,
			blockSize,
			blockIdByteSize,
			onlyMetadata: true,
			onlyIDs: true,
			superblockInfo
		});
		nextId = nextBlock?.metadata?.nextBlockId;

		
		timesItTookToGetIDsOnly.push(performance.now() - ct);
	}
	if (onlyIDs) {
		allBlockIDs = [
			index,
			...allBlockIDs
		]
		return {
			metadata,
			blockID: index,
			allBlockIDs
		};
	}
	if(allBlockIDs.length)
	console.log("sub IDs gotten",allBlockIDs,index)

	var timeToGetOwnData;
	if(isFirstBlock) {
		var internalDataOffset = fixedMetadataSize + 
		extraMetadataSize
		dataOffset = blockOffset + (internalDataOffset);
		dataLength = blockSize - internalDataOffset;
	}
	var data = (await readFileBytesAtOffset({
		filePath,
		offset: dataOffset,
		schema: {
			data: "buffer_"+dataLength
		}
	}))?.data;
	var chainedDataSize = blockSize - fixedMetadataSize;

	var totalDataSize = dataLength +
		chainedDataSize * allBlockIDs.length
	var totalData = Buffer.alloc(totalDataSize);
	data.copy(totalData, 0);
	var offset = dataLength;
	
	

	

	var allBlockList = groupConsecutive(
		allBlockIDs
	)
	//console.log("Getting blocks",allBlockList)
	
	var allBlocks = await getAllBlocksFromExtentsArray({
		filePath,
		array: allBlockList,
		superBlock: superblockInfo
	})
	allBlocks.copy(totalData, offset);
	allBlockIDs = [
		index,
		...allBlockIDs
	];
	//console.log("ids",allBlockIDs, allBlockList)
	
	 
	return {
		metadata,
		data: totalData,
		blockId: index,
		allBlockIDs,
		superblockInfo,
		/*timeStamps,
		timeToGetOwnData,
		timesItTookToGetIDsOnly,
		timesToPushData,
		timesToGetBlock*/
		
	};
}

async function getAllBlocksFromExtentsArray({
	filePath,
	array,
	superBlock
}) {
	
	if(!Array.isArray(array)) {
		//console.log("NOT array")
		return Buffer.alloc(0);
	}
	var bufferSize = superBlock.blockSize *
		countElements(array);
	if(isNaN(bufferSize) | bufferSize < 1) {
		//console.log("NAN",array)
		return Buffer.alloc(0);
	}

	var allBlocks = Buffer.alloc(bufferSize);
	var offset = 0;
	
	for(var extent of array) {
		if(extent.length == 2) {
			var ext = await getExtentOfBlockIDs({
				filePath,
				start: extent[0],
				end: extent[1],
				superBlock
			})
			ext.copy(allBlocks, offset);
			var numberInclusive = 
				extent[1] - extent[0] + 1;
			offset += numberInclusive * 
				superBlock.blockSize;
			
				
				
		} else if(extent.length == 1) {
			var ext = await getExtentOfBlockIDs({
				filePath,
				start: extent[0],
				end: extent[0]
			})
			ext.copy(allBlocks, offset);
			offset += superBlock.blockSize;
		}
	}
	return allBlocks;
}

function countElements(ranges) {
    let uniqueNumbers = new Set();
    
    for (let range of ranges) {
        if (range.length === 2) {
            let [start, end] = range;
            for (let i = start; i <= end; i++) {
                uniqueNumbers.add(i);
            }
        } else {
            uniqueNumbers.add(range[0]);
        }
    }
    
    return uniqueNumbers.size;
}

/**
 * 
 * gets CHAINED block data
 * does not support the 
 * start variable being the initial
 * data
 * @returns 
 */
async function getExtentOfBlockIDs({
	filePath,
	start,
	end,
	superblockInfo
}) {
	var superBlock = superblockInfo ||
		await getSuperBlock(filePath);
	var blockSize = superBlock.blockSize;
	var blockIdByteSize = superBlock.blockIdByteSize;

	var firstBlockOffset = superBlock.firstBlockOffset;
	var startOffset = firstBlockOffset + (start - 1) * blockSize;
	var byteSizesToGet = (end - start + 1) * blockSize;
	var blockRequest = await readFileBytesAtOffset({
		filePath,
		offset: startOffset, 
		schema: {
			blocks: `buffer_${byteSizesToGet}`
		}
	})
	var blocks = blockRequest?.blocks;

	const fixedMetadataSize = blockIdByteSize + 
		1 + 
		blockIdByteSize + 
		blockIdByteSize;

	var blockDataSize = blockSize - fixedMetadataSize;
	var sizeOfTotalDataBlocks = 
		blockDataSize * blocks.length;
	
	var mainBuffer = Buffer.alloc(
		sizeOfTotalDataBlocks
	);

	var numberOfBlocks = end - start + 1;

	//console.log("Getting",numberOfBlocks,blockRequest)
	for(var i = 0; i < numberOfBlocks; i++) {
		var blockOffset = i * blockSize;


		var dataOffsetStart = blockOffset + fixedMetadataSize;
		var dataLength = blockDataSize;
		var dataEnd = dataOffsetStart + dataLength

		
		blocks.copy(
			mainBuffer, 
			blockOffset, 
			dataOffsetStart, dataEnd
		)
	}
	return mainBuffer;
	return blocks;
}



function groupConsecutive(arr) {
	if (!arr.length) return [];
	
	const result = [];
	let start = arr[0];
	let prev = start;
  
	for (let i = 1; i < arr.length; i++) {
	  if (arr[i] === prev + 1) {
		prev = arr[i]; // Continue the sequence
	  } else {
		// End of a sequence, push [start, prev]
		result.push(start === prev ? [start] : [start, prev]);
		start = arr[i];
		prev = arr[i];
	  }
	}
	
	// Push the last sequence
	result.push(start === prev ? [start] : [start, prev]);
	
	return result;
  }