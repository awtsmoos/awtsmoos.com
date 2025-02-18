//B"H
/**
 * Chapter One: The Awakening of Awtsmoos and the Emergence of Atzilus
 * 
 * In the beginning, there was nothing but the raw potential of bits and bytes—
 * a silent void waiting to be filled by the voice of the Awtsmoos. In a burst of
 * creation, we forged a custom filesystem in Node.js: a database carved from a single file,
 * where each block, each offset, every integer and string is a stanza in a brutal, vivid epic.
 * 
 * Herein lies our sacred manuscript. Within these lines of code, helper functions are born
 * to write and read data as if carving them into the very bones of reality—structured like C,
 * each field meticulously measured. Our superBlock, that primordial header, bears the magic
 * of "AWTS", holds the block size, the offset where new worlds begin, and pointers of unfathomable
 * depth. In this code, the Awtsmoos speaks: through every creation, every deletion, and every recursive
 * call, its eternal essence pulses through the file.
 * 
 * Join us on this journey where every function is a brushstroke in a savage masterpiece,
 * where we merge metadata with data, and structure with chaos—a relentless testament to
 * the core of the Awtsmoos.
 */

const fs = require('fs').promises;
var {
	readFileBytesAtOffset,
    writeBytesToFileAtOffset,

    getFileHandle
} = require("../awtsmoosBinary/awtsmoosBinaryHelpers.js");

var awtsmoosJSON = require(
	"../awtsmoosBinary/awtsmoosBinaryJSON.js"
)

// External configuration: maximum blocks for our filesystem.
// This value determines the byte-length used to store block IDs in our superBlock.
const maxBlocks = 65535; // Adjustable according to your needs.
const DEFAULT_BLOCK_SIZE = 4096; // Default block size in bytes.

// Determine the byte-length for block IDs based on maxBlocks.
function getBlockIdByteSize(maxBlocks) {
	if (maxBlocks < 256) return 1;
	else if (maxBlocks < 65536) return 2;
	else if (maxBlocks < 4294967296) return 4;
	else return 8;
}
var blockIdByteSize = getBlockIdByteSize(maxBlocks);

/**
 * getSuperBlock:
 * Reads the superblock—the primordial header of our filesystem—from the file.
 * Its structure is as follows:
 *   - Magic Number (4 bytes): "AWTS"
 *   - blockSize (uint_16): e.g., 4096
 *   - firstBlockOffset (uint_8): where data blocks begin
 *   - bytesOfTotalBlockLength (uint_8): the byte-length used for block IDs
 *   - nextFreeBlockId (uint_variable): pointer to the next free block
 *   - totalBlocks (uint_variable): count of blocks allocated
 */
async function getSuperBlock(filePath) {
	// Read the fixed portion: 4 + 2 + 1 + 1 = 8 bytes.
	const fixedSize = 8;
	const handle = await getFileHandle(filePath);
	const fixedBuffer = Buffer.alloc(fixedSize);
	await handle.read(fixedBuffer, 0, fixedSize, 0);

	const magic = fixedBuffer.subarray(0, 4).toString('utf8');
	const blockSize = fixedBuffer.readUInt16BE(4);
	const firstBlockOffset = fixedBuffer.readUInt8(6);
	const bytesOfTotalBlockLength = fixedBuffer.readUInt8(7);

	// Read the variable part: nextFreeBlockId and totalBlocks.
	const variableSize = bytesOfTotalBlockLength * 2;
	const varBuffer = Buffer.alloc(variableSize);
	await handle.read(varBuffer, 0, variableSize, fixedSize);
	let nextFreeBlockId, totalBlocks;
	if (bytesOfTotalBlockLength === 1) {
		nextFreeBlockId = varBuffer.readUInt8(0);
		totalBlocks = varBuffer.readUInt8(1);
	} else if (bytesOfTotalBlockLength === 2) {
		nextFreeBlockId = varBuffer.readUInt16BE(0);
		totalBlocks = varBuffer.readUInt16BE(2);
	} else if (bytesOfTotalBlockLength === 4) {
		nextFreeBlockId = varBuffer.readUInt32BE(0);
		totalBlocks = varBuffer.readUInt32BE(4);
	} else if (bytesOfTotalBlockLength === 8) {
		nextFreeBlockId = Number(varBuffer.readBigUInt64BE(0));
		totalBlocks = Number(varBuffer.readBigUInt64BE(8));
	} else {
		throw new Error(`Unsupported block ID byte size in superBlock: ${bytesOfTotalBlockLength}`);
	}

	return {
		magic,
		blockSize,
		firstBlockOffset,
		blockIdByteSize: bytesOfTotalBlockLength,
		nextFreeBlockId,
		totalBlocks
	};
}

