//B"H
var getSuperBlock = 
    require("../getSuperBlock.js");

var getNextFreeBlock = 
    require("./getNextFreeBlock.js");

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
    
    var nextFreeMiniBlock = superBlock
        .nextFreeMiniBlock;
    if(!nextFreeMiniBlock) {
        var nextFreeBlockInfo = await getNextFreeBlock({
            filePath,
            superBlock
        });
        superBlock = nextFreeBlockInfo.superBlock;
        
        var nextFreeBlockId = nextFreeBlockInfo
            .blockIndex;
        /*
            we allocate 
            new blockHolder to the 
            next free block, and write 
            the blockHolder headers to it
        */
        await writeBlockHolderHeaders({
            filePath,
            superBlock,
            blockIndex: nextFreeBlockId
        })
    }
}

async function writeBlockHolderHeaders({
    filePath,
    superBlock,
    blockIndex
}) {
    
}