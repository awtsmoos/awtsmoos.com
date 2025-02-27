//B"H
var getSuperBlock = 
    require("../../getSuperBlock.js");

var getNextFreeBlock = 
    require("../getNextFreeBlock.js");

var readBlockHolder = 
    require("./readBlockHolder.js");


var writeBlockHolderHeaders =
    require("./writeBlockHolderHeaders.js");

var {
    writeBytesToFileAtOffset,
} = require("../../../../awtsmoosBinary/awtsmoosBinaryHelpers.js");
    
module.exports = 
/*
    If an entry to write is less
    than standard block size,
    we split the data into 
    mini blocks that can
    exist within a blockHolder 
    block.

    the superblock should have 
    a nextFreeMiniBlockHolder (4 byte number
    indicating the index of the next free block
    that acts as a blockHolder. This is different
    than nextFreeBlock because a blockHolder
    might have other miniblocks in it, but this
    nextFreeMiniBlockHolder means the next
    blockHolder block that has at least some 
    miniblocks left.
    
    If it has no miniblocks left, then it will
    need to be set to the same as nextFreeBlock etc.)

    Once we find the blockHolder that has
    some free blocks, then we load the metadata
    into memory to determine which miniblock
    (usually within 256 or less potential ones)
    are free in the block holder. 

    In block holder's metadata we should have

    nextFreeMiniBlock (1 byte for 256 potential
    miniblocks per blockHodler) attribute
     

    
*/
async function getNextMiniBlock({
    filePath,
    superBlock
}) {
    superBlock = superBlock || 
        await getSuperBlock(filePath);
        
    var blockIdByteSize = superBlock.blockIdByteSize;
    var nextFreeMiniBlockHolderId = superBlock
        .nextFreeMiniBlockHolderId;
    var blockIndex = 0;

    if(!nextFreeMiniBlockHolderId) {
        var nextFreeBlockInfo = await getNextFreeBlock({
            filePath,
            superBlock
        });
        superBlock = nextFreeBlockInfo.superBlock;
        
        var nextFreeBlockId = nextFreeBlockInfo
            .blockIndex;
        console.log("Got next block",nextFreeBlockId)
        /*
            we allocate 
            new blockHolder to the 
            next free block, and write 
            the blockHolder headers to it
        */
        var wrote = await writeBlockHolderHeaders({
            filePath,
            superBlock,
            blockIndex: nextFreeBlockId
        });
        superBlock = wrote.superBlock;
        blockIndex = wrote.blockIndex;

        

    } else {
        blockIndex = nextFreeMiniBlockHolderId;
    }
    
    var blockHolder = await readBlockHolder({
        filePath,
        superBlock,
        blockIndex
    });
    superBlock = blockHolder.superBlock;


    var nextMiniBlockId = blockHolder
        .block
        .nextFreeMiniBlockIndex;
    if(nextMiniBlockId != 0) {
        /*
            we have at least one
            new free block,
            so we write it to the
            superBlock as this entire
            holder as being available
        */

            var superblockMiniBlockHolderOffset = 
                4/*magic*/ +
                2/*block size*/ +
                1/*mini block size*/ +
                1/*first block offset*/ + 
                1/*byte ID block size*/ +
                blockIdByteSize * 1 /*
                    only skipping nextFreeBlock
                */;

            var wr = await writeBytesToFileAtOffset(
                filePath,
                superblockMiniBlockHolderOffset,
                [
                    {[`uint_${
                        blockIdByteSize * 8
                    }`]: blockIndex}
                ]
            );
            superBlock.nextFreeMiniBlockHolderId
             = blockIndex;
    }
   // superBlock = await getSuperBlock(filePath)
    blockHolder.superBlock = superBlock;
    return {
        nextMiniBlockId,
        nextBlockHolderId: blockIndex,
    //    blockHolder,
        superBlock
     //   blockHolderData: blockHolder.data,
     //   blockHolderIndex: blockIndex
    }
}