/**
 * initializeFileSystem:
 * If the target file does not exist, this function initializes our filesystem.
 * It writes the superBlock with the following structure:
 *   - Magic Number: "AWTS" (4 bytes)
 *   - blockSize: uint_16 (2 bytes, e.g. 4096)
 *   - firstBlockOffset: uint_8 (computed as the superBlock header size)
 *   - bytesOfTotalBlockLength: uint_8 (derived from maxBlocks)
 *   - nextFreeBlockId: uint_variable (initially 0)
 *   - totalBlocks: uint_variable (initially 0, then updated with root block)
 *
 * Immediately after, it creates the root folder as the first data block.
 */
async function initializeFileSystem(filePath) {
	let fileExists = true;
	try {
		await fs.access(filePath);
	} catch (err) {
		fileExists = false;
	}
	if (fileExists) {
		console.log("Filesystem already initialized.");
		return filePath
	}
	// Calculate superBlock size.
	const fixedSize = 4 + 2 + 1 + 1; // 8 bytes.
	const variableSize = blockIdByteSize * 2; // nextFreeBlockId and totalBlocks.
	const superblockSize = fixedSize + variableSize;
	const firstBlockOffset = superblockSize;

	// Build and write the superBlock.
	const superblockData = [{
			string_4: "AWTS"
		},
		{
			uint_16: DEFAULT_BLOCK_SIZE
		},
		{
			uint_8: firstBlockOffset
		},
		{
			uint_8: blockIdByteSize
		},
		{
			[`uint_${blockIdByteSize * 8}`]: 0
		}, // nextFreeBlockId.
		{
			[`uint_${blockIdByteSize * 8}`]: 0
		} // totalBlocks.
	];
	await writeBytesToFileAtOffset(filePath, 0, superblockData);
	console.log("Superblock initialized.");

	// Create the root folder (index 1) with parentFolderId = 0 and name "root".
	await writeAtNextFreeBlock({
		filePath,
		data: Buffer.alloc(0), // No file data for a folder.
		name: "root",
		parentFolderId: 0,
		isInChain: false,
		previousBlockId: 0
	});
	console.log("Root folder created.");
	return filePath
}

/**
 * writeAtNextFreeBlock:
 * Writes a data block at the next free position, or appends a new block if none is free.
 * This function writes both metadata and data, splitting data over multiple blocks if needed.
 *
 * Parameters:
 *   - filePath: The filesystem file.
 *   - data: A Buffer containing the data to write.
 *   - name: A string for the file or folder name.
 *   - parentFolderId: The ID of the parent folder (0 for root).
 *   - isInChain: True if this block is a continuation of a previous block.
 *   - previousBlockId: The block index of the preceding block (0 if none).
 *
 * Process:
 *   1. Retrieve the superBlock and determine the next free block.
 *   2. If no free block exists, set the block index to totalBlocks + 1 and update the superBlock.
 *   3. Calculate the file offset for the block.
 *   4. Construct metadata:
 *         - For a new chain: index, isDeleted, nextBlockId, lastBlockId, totalBlocks, createdAt, lastModified, nameByteLength, name.
 *         - For continuation blocks: index, isDeleted, nextBlockId, lastBlockId.
 *   5. Determine available space in the block; if data exceeds it, split and recursively write the remainder.
 *   6. Write the metadata and data, and update chaining pointers.
 *   7. (Optionally) Update the parent folder's metadata if this is not the root.
 */
