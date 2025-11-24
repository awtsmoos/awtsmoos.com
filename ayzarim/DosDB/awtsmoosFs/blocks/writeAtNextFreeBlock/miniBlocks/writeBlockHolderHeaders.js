//B"H

var getBlockOffset =
    require("../../getBlockOffset.js");


var {
    writeBytesToFileAtOffset,
} = require("../../../../awtsmoosBinary/awtsmoosBinaryHelpers.js");
    
module.exports = 


async function writeBlockHolderHeaders({
    filePath,
    superBlock,
    blockIndex
}) {
 
    
    var info = await getBlockOffset({
        filePath,
        superBlock,
        blockIndex
    });
    var blockOffset = info.blockOffset;
    superBlock = info.superBlock;


    var blockIdByteSize = superBlock.blockIdByteSize;

    var deleteAndInfo = 0b00000000;
	
    
    console.log("Writing index",blockIndex)
    var headerSize = blockIdByteSize * 1 + 2;
    var blockSize = superBlock.blockSize;
    var dataSize = blockSize - headerSize;
    var emptyData = Buffer.alloc(dataSize);

    var wr = await writeBytesToFileAtOffset(
        filePath,
        blockOffset,
        [
     
            

            {uint_8: deleteAndInfo},
                //info / is deleted (LSB)

            {[`uint_${
                blockIdByteSize * 8
            }`]: 0},//reserved, possible to 
            //use for linking blockHolders

            {uint_8: 0}, //nextFreeMiniBlock
            /*really only need first 5 bits,
            possibly do something with other 3 later
            starts at 1; 0 means no more free miniBlocks

            In fact, to make things easy,
            nextFreeMiniBlockId can start at 0.

            But if there are no remaining miniBlocks,
            then bit# 5 (6th bit) can be set to 1.

            */
            {[`buffer_${
                emptyData.length
            }`]: emptyData}
        ]
    );

    return {
        superBlock,
        wrote: wr,
        blockIndex
    }
}