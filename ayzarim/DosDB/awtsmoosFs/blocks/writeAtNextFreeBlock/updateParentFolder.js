//B"H

var writeAtNextFreeBlock = require(".");
var awtsmoosJSON = require(
	"../../../awtsmoosBinary/awtsmoosBinaryJSON"
);
var readBlock = require("../readBlock");
var deleteEntry = require("../deleteEntry");

var getSuperBlock = require("../getSuperBlock")
module.exports =
async function updateParentFolder({
	filePath,
	folderId,
	name,
	folderName,
	superBlock,
	newChildId,
	newChildName,

    log=false,

	writeAtNextFreeBlock
} = {}) {

	var folderBlock = await readBlock({
		filePath,
		superBlock,
		index: folderId
	});

	if(!folderBlock) {

		return null;
	}
	var parentId  = folderId == 1 ? 0 : 
		folderBlock?.metadata?.parentBlockId
	
	if(!parentId && parentId !== 0) {
		throw Error("What is this"+parentId + " " +newChildId)
	}
	
    var {
		data
	} = folderBlock;

	
	
	var is = await awtsmoosJSON.isAwtsmoosObject(data);
	var ob = null;
	if(is) {
		ob = await awtsmoosJSON.deserializeBinary(
			data
		);
        
	}
	if(!is) {
        
		ob = {};

	}
	
	var nam = newChildName;
	if(nam && nam != undefined)
		ob[nam] = newChildId;
	else return;

	var serialized = awtsmoosJSON.serializeJSON(ob);
	//var des = awtsmoosJSON.deserializeBinary(serialized)
	
	
	var del = await deleteEntry({
		filePath,
		index: folderId,
	
		allBlockIDs: folderBlock
			.allBlockIDs,
		doNotDeleteChildren: true,
		onlyDeleteChainBlocks: true 
		/**
			do NOT delete the primary 
			block reference 
			onluy if its really big
		*/
	});

	var superB = await getSuperBlock(filePath);
	

	var write = await writeAtNextFreeBlock({
		filePath,
		type:"folder",
		name: folderName,
		data:serialized,
		overwriteIndex: folderId/*current index*/,
		parentFolderId: parentId,
		doNotUpdateParent:0  
		/*don't want to get into 
			recursive writing

		*/
	});
    
	var data = await readBlock({
		filePath,
		index: write.index
	});

	var superB = await getSuperBlock(filePath);
	if(log)
		console.log("\n\nRead back what just wrote?",folderName, 
		await awtsmoosJSON.deserializeBinary(data.data),
		write.index,"Folder ind",folderId,"free super",superB.nextFreeBlockId
	)

	return write;

}