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

    var deleteAndTypeByteInOne = 0b00000000;
	var typeToBits = {
        inChain: 0b00,
		folder: 0b01,
		file: 0b10,
		blockHolder: 0b11
	}

    var type = "blockHolder";

	var typebit = typeToBits[type] || 0;
	deleteAndTypeByteInOne = (
		deleteAndTypeByteInOne |
		(typebit << 1)
	);

    var wr = await writeBytesToFileAtOffset(
        filePath,
        blockOffset,
        [
            {[`uint_${
                blockIdByteSize * 8
            }`]: blockIndex},
            {uint_8: deleteAndTypeByteInOne},
            {[`uint_${
                blockIdByteSize * 8
            }`]: 0},//reserved
            {uint_8: 0}, //nextFreeMiniBlock
        ]
    );

    return {
        superBlock,
        wrote: wr,
        blockIndex
    }
}