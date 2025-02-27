//B"H


var {
    writeBytesToFileAtOffset
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js")

module.exports = 

async function clearNextFreeBlockId(filePath, blockIdByteSize) {
    var superblockFreeOffset = (
        4 + 2 + 1 + 1
    );
    console.log("Writing superblock",filePath,blockIdByteSize,superblockFreeOffset)
    var wr = await writeBytesToFileAtOffset(
            filePath, 
            superblockFreeOffset, 
            [
            {[`uint_${
                blockIdByteSize * 8
            }`]: 0}
        ]
    );	

   
    
}