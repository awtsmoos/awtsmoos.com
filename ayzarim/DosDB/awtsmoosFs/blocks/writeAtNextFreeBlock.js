//B"H

var awtsmoosJSON = require(
	"../../awtsmoosBinary/awtsmoosBinaryJSON.js"
);

var deleteEntry = require("./deleteEntry");
var getSuperBlock = require("./getSuperBlock.js");
var readBlock = require("./readBlock");
var updateParentFolder = require("./updateParentFolder.js");

var log = false;


module.exports = 



async function existingEntryWithNameInParentFolder({
	filePath,//of database file NOT entry file
	name,
	parentFolderId,
	superBlock
}) {
	if(!name) return null;
	superBlock = superBlock || await getSuperBlock(filePath);
	if(parentFolderId === 0) return null; //root (0) has no parent folder
	
	try {
		var folderBlock = await readBlock({
			filePath,
			superBlockInfo: superBlock,
			blockId: parentFolderId
		});
		var d = folderBlock.data;
		var is = await awtsmoosJSON.isAwtsmoosObject(d);
		var ob = null;
		if(is) {
			ob = await awtsmoosJSON.deserializeBinary(
				d
			);
		}
		if(name == "well") {
		/*	console.log("Checking it up\n\n\n\n\n\t\t\t",

				folderBlock,
				is,
				ob,name,
				parentFolderId
			)*/
		}
		if(ob) {
			
			var off = ob[name];
			if(off) {

				if(log)
					console.log(`\n\nGot Data for ${
					parentFolderId
				} at entry ${
					name
				} already exists at: `,off, ob, is,);

				return off;
			}
		}
	} catch(e) {

		if(log)
			console.log("ISsue checking parent",e.stack)
		return null
	}
}

async function clearNextFreeBlockId(filePath, {
	blockId,
	name,
	folderName,
	parentFolerId
}={}) {
	var superblockFreeOffset = (
		4 + 2 + 1 + 1
	);
	var cursip = await getSuperBlock(filePath)
	var wr = await writeBytesToFileAtOffset(filePath, superblockFreeOffset, [
		{[`uint_${
			blockIdByteSize * 8
		}`]: 0}
	]);	

	if(log)
	
		console.trace("\n\n\n\n\n\n\noverwrite superblock free block "
	
		+ " at offset\n\n\t\t",

		superblockFreeOffset,
		" with block size ",
		blockIdByteSize,
		folderName,
		parentFolerId,
		"previously free block id was",blockId,
		"name",name,
		"and super",cursip
//		wr
	)
}

