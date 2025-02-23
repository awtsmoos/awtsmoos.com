//B"H

var awtsmoosJSON = require(
	"../../awtsmoosBinary/awtsmoosBinaryJSON.js"
);

var readBlock = require("./readBlock.js");
var getSuperBlock =
require("./getSuperBlock.js")
var log = false;
module.exports = 
async function existingEntryWithNameInParentFolder({
    filePath,//of database file NOT entry file
    name,
    parentFolderId,
    superBlock
}) {
    if(!name) {
    
        console.log("No name",parentFolderId)        
        return null;

    }
    superBlock = superBlock || await getSuperBlock(filePath);
    if(parentFolderId === 0) {
        console.log("Tryied to check root")   
        return null; //root (0) has no parent folder
    }
    try {
        var folderBlock = await readBlock({
            filePath,
            superBlockInfo: superBlock,
            blockId: parentFolderId
        });
        var d = folderBlock.data;
        var is = await awtsmoosJSON.isAwtsmoosObject(d);
        var ob = null;
        if(is) {
            ob = await awtsmoosJSON.deserializeBinary(
                d
            );
        } else {
            console.log("is NOT real object",parentFolderId,
                folderBlock
            );
            return null;
        }

        
        
        if(ob) {
            
            var off = ob[name];
            if(off) {

        //        if(log)
                    console.log(`\n\nGot Data for ${
                    parentFolderId
                } at entry ${
                    name
                } already exists at: `,off, ob, is,);

                return {
                    existingData: ob,
                    blockIndex: off
                };
            } else {
                console.log("Does NOT exist!",name,ob,off,parentFolderId)
            }
        }
    } catch(e) {

   //     if(log)
            console.log("ISsue checking parent",e.stack)
        return null
    }
}