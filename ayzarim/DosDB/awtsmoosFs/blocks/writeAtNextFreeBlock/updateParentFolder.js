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
	childTypeAndDeleteByte,
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
	
	/*var parentId  = folderId == 1 ? 0 : 
		folderBlock?.metadata?.parentBlockId
	
	if(!parentId && parentId !== 0) {
		throw Error("What is this"+parentId + " " +newChildId)
	}*/
	//console.log("Got parent id",parentId)
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
	
	var updatedTime = Math.floor(
		Date.now() / 1000
	);
	var createdTime = updatedTime;

	var nam = newChildName;
	var cur = ob[nam];
	if(cur) {
		/**
		 * each folder entry
		 * is array of 3 elements:
		 * first, the block ID.
		 * second, creation time.
		 * third, update time
		 */
	//	console.log("EXISTS already",cur)
		createdTime = cur?.[1];

	}
	if(nam && nam != undefined)
		ob[nam] = [
			newChildId,
			createdTime,
			updatedTime,
			childTypeAndDeleteByte || 44
		];
		
	else return;

	var serialized = awtsmoosJSON.serializeJSON(ob);
	//var des = awtsmoosJSON.deserializeBinary(serialized)
	
	
	var del = await deleteEntry({
		filePath,
		index: folderId,
	
		allBlockIDs: folderBlock
			.allBlockIDs,
		doNotDeleteChildren: true,
		onlyDeleteChainBlocks: true,
		superBlock
		/**
			do NOT delete the primary 
			block reference 
			onluy if its really big
		*/
	});

	superBlock = del.superBlock;
	

	var write = await writeAtNextFreeBlock({
		filePath,
		type:"folder",
		name: folderName,
		data:serialized,
		overwriteIndex: folderId/*current index*/,
	//	parentFolderId: parentId,
		doNotUpdateParent:0,
		superBlock,
		parentFolderData:ob,

		isFromUpdate: true //dont keep updating infinitely
		/*don't want to get into 
			recursive writing

		*/
	});
    superBlock = write.superBlock;

	var data = await readBlock({
		filePath,
		index: write.index
	});

	
	if(log)
		console.log("\n\nRead back what just wrote?",folderName, 
		await awtsmoosJSON.deserializeBinary(data.data),
		write.index,"Folder ind",folderId,"free super",superBlock.nextFreeBlockId
	)

	return write;

}