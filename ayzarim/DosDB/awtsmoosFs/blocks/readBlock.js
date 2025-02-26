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
	blockIdByteSize = blockIdByteSize || superblockInfo.blockIdByteSize;
	const fsMetadataOffset = superblockInfo.firstBlockOffset;
	const blockOffset = fsMetadataOffset + (index - 1) * blockSize;

	// Fixed metadata: index, isDeleted, nextBlockId, lastBlockId.
	const fixedMetadataSize = blockIdByteSize + 1 + blockIdByteSize + blockIdByteSize;
	const fixedSchema = {
		index: `uint_${blockIdByteSize * 8}`,
		isDeleted: "uint_8", /**
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
	
	fixedMeta.type = (fixedMeta.isDeleted & (
		0b00000001 << 1
	)) == 0 ? "folder" : "file";

	fixedMeta.isDeleted = 
			(fixedMeta.isDeleted & (
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

	let dataBuffers = [];
	let allBlockIDs = [index];

	let dataOffset = blockOffset + fixedMetadataSize;
	let additionalMetadataSize = 0;
	var extraMetadataSize = blockIdByteSize + 4 + 4;

	if (fixedMeta.lastBlockId === 0) {
		// This is the first (or only) block in the chain.
		const extraSchema = {
			parentBlockId: `uint_${blockIdByteSize * 8}`,
			createdAt: "uint_32",
			lastModified: "uint_32"
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

	const currentDataSize = blockSize - fixedMetadataSize - additionalMetadataSize;
	var timeToGetOwnData;
	var myData = null;
	if (!onlyMetadata && !onlyIDs) {
		const handle = await getFileHandle(filePath);
		const dataBuffer = Buffer.alloc(currentDataSize);
		await handle.read(dataBuffer, 0, currentDataSize, blockOffset + fixedMetadataSize + additionalMetadataSize);
		dataBuffers.push(dataBuffer);
		myData = dataBuffer;
	}

	
	var nextId = fixedMeta.nextBlockId;
	var times = 0;
	var timesItTookToGetIDsOnly = []
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
//console.log(nextId)
		timesItTookToGetIDsOnly.push(performance.now() - ct);
	}
	if (onlyIDs) {
		return {
			metadata,
			blockID: index,
			allBlockIDs
		};
	}

	var dataSizeOfChainedBlocks = 
		blockSize - fixedMetadataSize - extraMetadataSize;
	var dataSize = myData.length + 
		allBlockIDs.length * dataSizeOfChainedBlocks;
	//	
	var fullData = Buffer.alloc(
		dataSize
	);
	myData.copy(fullData, 0);
	//console.log("ds",dataSize, fullData.length, allBlockIDs)

	
	timeToGetOwnData = performance.now() - startTime;

	var times = 0;
	var timeStamps = [];
	var curDataOffset = myData.length;
	var allNextIDs = allBlockIDs.slice(1);
	var timesToPushData = [];
	var timesToGetBlock = []

	var allBlockList = groupConsecutive(
		allBlockIDs
	)
	
	var allBlocks = await getAllBlocksFromExtentsArray({

	})
	allBlocks.copy(fullData, curDataOffset);
	
	 
	return {
		metadata,
		data: fullData,
		blockId: index,
		allBlockIDs,
		superblockInfo,
		timeStamps,
		timeToGetOwnData,
		timesItTookToGetIDsOnly,
		timesToPushData,
		timesToGetBlock
		
	};
}

async function getAllBlocksFromExtentsArray({
	filePath,
	array,
	superBlock
}) {
	
	if(!Array.isArray(array)) 
		return Buffer.alloc(0);
	var bufferSize = superBlock.blockSize *
		countElements(array);
	if(isNaN(bufferSize) | bufferSize < 1) {
		return Buffer.alloc(0);
	}

	var allBlocks = Buffer.alloc(bufferSize);
	var offset = 0;
	for(var extent of array) {
		if(extent.length == 2) {
			var ext = getExtentOfBlockIDs({
				filePath,
				start: extent[0],
				end: extent[1]
			})
			ext.copy(allBlocks, offset);
			var numberInclusive = 
				extent[1] - extent[0] + 1;
			offset += numberInclusive * 
				superBlock.blockSize;
			
				
		} else if(extent.length == 1) {
			var ext = getExtentOfBlockIDs({
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

async function getExtentOfBlockIDs({
	filePath,
	start,
	end,
	superblockInfo
}) {
	var superBlock = superblockInfo || await getSuperBlock(filePath);
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

	for(var i = 0; i < numberOfBlocks; i++) {
		var blockOffset = i * blockSize;


		var dataOffsetStart = blockOffset + fixedMetadataSize;
		var dataLength = blockDataSize;
		var dataEnd = dataLength * i;

		var offsetOfDataBlock = i * dataLength;
		blocks.copy(mainBuffer, offsetOfDataBlock, dataOffsetStart, dataEnd)
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