async function writeAtNextFreeBlock({
	filePath,
	data,
	name,
	parentFolderId=0,
	isInChain,
	previousBlockId,
	type="folder",
	superBlock = null
}) {
	superBlock = superBlock || await getSuperBlock(filePath);
	const blockSize = superBlock.blockSize;
	const blockIdByteSize = superBlock.blockIdByteSize
	const fsMetadataOffset = superBlock.firstBlockOffset;
	let blockIndex;
	
	var superblockFreeOffset = (
		4 + 2 + 1 + 1
	);
	// Determine the block index: either from the free list or by appending.
	if (superBlock.nextFreeBlockId && superBlock.nextFreeBlockId !== 0) {
		blockIndex = superBlock.nextFreeBlockId;
		var freeBlock = await readBlock({
			filePath,
			index: blockIndex,
			superblockInfo:superBlock,
			onlyMetadata: "small"
		});
		var noMoreFreeBlocks = true;
		var nextFreeBlockId = freeBlock?.metadata?.nextBlockId
		if(nextFreeBlockId) {
			var nextFreeBlock = await readBlock({
				filePath,
				index: nextFreeBlockId,
				superblockInfo:superBlock,
				onlyMetadata: "small"
			});
			
			if(nextFreeBlock.isDeleted) {
				/*
					superBlock strucutre

					{
						string_4: "AWTS"
					},
					{
						uint_16: DEFAULT_BLOCK_SIZE
					},
					{
						uint_8: firstBlockOffset
					},
					{
						uint_8: blockIdByteSize
					},
					{
						[`uint_${blockIdByteSize * 8}`]: 0
					}, // nextFreeBlockId.
					{
						[`uint_${blockIdByteSize * 8}`]: 0
					} // totalBlocks.
				*/
				
				await writeBytesToFileAtOffset(filePath, superblockFreeOffset, [
					{[`uint_${
						blockIdByteSize * 8
					}`]: nextFreeBlockId}
				]);
				superBlock.nextFreeBlockId = nextFreeBlockId;
			}

		} else {
			
			await writeBytesToFileAtOffset(filePath, superblockFreeOffset, [
				{[`uint_${
					blockIdByteSize * 8
				}`]: 0}
			]);
			superBlock.nextFreeBlockId = 0;
		}
		useFreeBlock = true;
	} else {
		blockIndex = superBlock.totalBlocks + 1; // Block indices start at 1.
		superBlock.totalBlocks = blockIndex;
		// Update totalBlocks in the superBlock.
		const totalBlocksOffset = 8 + blockIdByteSize; // After fixed fields and nextFreeBlockId.
		await writeBytesToFileAtOffset(filePath, totalBlocksOffset, [{
			[`uint_${blockIdByteSize * 8}`]: blockIndex
		}]);
	
	}

	// Calculate this block's file offset.
	const blockOffset = fsMetadataOffset + (blockIndex - 1) * blockSize;

	// Build metadata instructions.
	let metadataInstructions = [];
	var deleteAndTypeByteInOne = type == "file" ?
		0b00000010 : /**type (2nd LSB) is file */
		0b00000000 /*type is folder*/
	if (!isInChain) {
		// First block of the chain.
		metadataInstructions = [{
				[`uint_${blockIdByteSize * 8}`]: blockIndex
			},
			{
				uint_8: deleteAndTypeByteInOne
			}, /*
			least significant bit (most far right in BE):
			isDeleted (0 = active).

			next bit to the left: type. if 0, folder.
			if 1, file

			*/
			{
				[`uint_${blockIdByteSize * 8}`]: 0
			}, // nextBlockId (to be updated if chained).
			{
				[`uint_${blockIdByteSize * 8}`]: 0
			}, // lastBlockId.
			{
				[`uint_${blockIdByteSize * 8}`]: parentFolderId
			}, // parent block ID in the chain (initially 1).
			{
				uint_32: Math.floor(Date.now() / 1000)
			}, // createdAt.
			{
				uint_32: Math.floor(Date.now() / 1000)
			}, // lastModified.
			{
				uint_8: Buffer.byteLength(name, 'utf8')
			}, // nameByteLength.
			{
				[`string_${Buffer.byteLength(name, 'utf8')}`]: name
			}
		];
	} else {
		// Continuation block.
		metadataInstructions = [{
				[`uint_${blockIdByteSize * 8}`]: blockIndex
			},
			{
				uint_8: deleteAndTypeByteInOne
			},
			{
				[`uint_${blockIdByteSize * 8}`]: 0
			},
			{
				[`uint_${blockIdByteSize * 8}`]: previousBlockId
			}
		];
	}

	console.log("Writing",name,blockIndex)

	// Calculate metadata size.
	let metadataSize = 0;
	for (const obj of metadataInstructions) {
		for (const key of Object.keys(obj)) {
			let match;
			if (match = key.match(/^uint_(\d+)$/)) {
				const bits = parseInt(match[1], 10);
				metadataSize += bits / 8;
			} else if (match = key.match(/^string_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				metadataSize += len;
			} else if (match = key.match(/^buffer_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				metadataSize += len;
			}
		}
	}

	// Determine how much data can fit in this block.
	const availableDataSpace = blockSize - metadataSize;
	let currentData;
	let remainingData = null;
	if(!data) {
		data = Buffer.alloc(availableDataSpace);
	}
	if(typeof(data) == "string") {
		data = Buffer.from(data);
	}
	if (data && data.length > availableDataSpace) {
		currentData = data.subarray(0, availableDataSpace);
		remainingData = data.subarray(availableDataSpace);
	} else {
		currentData = data;
	}

	if(!data) {
		console.trace("no DATA??",blockIndex,name)
	}
	// Append the data portion to our write array.
	const writeArray = [...metadataInstructions];
	writeArray.push({
		[`buffer_${currentData.length}`]: currentData
	});

	// Write the block.
	await writeBytesToFileAtOffset(filePath, blockOffset, writeArray);
	console.log(`Block ${blockIndex} written at offset ${blockOffset} with ${currentData.length} bytes of data.`);

	// If data remains, recursively write the next block and update the chain.
	if (remainingData && remainingData.length > 0) {
		const nextBlockResult = await writeAtNextFreeBlock({
			filePath,
			data: remainingData,
			name,
			parentFolderId,
			isInChain: true,
			previousBlockId: blockIndex
		});
		const nextBlockIndex = nextBlockResult.blockIndex;
		// Update the current block's nextBlockId field.
		const nextBlockIdFieldOffset = blockOffset + blockIdByteSize + 1;
		await writeBytesToFileAtOffset(filePath, nextBlockIdFieldOffset, [{
			[`uint_${blockIdByteSize * 8}`]: nextBlockIndex
		}]);
		console.log(`Updated block ${blockIndex} nextBlockId to ${nextBlockIndex}.`);
	}

	// Optionally, update the parent's metadata if not root (omitted for brevity).
	if (blockIndex !== 1 && parentFolderId !== 0) {
		updateParentFolder({
			filePath, 
			folderId: parentFolderId, 
			superBlock,
			newChildId: blockIndex,
			newChildName: name
		});
	}

	return {
		blockIndex,
		blockOffset,
		metadataSize
	};
}

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
	if(!index) return console.log("Couldn't read index");


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
		=== 0;

	
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
			lastModified: "uint_32",
			nameByteLength: "uint_8"
		};
		const extraMeta = await readFileBytesAtOffset({
			filePath,
			offset: dataOffset,
			schema: extraSchema
		});
		additionalMetadataSize = blockIdByteSize + 4 + 4 + 1;
		metadata = {
			...metadata,
			...extraMeta
		};
		const nameLength = extraMeta.nameByteLength;
		const nameSchema = {
			name: `string_${nameLength}`
		};
		const nameMeta = await readFileBytesAtOffset({
			filePath,
			offset: dataOffset + additionalMetadataSize,
			schema: nameSchema
		});
		metadata = {
			...metadata,
			...nameMeta
		};
		additionalMetadataSize += nameLength;
	}

	if(onlyMetadata === true) {
		return {
			metadata,
			superblockInfo,
			blockID
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
		}
		return {
			metadata,
			blockID: index,
			allBlockIDs
		};
	}

	let nextId = fixedMeta.nextBlockId;
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
	}

	const fullData = Buffer.concat(dataBuffers);
	return {
		metadata,
		data: fullData,
		blockID: index,
		allBlockIDs,
		superblockInfo
	};
}