async function getNextFreeBlock(
	filePath, {
		name,
		folderName,
		parentFolerId
	}={}
) {
	var blockIndex = null;
	var superBlock = await getSuperBlock(filePath);
	var superblockFreeOffset = (
		4 + 2 + 1 + 1
	);
	if (
			
		superBlock.nextFreeBlockId && 
		superBlock.nextFreeBlockId !== 0
	) {
		
		blockIndex = superBlock.nextFreeBlockId;
		if(log)
			console.log("\n\nFree block exists at\n\t",blockIndex,"\n\n")
		var freeBlock = await readBlock({
			filePath,
			index: blockIndex,
			
			onlyMetadata: "small"
		});

		
		var nextFreeBlockId = freeBlock?.metadata?.nextBlockId;
		
		
		if(nextFreeBlockId) {
			
			
		
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
			

		} else {
			if(log)
				console.log("\n\nsuperblock free block info: \n\t\t",freeBlock?.metadata,"\n\n\n")
			
			await clearNextFreeBlockId(filePath, {
				blockId:blockIndex,
				name,
				folderName,
				parentFolerId
			});

			
		}
		
	} else {
		blockIndex = superBlock.totalBlocks + 1; // Block indices start at 1.
	
		if(log)
			console.log(`\n\nFree block did NOT exist. Adding new block #${
				blockIndex
			}`)
		// Update totalBlocks in the superBlock.
		const totalBlocksOffset = 8 + blockIdByteSize; // After fixed fields and nextFreeBlockId.
		await writeBytesToFileAtOffset(filePath, totalBlocksOffset, [{
			[`uint_${blockIdByteSize * 8}`]: blockIndex
		}]);

	}
	return blockIndex;
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
	folderName,
	isInChain = false,
	previousBlockId,
	type="folder",
	superBlock = null,
	overwriteIndex = null,
	doNotUpdateParent = false
}) {

	/**
	 * before we get to the 
	 * free block stuff,
	 * we have to check our parent folder
	 * to determine if an entry with
	 * current name exists
	 * 
	 * (we don't need the "name" to store here
	 *  but we do need it to check parent folder)
	 */

	
	superBlock = superBlock || await getSuperBlock(filePath);

	var lookForNewBlockIndex = true;

	let blockIndex = null;

	if(
		!isInChain && 
		name && 
		parentFolderId != 0
	) {
		if(log)
		console.log(`\n\nWriting entry at next block with name ${
			name
		} in ${
			folderName
		} with a folder parent ID of ${
			parentFolderId
		}`)
		var existingBlockIdOfThisSameEntry = name ? 
		await existingEntryWithNameInParentFolder({
			filePath,
			name,
			parentFolderId,
			superBlock
		}) : null;
		if(existingBlockIdOfThisSameEntry) {
		//	if(log)
				
			/**
			 * If it already exists we need to delete of all the previous blocks
			 */;
			 var del = await deleteEntry({
				filePath,
				index: existingBlockIdOfThisSameEntry,
				superBlock,
				onlyDeleteChildrenNotSelf:true
			//	onlyDeleteChainBlocks: true,  
			//	doNotDeleteChildren: true
			}); 
		
			 if(!overwriteIndex) {
				
				blockIndex = existingBlockIdOfThisSameEntry;
			}
			/**
			Here is the part of the logic
			needs furhter research.

			We get the current block ID of the existing entry.

			If it's a file then we just delete it the block.

			But we also need to update the parent if we 
			are deleting it, but that's updated 
			at the very end.

			If it's a folder
			then by default it also deletes all of it's children

			This means that the next free block ID isn't
			necessarily the same block Id as it was for this 
			entry.

			That means that if it's a folder,
			and is a child of another folder,
			then the other folder only references it by
			it's ID. IN this case it's an old ID reference,
			so the parent needs to be updated,
			which is done at the end.

			So for folder that's a child of other folder:

			It's block is deleted and all of it's children
			are deleted.

			Then the block ID naturally finds
			the next free ID to write the entry to

			Then the entry is written, taking up the 
			free IDs.

			But what about the children blocks that
			were all deleted? Since we are rewritnig
			the folder entry of them,
			which contained references to them before,
			then after deleting the children those
			IDs will no longer be valid.

			So maybe we should delete the folder without
			deleting it's children blocks. 

			But then if we are overriding the parent
			with blank data (which is usually block IDs)
			then the children blocks that
			were referenced in folder before would be lost.

			So: if only delete folder block and rewrite it
			with potentially new or blank data/IDs,
			then the old references to it's children 
			would be lost and inaccessible...

			IF all of the children are also deleted
			together with the parent folder block ID,
			then..?
			*/
	//		await removeChildFromParent
			superBlock = await getSuperBlock(filePath);
			//blockIndex = existingBlockIdOfThisSameEntry;
			if(log)
				console.log(`\n\n\n\t\t\tEntry ${name} already exists in ${parentFolderId}. BlockId ${
					blockIndex
				} and next free block idx is ${
					superBlock.nextFreeBlockId
				} just deleted: `,del)

	
		}
	}
	if(overwriteIndex !== null) {
		blockIndex = overwriteIndex;
	}
	

	
	const blockSize = superBlock.blockSize;
	const blockIdByteSize = superBlock.blockIdByteSize
	const fsMetadataOffset = superBlock.firstBlockOffset;
	
	
	

	superBlock = await getSuperBlock(filePath);
	// Determine the block index: either from the free list or by appending.
	if(blockIndex === null) {
		blockIndex = await getNextFreeBlock(filePath, {
			name,
			folderName,
			parentFolderId
		});
	}
	if(!blockIndex) {
		console.log("What is it",blockIndex)
		throw Error("Wrong new block index");
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
	
	
	if(log)
		console.log("Writing",blockIndex,
		"meta inst\n", metadataInstructions,
		"superblock updated",superBlock,

		lookForNewBlockIndex
	)

	// Calculate metadata size.
	let metadataSize = sizeof(metadataInstructions);
	

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
		currentData = Buffer.alloc(availableDataSpace);
		data.copy(currentData);
	}

	if(!data) {
		console.trace("no DATA??",blockIndex,name)
	}
	// Append the data portion to our write array.
	const writeArray = [...metadataInstructions];
	writeArray.push({
		[`buffer_${currentData.length}`]: currentData
	});



	superBlock = await getSuperBlock(filePath);
	// Write the block.
	await writeBytesToFileAtOffset(filePath, blockOffset, writeArray);
	if(log)
		console.log(`Block ${blockIndex} written at offset ${blockOffset} with ${currentData.length} bytes of data.`);

	// If data remains, recursively write the next block and update the chain.
	if (remainingData && remainingData.length > 0) {
		const nextBlockResult = await writeAtNextFreeBlock({
			filePath,
			data: remainingData,
		//	name,
			parentFolderId,
			folderName,
			isInChain: true,
			previousBlockId: blockIndex
		});
		const nextBlockIndex = nextBlockResult.blockIndex;
		// Update the current block's nextBlockId field.
		const nextBlockIdFieldOffset = blockOffset + blockIdByteSize + 1;
		await writeBytesToFileAtOffset(filePath, nextBlockIdFieldOffset, [{
			[`uint_${blockIdByteSize * 8}`]: nextBlockIndex
		}]);
		if(log)
			console.log(`Updated block ${blockIndex} nextBlockId to ${nextBlockIndex}.`);
	}

	// Optionally, update the parent's metadata if not root
	
	if (
		!doNotUpdateParent &&
		!isInChain && 
		blockIndex !== 1 && 
		parentFolderId !==0
	) {
		await updateParentFolder({
			filePath, 
			folderId: parentFolderId, 
			folderName,
			superBlock,
			newChildId: blockIndex,
			newChildName: name
		});
	}
	

	return {
		index: blockIndex,
		blockIndex,
		blockOffset,
		metadataSize,
		parentFolderId,
		folderName,
		name
	};
}