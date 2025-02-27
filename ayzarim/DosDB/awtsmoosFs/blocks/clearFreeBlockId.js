//B"H


var {
    writeBytesToFileAtOffset
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js")

module.exports = 

async function clearNextFreeBlockId(filePath) {
    var superblockFreeOffset = (
        4 + 2 + 1 + 1
    );
    
    var wr = await writeBytesToFileAtOffset(
            filePath, superblockFreeOffset, 
            [
            {[`uint_${
                blockIdByteSize * 8
            }`]: 0}
        ]
    );	

   
    
}