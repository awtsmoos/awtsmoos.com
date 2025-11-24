//B"H
/**
 * simple helper function
 * to get the offset of a block
 */

const getSuperBlock  = require("./getSuperBlock.js");

module.exports = 

async function getBlockOffset({
    filePath,
    superBlock,
    blockIndex
}) {
    superBlock = superBlock ||
    await getSuperBlock(filePath);

    var firstBlockOffset = superBlock.firstBlockOffset;
    var blockSize = superBlock.blockSize;

    var blockOffset = firstBlockOffset + (
        blockIndex - 1 //starts at 1 
        // bc 0 is superBlock
    ) * blockSize;

    return {
        blockOffset,
        superBlock
    }
}