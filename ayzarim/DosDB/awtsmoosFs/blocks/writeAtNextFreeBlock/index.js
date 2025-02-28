//B"H

var {
    blockHeaderSize
} = require("../constants.js");

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

var getNextMiniBlock =
require("./miniBlocks/getNextMiniBlock.js");

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
 



filesystem basics revisited

4096-byte regular blocks

superblock tracks free blocks with nextFreeBlockId (8-32 bytes, starts at 1)

blockholders have 31 mini blocks of 128 bytes each

data > 4079 bytes uses nextFreeBlockId directly (your logic)

data < 4079 bytes uses mini blocks

multiple files/folders can share a blockholder

deleting and reclaiming needs to work smoothly

blockholder structure

header:

blockId: 8-32 bytes (variable, unique id)
type: 1 byte
bit 0: isDeleted (0 = in use, 1 = free)
bits 1-2: type (0 = file, 1 = folder, 2 = blockholder)
bits 3-7: nextMiniBlockId (5 bits, 0-31) - next free mini block index
nextBlockId: 8-32 bytes (variable) - chains to next blockholder
min header: 17 bytes (8 + 1 + 8)

4096 - 17 = 4079 bytes left
31 mini blocks (31 * 128 = 3968 bytes)
111 bytes leftover

mini block structure

first mini block: 1 byte header

type byte:
bit 0: isDeleted (0 = in use, 1 = free)
bits 1-2: type (0 = file, 1 = folder)
bits 3-7: nextMiniBlockId (5 bits, 0-31)
data: 127 bytes

non-first mini block: 1 byte header

same type byte setup
data: 127 bytes
total usage:

31 mini blocks * 1 byte header = 31 bytes
31 * 127 bytes data = 3937 bytes

3968 bytes total with headers

111 or 63 bytes free depending on header size
writing data (small files < 4079 bytes)

step 1: find or make a blockholder

check nextFreeBlockId
if 0 or no suitable blockholder:
allocate new: blockId = nextFreeBlockId
isDeleted = 0, type = 2 (blockholder)
nextMiniBlockId = 1, nextBlockId = 0
increment nextFreeBlockId
if blockholder exists:
use it if nextMiniBlockId <= 31
step 2: write first mini block

pick nextMiniBlockId index (e.g., 1)
isDeleted = 0, type = file or folder
nextMiniBlockId = next free index or 0 if done
write 127 bytes, remaining = total - 127
update blockholder.nextMiniBlockId
step 3: chain if needed

while remaining > 0:
nextMiniBlockId from last mini block
if 1-31 and not blocked:
write 127 bytes, remaining -= 127
nextMiniBlockId = next free or 0
update blockholder.nextMiniBlockId
if 0 or 32 (full):
new blockholder via nextFreeBlockId
link via current nextBlockId
write 127 bytes there
multiple entries:

blockholder.nextMiniBlockId tracks next free spot
file A might use mini blocks 1-3
file B starts at 4 if free
each mini block chains its own data with nextMiniBlockId
deleting and reclaiming

deleting a file:

find its mini blocks (folder indexes point to start)
for each mini block:
set isDeleted = 1 in type byte
nextMiniBlockId unchanged (still points ahead)
blockholder stays alive unless all mini blocks deleted
reclaiming space:

scan blockholder’s mini blocks
if all 31 have isDeleted = 1:
set blockholder isDeleted = 1
add blockId back to nextFreeBlockId pool (your logic)
if partial deletion (e.g., mini blocks 1-3 free):
update blockholder.nextMiniBlockId to first free spot
e.g., file A (1-3) deleted, file B (4-6) stays
nextMiniBlockId = 1
gaps in blockholder:

mini block 3 ends file A, isDeleted = 1
mini block 4 starts file B, in use
new file C uses mini block 3 if free
no need to shift data, just track free indices
chaining logic explained

mini block chaining:

nextMiniBlockId (5 bits) links within blockholder
0 = end of this file’s chain
1-31 = next mini block for this file
blockholder.nextBlockId chains to next blockholder
mid-blockholder blocking:

