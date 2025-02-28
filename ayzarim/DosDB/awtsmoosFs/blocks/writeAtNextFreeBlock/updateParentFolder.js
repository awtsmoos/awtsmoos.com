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
	currentPath,
	newChildType,
	
    log=false,

	writeAtNextFreeBlock
} = {}) {
	superBlock = superBlock ||
	await getSuperBlock(filePath);
	var folderBlock = null;

	if(folderId) {
		folderBlock = await readBlock({
			filePath,
			superBlock,
			index: folderId
		});

		if(!folderBlock) {
			console.log("What",folderId)
			return null;
		}
	}

	/*var parentId  = folderId == 1 ? 0 : 
		folderBlock?.metadata?.parentBlockId
	
	if(!parentId && parentId !== 0) {
		throw Error("What is this"+parentId + " " +newChildId)
	}*/
	//console.log("Got parent id",parentId)
    var data = null;
	if(folderBlock) {
		data = folderBlock.data;
	}
	

	
	
	var is = data && 
		await awtsmoosJSON.isAwtsmoosObject(data);
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
			newChildType
		];
		
	else return;

	var serialized = awtsmoosJSON.serializeJSON(ob);
	//var des = awtsmoosJSON.deserializeBinary(serialized)
	var writing = {
		filePath,
		type:"folder",
		name: folderName,
		data: serialized,
		
		
		doNotUpdateParent:0,
		superBlock,
		parentFolderData:ob,

		isFromUpdate: true //dont keep updating infinitely
		/*don't want to get into 
			recursive writing

		*/
	}
	if(folderId) {
		var del = await deleteEntry({
			filePath,
			index: folderId,
		
			allBlockIDs: folderBlock?.allBlockIDs,
			doNotDeleteChildren: true,
			onlyDeleteChainBlocks: true,
			superBlock
			/**
				do NOT delete the primary 
				block reference 
				onluy if its really big
			*/
		});
		if(del)
			superBlock = del.superBlock;
		writing.overwriteIndex = folderId/*current index*/;
		
	} else {
		console.log("Writing nul",ob,newChildName, newChildId)
	}

	var oldId = folderId;

	
	var write = await writeAtNextFreeBlock(writing);
	
    superBlock = write.superBlock;
	if(oldId === null & write.index) {
		
		var pathCopy = Array.from(currentPath);
		pathCopy.pop();
		var nextParent = !pathCopy.length ?
			"root" : pathCopy[pathCopy.length-1];
		var upt = null;
		if(nextParent == "root") {
			upt = await updateParentFolder({
				filePath,
				folderId: 1,
				
				folderName: "root",
				superBlock,
				newChildId: write.index,
				newChildName: folderName,
				currentPath: pathCopy,
				newChildType: "folder",
				writeAtNextFreeBlock
			})
		}
		console.log("WROTE",write.index, folderName,
			currentPath,nextParent,
			folderName,
			upt?.write
		)
		
	}

	return {
		write,
		superBlock
	}

}