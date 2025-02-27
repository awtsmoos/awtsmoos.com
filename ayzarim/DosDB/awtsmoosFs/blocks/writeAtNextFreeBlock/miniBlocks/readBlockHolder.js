//B"H
var getBlockOffset =
    require("../../getBlockOffset.js");

var {

    readFileBytesAtOffset
} = require("../../../../awtsmoosBinary/awtsmoosBinaryHelpers.js");
    
module.exports = 


async function readBlockHolder({
    filePath,
    superBlock,
    blockIndex
}) {
    var info = await getBlockOffset({
        filePath,
        superBlock,
        blockIndex
    });
    superBlock = info.superBlock;
    var blockOffset = info.blockOffset;

   // console.log("Block offset",blockOffset,info,blockIndex)
    
   var blockIdByteSize = superBlock.blockIdByteSize;

    var headersSize = blockIdByteSize + 2;
    var blockSize = superBlock.blockSize;

    var dataSize = blockSize - headersSize;

    var block = await readFileBytesAtOffset({
        filePath,
        offset: blockOffset,
        schema: {
            blockIndex: "uint_" 
            + blockIdByteSize * 8,

            typeInfo: "uint_8",
            
            reserved: "uint_"
            + blockIdByteSize * 8,

            nextFreeMiniBlockIndex: "uint_8",


            data: "buffer_" + dataSize
        }
    });

    return block;

}