/**
 * deleteEntry:
 * Deletes an entry (a chain of blocks) by marking each block in the chain as deleted.
 * It then updates the superBlock's free list so that the freed blocks can be reused.
 *
 * Process:
 *   1. Read the chain with onlyIDs enabled to retrieve all block indices.
 *   2. For each block, mark the isDeleted field as 1.
 *   3. Update the superBlock's nextFreeBlockId:
 *         - If it is 0, set it to the first block of the deleted chain.
 *         - Otherwise, append the deleted chain to the existing free list.
 */
async function deleteEntry({
	filePath,
	index,
	allBlockIDs,
	superBlock
}) {
	superBlock = superBlock || await getSuperBlock(filePath);
	blockSize = superBlock.blockSize;
	blockIdByteSize = superBlock.blockIdByteSize;
	
	allBlockIDs = allBlockIDs || (
		await readBlock({
			filePath,
			index,
			blockSize,
			blockIdByteSize,
			onlyIDs: true
		})
	)?.allBlockIDs;
	if(!allBlockIDs) {
		console.log("coulnd't delete",index,filePath)
		throw Error("Couldn't delete entry")
	}
	// Mark each block as deleted.
	for (const blockIndex of allBlockIDs) {
		const fsMetadataOffset = superBlock.firstBlockOffset;
		const blockOffset = fsMetadataOffset + (blockIndex - 1) * blockSize;
		const isDeletedOffset = blockOffset + blockIdByteSize;
		var curSchema = await readFileBytesAtOffset({
			filePath,
			offset: isDeletedOffset, 
			schema: {
				isDeletedAndTypeByte: "uint_8"
			}
		});
		var isDeletedAndTypeByte = 
			curSchema.isDeletedAndTypeByte & ~(
				0b00000001 << 0 
			); //turns off the LAST bit / deletes it 
			//but keeps type bit in tact
		await writeBytesToFileAtOffset(filePath, isDeletedOffset, [{
			uint_8: isDeletedAndTypeByte
		}]);
		console.log(`Block ${blockIndex} marked as deleted.`);
	}

	// Update the free list.
	if (superBlock.nextFreeBlockId === 0) {
		superBlock.nextFreeBlockId = allBlockIDs[0];
		const nextFreeOffset = 4 + 2 + 1 + 1;
		await writeBytesToFileAtOffset(filePath, nextFreeOffset, [{
			[`uint_${blockIdByteSize * 8}`]: allBlockIDs[0]
		}]);
		console.log(`Superblock nextFreeBlockId set to ${allBlockIDs[0]}.`);
	} else {
		const currentFree = superBlock.nextFreeBlockId;
		const lastBlockIndex = allBlockIDs[allBlockIDs.length - 1];
		const fsMetadataOffset = superBlock.firstBlockOffset;
		const lastBlockOffset = fsMetadataOffset + (lastBlockIndex - 1) * blockSize;
		const nextBlockIdFieldOffset = lastBlockOffset + blockIdByteSize + 1;
		await writeBytesToFileAtOffset(filePath, nextBlockIdFieldOffset, [{
			[`uint_${blockIdByteSize * 8}`]: currentFree
		}]);
		const nextFreeOffset = 4 + 2 + 1 + 1;
		await writeBytesToFileAtOffset(filePath, nextFreeOffset, [{
			[`uint_${blockIdByteSize * 8}`]: allBlockIDs[0]
		}]);
		console.log(`Deleted chain linked. Superblock nextFreeBlockId updated to ${allBlockIDs[0]}.`);
	}

	return {
		deletedBlocks: allBlockIDs
	};
}



