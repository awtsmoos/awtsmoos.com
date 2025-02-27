//B"H


var readBlock = 
require("../readBlock")
var awtsmoosJSON = require(
	"../../../awtsmoosBinary/awtsmoosBinaryJSON.js"
);
var deleteEntry = require("../deleteEntry.js");
var getSuperBlock = require("../getSuperBlock.js");
var updateParentFolder = require("./updateParentFolder.js");

var existingEntryWithNameInParentFolder = 
require("./existingEntryWithNameInParentFolder.js");

var getNextFreeBlock = 
require("./getNextFreeBlock.js");

var {
	sizeof,
	writeBytesToFileAtOffset
} = require("../../../awtsmoosBinary/awtsmoosBinaryHelpers.js");

var log = false;


module.exports = 






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
 
That's all normal IF the data is more than superBlock.blockSize
but if it's less, then we break up the data into
several smaller blocks to save space.

If it's less, we search for next mini block.

The superblock should contain property
nextFreeMiniBlockId which is a 2 part ID,
first part is a 32 bit ID of the main block,
similar to regular block ID. then each 4kb block
could be divided into 256 smaller blocks of 
of 16 bytes each. 

So the 2nd part of the ID is one byte indicating 
the byte index (essentially a bitmap
between 0-255 each bit value corresponding
to a byte).

If that value in the superblock is equal to 0,
that means we don't have any mini blocks available,
so we have to allocate a new blockHolder from the
regular blocks.

So we go through the regular process of finding the next
free regular block to be our new blockHolder (see above).

Once we have found it, we assume all mini blocks in it
are empty, so we set our superblock's next free mini block
value to the ID of the our main block plus 1,
indicating the first of our mini blocks.

(regular blockIDs start at 1 because of the superblock
and miniblocks in each blockHolder start at 1 because
if it's 0 that indicates we reference the headers
of the blockHolder to tell us what it is
because there's not enough room for big headers of
IDs in each mini block.)

Then, we start writing our data to it.

If the data is larger than 16 bytes but still less
than full blockSize, we slice ur data to 16 and write the 
next mini block.

Once we started writing our first mini block,
we set the next free mini block in the
superblock to the next one that is 
free. 

In our blockHolder, we could have a header
value nextFreeMiniBlock 
(in addition to the superblock one).
By default when it's created, it's set to 1 (first).
Then once that is taken up, it goes to the next.

Each mini block has a few header values:
mini block ID / index (between 0-255).

isDeleted / type byte
(1st LSB indicates if free 
next 2 LSBs number 0-3
indicating the type (file, folder and 2 reserved types))

The other 5 bits may be used for 
the next blockHolder in the chain
(0-63)
Next byte is if the reference to the
next blockHolder in the chain
is greater than 64, use this byte
for a combined 12 bits (2^14).

if part of chain (
    if data is more than 4 bytes
) then nextMiniBlockID (1 byte);
If not the first value in the chain,


So far we have 4 bytes (out of the 16):

blockId: 1
isDeletedAndType: 1
nextBlockHolderIdxHigh: 1 (only used
if mini blocks extend across
multiple blockHolders and the number
of blockHolders in the blockHolder
chain is greater than 64)

nextBlockId: 1


Then if it's the first we also need metadata
for our file/folder, which is just 
time created and time modified

each is uint_32 so that's 4 more bytes each:
createdAt: 4
lastModified: 4

so far that's 4 + 4 + 
1 + 1 + 1 + 1 = 
12 bytes for headers, leaving 4 bytes
more for the actual data (of the first block).

But if the data is more than 4 then it goes
to next blocks, which only have
the first 4 bytes as headers so they have
12 bytes of space each.



