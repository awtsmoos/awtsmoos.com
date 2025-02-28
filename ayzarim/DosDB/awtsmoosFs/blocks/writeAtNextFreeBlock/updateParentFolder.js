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
	allFoldersPathObject,
	newChildType,
	
    log=false,

	writeAtNextFreeBlock,
	readFolder
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
	//console.log("Just wrote folder", folderName, write.index)
    superBlock = write.superBlock;
	if(oldId === null && write.index) {

		/**
		 * we just replaced our 
		 * null index with new one.
		 * 
		 * we gotta update the parent(s) recursively
		 * to reflect that.
		 */
		
		var pathCopy = Array.from(currentPath);
		pathCopy.pop();


		var nextParent = !pathCopy.length ?
			"root" : pathCopy[pathCopy.length-1];

	
			
		if(nextParent == "root") {
			var upt = await updateParentFolder({
				filePath,
				folderId: 1,
				
				folderName: nextParent,
				superBlock,
				newChildId: write.index,
				newChildName: folderName,
				currentPath: pathCopy,
				
				newChildType: "folder",
				writeAtNextFreeBlock
			})
		///	console.log("Updated root", write.index,folderName)
		} else {
			var cop = Array.from(pathCopy);
			cop.pop();
			var red = await readFolder({
				filePath,
				path: cop.join("/"),
				withValues: true
			});
			var me = red[nextParent];

			var meId = me?.[0];
		/*	console.log(
				"nextP",
				nextParent,
				"new id",
				write.index,
				"name of entry written",
				folderName
				,
				red,
				me,
				meId
			);*/

			if(meId) {
				var upt = await updateParentFolder({
					filePath,
					folderId: meId,
					
					folderName: nextParent,
					superBlock,
					newChildId: write.index,
					newChildName: folderName,
					currentPath: cop,
					
					newChildType: "folder",
					writeAtNextFreeBlock
				})
			}
		}/*
		console.log("WROTE",write.index, folderName,
			currentPath,nextParent,
			folderName,
			upt?.write
		)*/
		
	} else {
		//console.log("What",write.index,folderName,oldId)
	}

	return {
		write,
		superBlock
	}

}