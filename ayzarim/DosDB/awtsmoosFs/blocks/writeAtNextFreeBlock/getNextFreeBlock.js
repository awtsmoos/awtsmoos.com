//B"H
var getSuperBlock = 
require("../getSuperBlock.js");

var readBlock = 
require("../readBlock.js")
var log = false;

var clearNextFreeBlockId =
require("../clearFreeBlockId.js");

var {
    writeBytesToFileAtOffset
} = require("../../../awtsmoosBinary/awtsmoosBinaryHelpers.js")
module.exports = 

async function getNextFreeBlock(
    filePath, {
        name,
        folderName,
        parentFolerId
    }={}
) {
    var blockIndex = null;
    var superBlock = await getSuperBlock(filePath);
    var blockIdByteSize =
    superBlock.blockIdByteSize;
    var superblockFreeOffset = (
        4 + 2 + 1 + 1
    );
    if (
            
        superBlock.nextFreeBlockId && 
        superBlock.nextFreeBlockId !== 0
    ) {
        
        blockIndex = superBlock.nextFreeBlockId;
       
        var freeBlock = await readBlock({
            filePath,
            index: blockIndex,
            
            onlyMetadata: "small"
        });

        
        var nextFreeBlockId = freeBlock?.metadata?.nextBlockId;
        
        
        if(nextFreeBlockId) {
            
            
        
            /*
                superBlock strucutre

                {
                    string_4: "AWTS"
                },
                {
                    uint_16: DEFAULT_BLOCK_SIZE
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
                {
                    [`uint_${blockIdByteSize * 8}`]: 0
                } // totalBlocks.
            */
            
            await writeBytesToFileAtOffset(filePath, superblockFreeOffset, [
                {[`uint_${
                    blockIdByteSize * 8
                }`]: nextFreeBlockId}
            ]);
            superBlock.nextFreeBlockId = nextFreeBlockId;
            

        } else {
            if(log)
                console.log("\n\nsuperblock free block info: \n\t\t",freeBlock?.metadata,"\n\n\n")
            
            await clearNextFreeBlockId(filePath, {
                blockId:blockIndex,
                name,
                folderName,
                parentFolerId
            });

            
        }
        
    } else {
        blockIndex = superBlock.totalBlocks + 1; // Block indices start at 1.
    
    
        
        // Update totalBlocks in the superBlock.
        const totalBlocksOffset = 8 + blockIdByteSize; // After fixed fields and nextFreeBlockId.
        await writeBytesToFileAtOffset(filePath, totalBlocksOffset, [{
            [`uint_${blockIdByteSize * 8}`]: blockIndex
        }]);

    }
    return blockIndex;
}