file A uses 1-3, ends at 3 (nextMiniBlockId = 0)
file B uses 4-6
file A grows, needs more space
nextMiniBlockId = 4 blocked by file B
solution: jump to new blockholder via nextBlockId
set mini block 3’s nextMiniBlockId to 0
blockholder.nextBlockId = new blockholder
new mini block 1 continues file A
relying on nextBlockId:

works if chain crosses blockholders
doesn’t work mid-blockholder unless we track free gaps
current fix: new blockholder for conflicts
better idea: bitmap for free mini blocks (below)
improving with bitmap

add to blockholder header:

miniBlockBitmap: 4 bytes (32 bits)
1 bit per mini block (31 used, 1 spare)
0 = free, 1 = in use
header now 21-69 bytes, still 31 mini blocks
writing with bitmap:

find first 0 in bitmap
use that mini block, set bit to 1
chain with nextMiniBlockId or jump via nextBlockId
deleting with bitmap:

set mini block isDeleted = 1
clear bitmap bit to 0
reclaim blockholder if all bits 0
mid-block chaining:

file A ends at 3, bitmap 111000...
file B at 4-6, bitmap 111111...
file A grows, finds next 0 (e.g., 7)
no new blockholder needed unless full
benefits:

handles gaps without relying solely on nextBlockId
reclaims space mid-blockholder
multiple entries tracked precisely
current vs bitmap

current method:

simple, 1 byte per mini block
nextMiniBlockId chains, nextBlockId jumps
gaps handled by new blockholders
reclaiming only if all deleted
bitmap method:

4 extra bytes in header
tracks every mini block’s state
chains anywhere in blockholder
reclaims mid-block gaps
i’d go bitmap for flexibility
*/
async function writeAtNextFreeBlock({
	filePath,
	data,
	name,
	parentFolderId=0,
    currentPath,
    allFoldersPathObject,
    parentFolderData,
	folderName,
	isInChain = false,
	previousBlockId,
	type="folder",
	superBlock = null,
	overwriteIndex = null,
	doNotUpdateParent = false,

    isFromUpdate = false,

    readFolder
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

	
	superBlock = superBlock ||
        await getSuperBlock(filePath);

    if(currentPath?.length) {
      //  console.log("path",currentPath)
    }

	let blockIndex = null;
	var existingBlockIdOfThisSameEntry = null;
    var alreadyExistsInParent = false;
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
		}`);


       
        existingBlockIdOfThisSameEntry = name ? 
		await existingEntryWithNameInParentFolder({
			filePath,
			name,
			parentFolderId,
			superBlock
		}) : null;
		if(existingBlockIdOfThisSameEntry) {
            superBlock = existingBlockIdOfThisSameEntry
                .superBlock
            alreadyExistsInParent = true;
		
            
				
			/**
			 * If it already exists we need to delete of all the previous blocks
			 */;
			
			blockIndex = existingBlockIdOfThisSameEntry?.blockIndex;
			overwriteIndex = null;
			
            
			
            
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
				if(is) {
					ob = await awtsmoosJSON?.deserializeBinary(data);
					
				} else {
                  /*  console.log(
                        "Nope",
                        blockIndex,
                        parentFolderId
                    )*/
                    return {
                        blockIndex,
                        superBlock
                    }
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
						index: selfBlockIndex,
                        superblockInfo: superBlock
					});
                    superBlock = selfBlock.superBlock
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
								
                                    onlyDeleteChainBlocks: true,  
							
                                }); 
                                superBlock = del.superBlock;
								var newData = {...ex, ...ob}
								data = awtsmoosJSON.serializeJSON(newData);
							} 
						}
					} else {
                        console.log("What?",ob)
                    }
				}

			} else if(type == "file"){
               /* console.log("DEELTING,block","block",
                    blockIndex, type, name,parentFolderData,
                parentFolderId);*/
                var del = await deleteEntry({
					filePath,
					index: blockIndex,
					superBlock,
			
                    onlyDeleteChainBlocks: true,  
			
                }); 
                if(del)
                    superBlock = del.superBlock;
               
                
			}
	
		} 
        
	}


	if(
        overwriteIndex &&
        blockIndex === null
    ) {
		blockIndex = overwriteIndex;
        
	}
	

	
	const blockSize = superBlock.blockSize;
	const blockIdByteSize = superBlock.blockIdByteSize
	const fsMetadataOffset = superBlock.firstBlockOffset;
	
    
    var blockDataSize = blockSize - blockHeaderSize(
        blockIdByteSize
    );

	

	var miniBlockIndex = null;
    var miniBlockInfo
	// Determine the block index: either from the free list or by appending.
	if(blockIndex === null) {
        if(data) {
            var freeBlockInfo = await getNextFreeBlock({
                filePath,
                superBlock
            });

        //   console.log("write",freeBlockInfo,folderName,name,type)
            blockIndex = freeBlockInfo?.blockIndex;
            superBlock = freeBlockInfo.superBlock;
            if(blockIndex == 0) {
                console.trace("ZERO bloc index?",name)
            }
        }

        if(
            data?.length >= blockDataSize
        ) {

          //  blockIndex = await getNextFreeBlock(filePath);
        } else if(data?.length > 0) {
            miniBlockInfo = await getNextMiniBlock({
                filePath,
                superBlock
            });
            superBlock = miniBlockInfo.superBlock;
            var miniBlockSize = superBlock.miniBlockSize;
            /**
             * mini blocks of 128 bytes. 32 per 
             * main block.
             * 
             * Header: 1 byte. 
             * LSB (0) flag if deleted or not
             * next LSB (1) 0 for type folder 1 file
             * LSBs 2-6 = 5 bits (32) for nextMiniBlock
             * WITHIN current blockHolder.
             * 
             * bit 8 is 0 by default meaning
             * don't look in any other blockHolder
             * and we assume that we are only
             * looking in the current blockHolder
             * for the next.
             * 
             * IF it's 1, then we know that the 
             * continuation is in another blockHolder
             * the 5 bit number, however,
             * still represents the nextMiniBlockId 
             * (since there's only 32 in each blockHolder)
             * but the actual blockHolder will be 
             * determined by next bytes
             * 
             * since each regular block is of 
             * variable amount then if that bit is 1
             * we know to check the next
             * blockIdByteSize number of bytes
             * to get the reference to the nextBlockHolder
             * that we're in.

             */

            if(!Buffer.isBuffer(data)) {
                data = Buffer.from(data);
            }

            var firstMiniBlock = data.subarray(
                0,
                miniBlockSize
            );
            var remainder = data.subarray(
                miniBlockSize
            );

           /* var wroteMiniBlock = await 
                writeAtNextFreeBlock({
                    filePath,
                    data: remainder,
                    parentFolderId,
                    parentFolderData,
                    isInChain: true,
                    type,
                    superBlock
                });*/
            
            /**
             * first we write next miniblock,
             * then we write our own
             */
            var deletedTypeAndNextByteInOne = 0;
            /**
             * as mentioned:
             * LSB: 1 = deleted 0 = not deleted.
             * (default 0 when writing obviously).
             * 
             * next LSB: 0 = folder, 1 = file.
             * 
             * next 5 LSBs: 0-32 index of next 
             * miniblock.
             * 
             * last bit: if 0, keep in same 
             * blockHolder.
             * 
             * If 1, search next 2 bytes
             * for next blockHolder info.
             * 
             * 
             */
            var miniblockSchema = [
                {
                    uint_8: 2
                }
            ]
            /*console.log("Mini",name,
                parentFolderId,
                parentFolderData,type,miniBlockInfo,data.length)
      */  
        } else if(data && data.length === 0) {
            data = null;
        } 
        
	}
	
    // Calculate this block's file offset.
    const blockOffset = fsMetadataOffset + 
    (blockIndex - 1) * blockSize;

    var metadataSize = blockHeaderSize(blockIdByteSize)
    if(data) {
	

        if(blockIndex === null) {
            console.log("What is it",blockIndex)
            throw Error("Wrong new block index");
        }
        if(blockIndex === 0) {
            console.trace("wats goingon",
                parentFolderData, blockIndex,
            name);
            return {
                blockIndex,
                superBlock
            };
        }

        if(blockIndex == 1) {
            var s = await awtsmoosJSON.deserializeBinary(
                data
            )
           // console.log("Writing ROOT",s)
        }
        // Build metadata instructions.
        let metadataInstructions = [];
        var deleteAndReservedInfo = 0b00000000;
        //LSB flag 0 = not deleted 1 = deleted.
        //other bits reserved for special info later.

        /**
        move over the type bits by 1 to leave
        the  SB as 0 (which is isDeleted) 
        and the next 2 LSBs as the type*/
        
        
        metadataInstructions = [
            /**
             * we could have stored
             * the block index here,
             * but it's not necessary
             * because it's based on
             * the offset in the FS..
             */
            {
                uint_8: deleteAndReservedInfo
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
                [`uint_${
                    blockIdByteSize * 8
                }`]: parentFolderId
            } //parent folder block index
            
        ];
        
      
        
        


        
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
        /*	metadataInstructions[1] = {
                uint_8: 0 |
                    typeToBits["blockHolder"] << 1
            }*/
            currentData = Buffer.alloc(availableDataSpace);
            data.copy(currentData);
        } else {
            currentData = Buffer.alloc(availableDataSpace);
            data.copy(currentData);
        }

        if(!data) {
            console.trace("no DATA??",blockIndex,name)
        }
        
        if(log)
            console.log(`Block ${
                blockIndex
            } written at offset ${
                blockOffset
            } with ${currentData.length} bytes of data.`);

        // If data remains, recursively write the next block and update the chain.
        if (remainingData && remainingData.length > 0) {
            const nextBlockResult = await writeAtNextFreeBlock({
                filePath,
                data: remainingData,
            //	name,
                parentFolderId,
                folderName,
                isInChain: true,
                previousBlockId: blockIndex,
                superBlock,
            
                
            });
            superBlock = nextBlockResult.superBlock;
            const nextBlockIndex = nextBlockResult.blockIndex;
        
            
            if(nextBlockIndex) {
                metadataInstructions[1] = {
                    [`uint_${blockIdByteSize * 8}`]: 
                    nextBlockIndex
                }
            }
        
            
            if(log)
                console.log(`Updated block ${blockIndex} nextBlockId to ${nextBlockIndex}.`);
        }

        // Append the data portion to our write array.
        const writeArray = [...metadataInstructions];
        writeArray.push({
            [`buffer_${currentData.length}`]: currentData
        });

        // Write the block.
        await writeBytesToFileAtOffset(
            filePath, blockOffset, writeArray
        );

        // Optionally, update the parent's metadata if not root
    }
   
	if (
      //  !isFromUpdate &&
       // !alreadyExistsInParent &&
		//!existingBlockIdOfThisSameEntry &&
		!doNotUpdateParent &&
		!isInChain &&
		blockIndex !== 1 /*
            do not rewrite 
            the root folder's
            "parent" because it 
            doesn't exist.

            The root itself, tho,
            can be rewritten
        */ &&
		parentFolderId !==0
	) {
		var upt = await updateParentFolder({
			filePath, 
			folderId: parentFolderId, 
			folderName,
			superBlock,
			newChildId: blockIndex,
			newChildName: name,
            newChildType: type,
            currentPath,
            allFoldersPathObject,
            
			writeAtNextFreeBlock,
            readFolder
		});
        if(upt && upt.superBlock)
            superBlock = upt.superBlock;
        if(data && type=="folder") {
            console.log("WRote with DATA",
                blockIndex,
                name,
                type,
                data,
                upt,
                parentFolderData,
                parentFolderId
            )
        }
	}
	

	return {
		index: blockIndex,
		blockIndex,
		blockOffset,
		metadataSize,
		parentFolderId,
		folderName,
		name,
        superBlock,
        currentPath
	};
}