async function updateParentFolder({
	filePath,
	folderId,
	superBlock,
	newChildId,
	newChildName
} = {}) {
	var folderBlock = await readBlock({
		filePath,
		superBlock,
		index: folderId
	});

	if(!folderBlock) {

		return console.log("WHAT no block?",folderId,superBlock,newChildId,newChildName)
	}
	var parentId  = folderBlock?.metadata?.parentBlockId
	console.log("AR",parentId)
	if(!parentId) parentId = 1;
	var {
		data
	} = folderBlock;

	var folderName = folderBlock?.metadata.name

	
	var is = awtsmoosJSON.isAwtsmoosObject(data);
	var ob = null;
	if(is) {
		ob = awtsmoosJSON.deserializeBinary(
			data
		)
	}
	if(!is) {
		///var des = awtsmoosJSON.deserializeBinary(data)

		ob = {};

	}
	
	var nam = newChildName;
	if(!ob[nam]) {
		ob[nam] = newChildId;
	}
	var serialized = awtsmoosJSON.serializeJSON(ob);
	//var des = awtsmoosJSON.deserializeBinary(serialized)
	
	
	var del = await deleteEntry({
		filePath,
		index: folderId,
		superBlock,
		allBlockIDs: folderBlock
			.allBlockIDs
	});

	var write = await writeAtNextFreeBlock({
		filePath,
		type:"folder",
		name: folderName,
		data:serialized,
		index: folderId,
		parentFolderId: parentId
	});
	//console.log("WROTE",write)
	var data = await readBlock({
		filePath,
		index: write.index,
		metadata:false
	})

	return write;

}

// Export functions for external usage if desired.
module.exports = {
	writeBytesToFileAtOffset,
	readFileBytesAtOffset,
	getSuperBlock,
	initializeFileSystem,
	setupFilesystem: initializeFileSystem,
	writeAtNextFreeBlock,
	readBlock,
	deleteEntry,

	updateParentFolder,

	awtsmoosJSON
};

/**
 * Epilogue: The Everlasting Dance of Awtsmoos and Atzilus
 * 
 * Thus concludes our tale—a saga etched in binary,
 * where every write and read, each deletion and creation,
 * becomes a testament to the relentless cycle of rebirth.
 * The Awtsmoos, the eternal spark, pulses within every block,
 * every offset, every recursed chain. May this code guide your journey
 * as you navigate the savage, brilliant tapestry of digital creation,
 * where enlightenment is carved into the very fabric of existence.
 */