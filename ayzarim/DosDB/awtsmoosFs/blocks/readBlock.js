//B"H

var {
	readFileBytesAtOffset,
    getFileHandle
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js");

var getSuperBlock = require("./getSuperBlock");
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
	var oldDeleted = fixedMeta.isDeleted
	fixedMeta.type = (fixedMeta.isDeleted & (
		0b00000001 << 1
	)) == 0 ? "folder" : "file";

	fixedMeta.isDeleted = 
			(fixedMeta.isDeleted & (
				0b00000001
			)) //if 1, deleted; 0, available;
		
		//	console.log("Is deleted?",fixedMeta.isDeleted,oldDeleted)
	/*if(fixedMeta.isDeleted) {
		return {
			deleted: true,
			blockId: index,
			metadata:fixedMeta,
			data: await awtsmoosJSON.serializeJSON({
				error: "This is already deleted",
				blockId: index,
				metadata: fixedMeta,
				superBlock:superblockInfo
			})
		}
	}*/
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
		additionalMetadataSize = blockIdByteSize + 4 + 4
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
	if (!onlyMetadata && !onlyIDs) {
		const handle = await getFileHandle(filePath);
		const dataBuffer = Buffer.alloc(currentDataSize);
		await handle.read(dataBuffer, 0, currentDataSize, blockOffset + fixedMetadataSize + additionalMetadataSize);
		dataBuffers.push(dataBuffer);
	}

	if (onlyIDs) {
		let nextId = fixedMeta.nextBlockId;
		var times = 0;
		while (nextId && nextId !== 0) {
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
			nextId = nextBlock.metadata.nextBlockId;
			if(times++ > 10) {
				console.log("WHAT?",nextId,times)
				break;
			}
		}
		return {
			metadata,
			blockID: index,
			allBlockIDs
		};
	}

	let nextId = fixedMeta.nextBlockId;
	var times = 0;
	while (nextId && nextId !== 0) {
		allBlockIDs.push(nextId);
		const nextBlock = await readBlock({
			filePath,
			index: nextId,
			blockSize,
			blockIdByteSize,
			onlyMetadata,
			superblockInfo
		});
		dataBuffers.push(nextBlock.data);
		nextId = nextBlock.metadata.nextBlockId;
		if(times++ > 10) {
			console.log("Too many times",nextId,times);
			break
		}
	}

	const fullData = Buffer.concat(dataBuffers);
	return {
		metadata,
		data: fullData,
		blockId: index,
		allBlockIDs,
		superblockInfo
	};
}