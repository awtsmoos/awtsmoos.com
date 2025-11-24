//B"H


var getSuperBlock = require("./getSuperBlock");
var readBlock = require("./readBlock");
var log = false;
var {
    readFileBytesAtOffset,
    writeBytesToFileAtOffset
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers")
module.exports = 


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
    superBlock,
    doNotDeleteChildren = false,
    onlyDeleteChainBlocks = false,
    onlyDeleteChildrenNotSelf = false
    ,
    deletingFolder = false
}={}) {

    superBlock = superBlock || 
    await getSuperBlock(filePath);

    blockSize = superBlock.blockSize;
    blockIdByteSize = superBlock.blockIdByteSize;

    var infoAboutDeletedEntry = await readBlock({
        filePath,
        index,
        blockSize,
        blockIdByteSize,
        onlyIDs: true,
        superBlock
    });
    if(infoAboutDeletedEntry) {
        superBlock = infoAboutDeletedEntry.superBlock;
    }
    var deleted = []
    if(deletingFolder) {
        /**
         * If we're deleting a folder 
         * we also have to delete all 
         * of it's child blocks / entries
         */
        if(!doNotDeleteChildren) {
            var folderFull = await readBlock({
                filePath,
                index,
                superblockInfo: superBlock
            });
            var data = folderFull?.data;
            var folderDataEntries = await parseFolderData(data);
            if(folderDataEntries) {
                if(log)
                console.log("Deleting folder entries, ",folderDataEntries)
                var k = Object.keys(folderDataEntries);
                for(var key of k) {
                    var del = await deleteEntry({
                        filePath,
                        index: folderDataEntries[key],
                        superBlock
                    })
                    deleted.push(del);
                }
            }
        }
    }
    if(onlyDeleteChildrenNotSelf) return {
        deletedBlocks: deleted,
        superBlock
    }
    allBlockIDs = allBlockIDs || (
        infoAboutDeletedEntry
    )?.allBlockIDs;
    if(!allBlockIDs) {
        if(log)
            console.trace("coulnd't delete",index,filePath)
        
      return null;
    }
    var firstBlock = null
    if(onlyDeleteChainBlocks) {
        firstBlock = allBlockIDs.shift();
    }
    if(!allBlockIDs.length) {
    //	console.log("Not really deleting",index)
        return {
            deletedBlocks: null,
            firstBlock,
            superBlock
        }
    }
    if(log)
        console.log("Really deleting",allBlockIDs,infoAboutDeletedEntry.metadata.nextBlockId,"next<<")
    // Mark each block as deleted.
    for (const blockIndex of allBlockIDs) {
        const fsMetadataOffset = superBlock.firstBlockOffset;
        const blockOffset = fsMetadataOffset + (blockIndex - 1) * blockSize;
        const isDeletedOffset = blockOffset/**
         * isDeleted and type is first thing
         */
        
        var curSchema = await readFileBytesAtOffset({
            filePath,
            offset: isDeletedOffset, 
            schema: {
                isDeletedAndTypeByte: "uint_8"
            }
        });
        var isDeletedAndTypeByte = 
            curSchema.isDeletedAndTypeByte | (
                0b00000001
            ); //turns on the LAST bit / deletes it 
            //but keeps type bit in tact
        //console.log("Deleted byte", isDeletedAndTypeByte.toString(10))
        await writeBytesToFileAtOffset(
            filePath, isDeletedOffset, [{
            uint_8: isDeletedAndTypeByte
        }]);
        if(log)
            console.log(`Block ${blockIndex} marked as deleted.`);
    }

    // Update the free list.
   // superBlock = await getSuperBlock(filePath);
    if (superBlock.nextFreeBlockId === 0) {
        /**
         * IF theres no next free block ID
         * the expected behaviour is to set it
         * to the first block in the chain 
         * that was deleted which is
         * automatically
         * linked to other blocks to start
         * the free block chain
         */
        superBlock.nextFreeBlockId = allBlockIDs[0];
        const nextFreeOffset = 4 + 2 + 1 + 1 + 1;
        await writeBytesToFileAtOffset(filePath, nextFreeOffset, [{
            [`uint_${blockIdByteSize * 8}`]: allBlockIDs[0]
        }]);
       // superBlock = await getSuperBlock(filePath);
        if(log)
            console.log(`Superblock nextFreeBlockId set to ${allBlockIDs[0]}.`);
    } else {
        
        /**
         * IF the superblock's free block ID 
         * already exists the expected 
         * behaviour is to first, get it and keep
         * track of it.
         * 
         * Then, set it as the nextBlockId of the LAST
         * block in the chain that was just deleted.
         * 
         * Then, set the superblock nextfreeBlockId to
         * the Id of the FIRST block just deleted.
         */
        const currentFree = superBlock.nextFreeBlockId;

        const lastBlockIndex = allBlockIDs[allBlockIDs.length - 1];
        
        const fsMetadataOffset = superBlock.firstBlockOffset; /**
         * offset in db file of first block.

            To find any ohter block just multiply block index 
            (which starts at 1 soo subtract by 1 to get
            first (at the 0th place)) by
            block size and add it to this offset
         */
        const lastBlockOffset = fsMetadataOffset + 
            (lastBlockIndex - 1) * blockSize; /**
         * Offset of the beginning of the last
        block that was just deleted
         */
        const nextBlockIdFieldOffset = lastBlockOffset 
            + 1; /**
            schema of block metadata is
            {
            
            isDeletedAndTypeInfo: "uint_8", 
            nextBlockId: `uint_${blockIdByteSize * 8}`,
           
            so to get nextBlockId we do

            1
        };
        */
        
        await writeBytesToFileAtOffset(
            filePath, nextBlockIdFieldOffset, [{
            [`uint_${blockIdByteSize * 8}`]: currentFree
        }]);
        
        /**
         * Write the current free block to the next
            block in the deleted chain
         */
        const nextFreeOffset = 4 + 2 + 1 + 1 + 1; /**
        schema for superblock is

        {
            string_4: "AWTS"
        },
        {
            uint_16: DEFAULT_BLOCK_SIZE
        },
        {
            uint_8: mini block size
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


        so to get to nextFreeBlock we do 

        4 + 2 (uint_16 is 2 bytes) 
        + 1 + 1
         */
        await writeBytesToFileAtOffset(
            filePath, nextFreeOffset, [{
            [`uint_${blockIdByteSize * 8}`]: allBlockIDs[0]
        }]);
       
        superBlock.nextFreeBlockId =  allBlockIDs[0]
        if(log)
            console.log(
                `Deleted chain linked. 
                Superblock nextFreeBlockId
                 updated to ${
                    allBlockIDs[0]
                }. Set next block to be deleted 
                which was previously free: ${
                    currentFree
                } to the block ${
                    lastBlockIndex
                }. `,
                );
    }

    return {
        deletedBlocks: [...deleted,...allBlockIDs],
        superBlock
    };
}



async function parseFolderData(data) {
    try {
        var is = await awtsmoosJSON.isAwtsmoosObject(
            data
        )
        if(is) {
            return await awtsmoosJSON.deserializeBinary(data);
        }
        return null;
    } catch(e) {
        return null;
    }
}