If that value (
the superblock's nextFreeMiniBlock)
is NOT equal to 0,
that means a current block exists at that
location that has a type blockHolder 
(only types are file, folder and blockHolder).
Then we find the mini block (between 0-255) within
that and start writing our data to it.

If the data is greater than 16 bytes (minus headers,
which is 4 bytes of data)
but still less than the full block size of 4kb,
then we find the next free mini block (usually it'll be
in the same block.)

Process for finding next free mini block:

Each blockHolder has in it's header
nextFreeMiniBlock (one byte).
If it's 0, that means no more mini blocks available
in this block holder, 
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
	var existingBlockIdOfThisSameEntry = null
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
		existingBlockIdOfThisSameEntry = name ? 
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
			
			blockIndex = existingBlockIdOfThisSameEntry?.blockIndex;
			overwriteIndex = null;
			 if(!overwriteIndex) {
				
				
			} else {
			//	console.log("over rigde")
			}
			
			superBlock = await getSuperBlock(filePath);
			
			if(log)
				console.log(`\n\n\n\t\t\tEntry ${name} already exists in ${parentFolderId}. BlockId ${
					blockIndex
				} and next free block idx is ${
					superBlock.nextFreeBlockId
				} just deleted: `)

			if(type == "folder") {
				var ob = {};

				var is = Buffer.isBuffer(data) ? 
					await awtsmoosJSON?.isAwtsmoosObject(data)
					: false;
				if(!is) {
			//		console.trace("Data to write isn't even valid at all LOL");
					return {
						blockIndex
					}
				} else {
					ob = await awtsmoosJSON?.deserializeBinary(data);
					
				}
				if(ob) {
					/*
						the existingData proeprty is the
						data of the PARENT

						need to get current data of SELF
					*/
					var selfBlockIndex = blockIndex;
					var selfBlock = await readBlock({
						filePath,
						index: selfBlockIndex
					})
					var oldData = selfBlock?.data
					
					if(oldData) {
						var isIt = await awtsmoosJSON?.isAwtsmoosObject(oldData)
						if(isIt) {
							var ex = await awtsmoosJSON.deserializeBinary(oldData);
							if(typeof(ex) == "object") {
								console.log("syncing data maybe",ex,ob);
								var del = await deleteEntry({
									filePath,
									index: blockIndex,
									superBlock,
									//onlyDeleteChildrenNotSelf:true
									onlyDeleteChainBlocks: true,  
								//	doNotDeleteChildren: true
								}); 
								var newData = {...ex, ...ob}
								data = awtsmoosJSON.serializeJSON(newData);
							} 
						}
					}//else console.log(ex,"22")
				}

			} else if(type == "file"){
				var del = await deleteEntry({
					filePath,
					index: blockIndex,
					superBlock,
					//onlyDeleteChildrenNotSelf:true
					onlyDeleteChainBlocks: true,  
				//	doNotDeleteChildren: true
				}); 
			}
	
		} else {
		//	console.log("does NOT exist in parent: ",name)
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
	
	//console.log("Writing to",blockIndex,name,folderName)
	// Calculate this block's file offset.
	const blockOffset = fsMetadataOffset + (blockIndex - 1) * blockSize;

	// Build metadata instructions.
	let metadataInstructions = [];
	var deleteAndTypeByteInOne = 0b00000000;
	var typeToBits = {
		file: 0b01,
		folder: 0b00,
		blockHolder: 0b10
	}
	var typebit = typeToBits[type] || 0;
	deleteAndTypeByteInOne = (
		deleteAndTypeByteInOne |
		typebit << 1
	); /**
	move over the type bits by 1 to leave
	the  SB as 0 (which is isDeleted) 
	and the next 2 LSBs as the type*/
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
		metadataInstructions = [
			{
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
	
	var smallBlockSize = 128;
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
	} else if(data.length < smallBlockSize) {
		metadataInstructions[1] = {
			uint_8: 0 |
				typeToBits["blockHolder"] << 1
		}
		currentData = Buffer.alloc(availableDataSpace);
		data.copy(currentData);
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
		!existingBlockIdOfThisSameEntry &&
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
			newChildName: name,
			writeAtNextFreeBlock
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