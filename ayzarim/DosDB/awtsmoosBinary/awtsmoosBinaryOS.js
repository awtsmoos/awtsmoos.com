//B"H
var awtsmoosJSON = require("./awtsmoosBinaryJSON.js");
/**
 * size of superblock:
 * 
 * 
 */

var SUPER_BLOCK_SIZE = 38;
var BLOCK_HEADER_SIZE = 107 - 8*3
var BLOCK_CHAIN_HEADER_SIZE = (4 + 4 
	+ 4 + 1 + 1)

	
var {

  readBytesFromFile,
  writeBytesToFile,
  openFile,
  closeFile,
  splitData
} = require("./awtsmoosBinaryHelpers.js");
var magic = 4;

async function setupEmptyFilesystem(path, {
	magicWord='B"H\n',
	fileSystemName = "\n\nAwtsmoos FS\n\n\n",
	BLOCK_SIZE = 128
}={}) {
	var file = await openFile(path);
	//console.log("GOT file",file)
	var base = await writeBytesToFile(
		file,
		0,
		magicWord
	);
	var firstBlockOffset = magic +
		SUPER_BLOCK_SIZE;

	var superBlock = await writeBytesToFile(
		file,
		base.offset,
		[
			{uint_2: BLOCK_SIZE},//block size
			{uint_4: 0}, //nextFreeBlock
			{uint_4: firstBlockOffset}, //root folder block idx
			{uint_4: 0}, //total data blocks
			{uint_4: 0}, //used blocks
			{uint_4: 0}, //deletedBlocks
			//uint32 * 5 = 20 bytes so far
			{
				string_16: fileSystemName
			}
		]
	);
	await writeDataAtNextBlock({
		file,
		name: "root"
	});
	
	await closeFile(file)
	return superBlock;
}

async function getSuperBlock({
	file
}={}) {
	var superB = await readBytesFromFile(
		file,
		magic,//magic word size
		{
			blockSize: "uint_2",
			nextFreeBlock: "uint_4",
			firstBlockOffset: "uint_4",
			totalDataBlocks: "uint_4",
			usedBlocks: "uint_4",
			deletedBlocks: "uint_4",
			name: "string_16"
		}
	);
	await closeFile(file);
	return superB;
}

async function readBlock({
	file,
	blockId,
	metadata = true,
	superBlock=null,
	withoutData = false,
	chain=false//only reads first block
		//if true follows until loads all
}) {

	if(!blockId) return {
		file
	}
	var {
		offset
	} = await getBlockOffsetFromId({
		file,
		blockId,
		superBlock
	});

	var metadataSize = BLOCK_HEADER_SIZE;
	var blockMetadata = await readBytesFromFile(
		file,
		offset,
		{
			index: "uint_4",
			lastBlockId: "uint_4",
			nextBlockId: "uint_4",
			isDeleted: "uint_1",
			type: "uint_1",
		})
	var guessedOffset = 4 + 4 + 4 + 1 + 1;
	var newOffset=blockMetadata;
//	console.log("Offset new",newOffset,guessedOffset)
	if(chain){ 
	//	console.log("LOL",blockMetadata, "BLOCK id",blockId)
	}
	if(
		blockMetadata.lastBlockId == 0
	) {
		
			var otherMetadata = await readBytesFromFile(
				file,
				offset + guessedOffset, 
				{
					
					parentFolderId: "uint_4",
					/*createdAt: "buffer_8",//"uint_8",
					modifiedAt: "uint_8",
					accessedAt: "uint_8",*/
					permissions: "uint_1",
					name: "string_64"
				
			
				})
			blockMetadata = {
				...blockMetadata,
				...otherMetadata
			}
			
		
	} else {
		metadataSize = BLOCK_CHAIN_HEADER_SIZE
	}

	if(metadata) {
		await closeFile(file)
		blockMetadata.file=file;
		return blockMetadata;
	}
	if(!superBlock) {
		superBlock = await getSuperBlock({
			file
		})
	}
	var islast =  blockMetadata.nextBlockId == 0 &&
	blockMetadata.lastBlockId != 0;

	var isfirst = !blockMetadata.lastBlockId &&
		blockMetadata.nextBlockId;

	var datasize = superBlock.blockSize - metadataSize;
	var data = null;
	if(!withoutData)
		data = await readBytesFromFile(file, offset + metadataSize, datasize);
	
	var allBlockIDs = [];
	var nextBlockId = blockMetadata.nextBlockId;

	
	// Process blocks recursively, only pushing non-last blocks in the loop
	var firstPushing = false;
	while (nextBlockId) {
		//if(!allBlockIDs.includes(nextBlockId))
		if(!firstPushing) {
			allBlockIDs.push(nextBlockId);
			firstPushing = true;
		}
		let block = await readBlock({
			file,
			blockId: nextBlockId,
			withoutData: true,
			metadata: false,
			superBlock,
			chain: true,
		});

		if (!block || !block.metadata) break;

		nextBlockId = block.metadata.nextBlockId;
		if(nextBlockId)
			allBlockIDs.push(nextBlockId);

	}
	var allDataFromBlocks =
		[data] // Start with an empty array

	if(isfirst) {
		for(var bId of allBlockIDs) {
			var block = await readBlock({
				file,
				blockId: bId,
				metadata: false,
				superBlock,
				chain
			});
			allDataFromBlocks.push(block.data)
		}

		
	}


	if(!withoutData)
		data = Buffer.concat(allDataFromBlocks);
	await closeFile(file);
	return {
		data,
		file,
		superBlock,
		metadata: blockMetadata,
		allBlockIDs 
	};
}


async function getNextFreeBlockIndex({
	file,
	index = null,
	superBlock
} = {}) {
	superBlock = superBlock || 
		await getSuperBlock({
			file
		});


	var {
		firstBlockOffset,
		totalDataBlocks,
		blockSize
	} = superBlock;;
	
		

	
	var offset = null;

	index = index || superBlock.nextFreeBlock;
	var isNewBlock = false;
	if(index === 0) {/**
		no free blocks so add to end
		after all blocks that have ever been made
		*/
		offset =  firstBlockOffset +
		(totalDataBlocks) * blockSize;
		isNewBlock = true;
		index = totalDataBlocks + 1;
	} else {
		//find the exact index to write to
		offset = firstBlockOffset + 
		(index-1) * blockSize;
		id = index;
	}

	return {
		index,
		offset,
		superBlock,
		isNewBlock
	}
}

async function getBlockOffsetFromId({
	file,
	blockId,
	superBlock=null
} = {}) {
	if(!superBlock) {
		superBlock = await getSuperBlock({
			file
		});

	}
	if(!superBlock) {
		return console.log("NO super block",file)
	}
	var {
		firstBlockOffset,
		blockSize
	} = superBlock;
	var offset = blockSize * (blockId - 1) +
		firstBlockOffset;
	return {
		offset,
		superBlock,
		blockSize
	};
}

async function adjustNextFree({
	file,
	superBlock,
	currentFreeBlock=null
}) {
	superBlock = superBlock 
		|| await getSuperBlock({
		file
	});
	var offsetToNextFreeBlock = magic + 2;
	if(!currentFreeBlock) {
		currentFreeBlock = (
			await readBytesFromFile(
				file,
				offsetToNextFreeBlock, {
					currentFreeBlock: "uint_4"
				}
			)
		)?.currentFreeBlock;
	}

	if(
		!currentFreeBlock &&
		currentFreeBlock !== 0

	) {
		return console.log("Couldn't get free block")
	}

	if(
		currentFreeBlock === 0
	) {
		return null;
	}
	/*
		we're trying
		to make this slot
		NOT free anymore. 
		search the chain to check
		if any deleted ones left
	*/
	var offsetToNextBlock = 4 + 4;
	var deletedId = null;

	var curBlockId = currentFreeBlock;
	while(!deletedId) {
		var curBlock = await getBlockOffsetFromId({
			file,
			blockId: curBlockId,
			superBlock
		});
		var nextOffset = await readBytesFromFile(
			file,
			curBlock.offset + 
			offsetToNextBlock,
			{
				nextBlockOffset: "uint_4"
			}
		);
		if(!nextOffset.nextBlockOffset) {
			break;
		}
		var nextBlockId = nextOffset.nextBlockOffset;

		var {
			offset
		} = await getBlockOffsetFromId({
			file,
			blockId: nextBlockId,
			superBlock
		});
		var metadataExtraOffset = 4 + 
			4 + 4;
		var read = await readBytesFromFile(
			file,
			offset + metadataExtraOffset,
			{isDeleted: "uint_1"}
		);
		if(read.isDeleted) {
			deletedId = nextBlockId;
			break;
		} else {
			curBlockId = nextBlockId;
		}
	}

	var freeIdToWrite = deletedId || 0;
	var offsetToGetToFree = 2;
	var deleteBlock = await writeBytesToFile(
		file,
		magic + 
		offsetToGetToFree, [
			{uint_4: freeIdToWrite}
		]
	);
	await closeFile(deleteBlock.file)

}

async function updateSuperblockUsedBlocks({
	file,
	usedBlocks,
	deletedBlocks
} ={}) {
	var usedBlocksOffset = magic + 
		2 + 4
		+ 4 + 4;
	var wr = await writeBytesToFile(
		file,
		usedBlocksOffset, [
			{uint_4: usedBlocks},
			{uint_4: deletedBlocks}
		]
	)
	await closeFile(wr.file);
	return wr;
}
async function updateSuperblockTotalBlocks({
	file,
	totalDataBlocks
} = {}) {
//	console.log("FILE info",file)
	/**
	 * {uint_2: BLOCK_SIZE},//block size
		{uint_4: 0}, //nextFreeBlock
		{uint_4: firstBlockOffset}, //root folder block idx
		{uint_4: 0}, //total data blocks
		{uint_4: 0}, //used blocks
		{uint_4: 0}, //deletedBlocks
	 */
	var superblockTotalDataBlocksOffset = magic +
		2 + 4 + 4;
	if(!file) console.log("No file here sup")
	var wr = await writeBytesToFile(
		file,
		superblockTotalDataBlocksOffset, 
		{uint_4: totalDataBlocks}
	);
	await closeFile(wr.file)
	return wr;

}
var fileTypeMap = {
	folder: 0,
	file: 1
}

async function writeDataAtNextBlock({
	file,
	parentFolderId = 0,//none, so THIS is root folder
	type = "folder",
	isFirstBlockOfData=true,
	isLastBlockOfData=true,
	lastBlockId=0,
	name,
	index = null,
	data="",

}={}) {
	
	if(isFirstBlockOfData) {
		if(!name) name = "New "
		+ type + " " + Date.now();
	}
	if(name > 64) name = name.substring(0, 64);
	if(!file) console.log("No file here wrti")
	var {
		offset,
		index,
		
		superBlock,

		isNewBlock
	} = await getNextFreeBlockIndex({
		file,
		index
	
	});
	var {
		blockSize,
		totalDataBlocks,
		usedBlocks,
		deletedBlocks
	} = superBlock;
	
	
	if(isNewBlock) {
		totalDataBlocks++;
		if(!file) console.log("No file here asd")
		var up =await updateSuperblockTotalBlocks({
			file,
			totalDataBlocks
		})
		superBlock
			.totalDataBlocks = totalDataBlocks;
			
	///	console.log("Update",up,superBlock)
	} else {
		if(!file) console.log("No file here", 2323)
		var existingBlock = await readBlock({
			file,
			blockId: index,
			superBlock
		});
		var {
			isDeleted,
			file
		} = existingBlock

		//console.log("Read block", existingBlock,"from",name,index)

		if(!file) console.log("No file here",3212123)
		if(isDeleted) {
			deletedBlocks--;
			usedBlocks++;
			var del = await updateSuperblockUsedBlocks({
				file,
				deletedBlocks,
				usedBlocks
			});
			superBlock.deletedBlocks = deletedBlocks
			superBlock.usedBlocks = usedBlocks;

			var ad = await adjustNextFree({
				file,
				superBlock
			})
			
		}
		
		var f = await closeFile(file);
	}

	var nextIndex = 0; //last in chain
	var size = isFirstBlockOfData ?
		BLOCK_HEADER_SIZE :
		BLOCK_CHAIN_HEADER_SIZE;

	var remainingSize = blockSize - size;

	//console.log("SIZE",size,blockSize, remainingSize)
	if(remainingSize < 1) {
		console.log("ISSUE");
		return {
			index: selfIndex,
			superBlock,
			file
		}
	}
	var buf = Buffer.alloc(remainingSize);
	var shouldWriteNext = false;
	if(data.length > remainingSize) {
		var {
			firstPart,
			remainder
		} = splitData(data, remainingSize);
		firstPart.copy(buf);

		
		shouldWriteNext = remainder;
		
		//console.log("Remaining",firstPart+"", "___", remainder+"")


	}
	
	var selfIndex = index;
	if(shouldWriteNext) {
		var next = await writeDataAtNextBlock({
			file,
			superBlock,
			isFirstBlockOfData: false,
			type,
			data: shouldWriteNext,
			lastBlockId: selfIndex
		});

		nextIndex = next.index;
		if(next.superBlock) {
			superBlock = next.superBlock;
		}
		console.log("REMANDER",index,next)
		//await closeFile(next.file)
		/*
			update the nextBlockId here
		*/
	} else {
		if(typeof(data) == "string") {
			data = Buffer.from(data);
		}
		data?.copy?.(buf);
		if(!isFirstBlockOfData) {
			console.log("LAST ONE TO GO", index,data.length,buf.length, remainingSize,buf+

				"",
				offset
			)
		}
	}

	//console.log("LOL",index,superBlock,blockSize,firstBlockOffset)
	var newBlock = null;
	
	if(isFirstBlockOfData) {
	//	console.log("FILE",file)
		if(!file) console.log("No file here",123)
		/*
			index: "uint_4",
			lastBlockId: "uint_4",
			nextBlockId: "uint_4",
			isDeleted: "uint_1",
			type: "uint_1",


			parentFolderId: "uint_4",
			lastBlockId: "uint_4",
			nextBlockId: "uint_4",
			createdAt: "buffer_8",//"uint_8",
			modifiedAt: "uint_8",
			accessedAt: "uint_8",
			permissions: "buffer_1",////"uint_1",
			name: "string_64"
				
	*/
		newBlock = await writeBytesToFile(
			file,
			offset,
			[
				{uint_4: index}, //blockID / index
				{uint_4: 0},//lastBlockId
				{uint_4: nextIndex}, //nextBlock, if part of chain
				{uint_1: 0}, //isDeleted, 0 means no
				{
					uint_1: fileTypeMap[type]

				}, //type (folder or file)
				{uint_4: parentFolderId},
				
				/*{uint_8: Date.now()},//created at time
				{uint_8: Date.now()},//modified at
				{uint_8:Date.now()},//accessed at
				*/
				{uint_1: 1},//permissions

				{string_64: name}, //name of entry
				
			]
		);
	} else {
		if(nextIndex) {
			console.log(
				"Part of CHAIN",
				nextIndex,
				index,
				lastBlockId
			)
		}
		newBlock = await writeBytesToFile(
			file,
			offset,
			[
				{uint_4: index}, //blockID / index
				{uint_4: lastBlockId},//lastBlockId
				{uint_4: nextIndex}, //nextBlock, if part of chain
				{uint_1: 0}, //isDeleted, 0 means no
				{
					uint_1: fileTypeMap[type]

				},
			]
		);
	}
	

	//console.log("WHAT",newBlock,offset,superBlock)
	
	var offsetOfDataToWrite = newBlock.offset;
	if(!file) console.log("No file here newblock")
	//console.log("writing empty data",blockSize-size,size)
	var blockData = await writeBytesToFile(
		file,
		offsetOfDataToWrite,
		buf
	);
	

	if(parentFolderId) {
		/**
		 * If we're anything but
		 * the root,
		 * we should update our 
		 * parent's folder data.
		 * 
		 * the ID is the index
		 * of the first block
		 * that our parent folder
		 * takes up.
		 */
		var updated = await updateParentFolder({
			file,
			folderId: parentFolderId,
			superBlock,
			newChildId: selfIndex,
			newChildName: name
		})
		
	}
	
	var meta = await readBytesFromFile(
		file,
		offset,
		{
			index: "uint_4",
			lastBlockId: "uint_4",
			nextIndex: "uint_4",
			isDeleted: "uint_1"
		}
	)
	await closeFile(blockData.file)
	await closeFile(newBlock.file)
	return {
		index: selfIndex,
		superBlock,
		file,
		dataLength: data.length,
		nextIndex,
		lastBlockId,
		offset,
		meta
	}
	

	/*console.log("GOT",await readBlock({
		file,superBlock,blockId:0
	}))*/
	
}

async function deleteEntry({
	file,
	superBlock,
	blockId,
	allBlockIDs
} = {}) {
	
	var deleted = 0;
	for(var blockId of allBlockIDs) {
		var {
			offset
		} = await getBlockOffsetFromId({
			file,
			blockId,
			superBlock
		});
		var metadataExtraOffset = 4 + 
			4 + 4;
		var wrote = await writeBytesToFile(
			file,
			offset + metadataExtraOffset,
			{uint_1: 1}
		);
		
		deleted++;

	}
	await closeFile(file)
	var offsetToGetToFree = 2;
	var undelete = await writeBytesToFile(
		file,
		magic + 
		offsetToGetToFree, [
			{uint_4: allBlockIDs[0]}
		]
	);
	await closeFile(undelete)
	superBlock.nextFreeBlock = allBlockIDs[0]
	var offsetToUsed = 2  +
		4 + 4 + 4
	var sup = await readBytesFromFile(
		file,
		magic + offsetToUsed,
		{
			usedBlocks: "uint_4",
			deletedBlocks: "uint_4"
		}
	)
	await closeFile(sup.file)
	if(sup.usedBlocks > 0) {
		sup.usedBlocks--;
	}
	sup.deletedBlocks += deleted;
	var usedWrite = await writeBytesToFile(
		file,
		magic + offsetToUsed, [
			{uint_4: sup.usedBlocks},
			{uint_4: sup.deletedBlocks}
		]
	)
	await closeFile(file)
	
	
	if(superBlock) {
		superBlock.usedBlocks = sup.usedBlocks;
		superBlock.deletedBlocks = sup.deletedBlocks
	}
	return {
		superBlock,
		usedWrite,
		file,
		deleted,
		blockId
	}

}



async function updateParentFolder({
	file,
	folderId,
	superBlock,
	newChildId,
	newChildName
} = {}) {
	var folderBlock = await readBlock({
		file,
		superBlock,
		blockId: folderId,
		metadata: false,
	});
	var {
		data
	} = folderBlock;

	var folderName = folderBlock?.metadata.name
	
	var {
		parentFolderId,
		name
	} = data;
	
	var is = awtsmoosJSON.isAwtsmoosObject(data);
	var ob = null;
	if(is) {
		ob = awtsmoosJSON.deserializeBinary(
			data
		)
	}
	if(!is) {
		var des = awtsmoosJSON.deserializeBinary(data)
		//console.log("TEST 1",des,data,folderId)
		ob = {};

	}
	
	var nam = newChildName;
	if(!ob[nam]) {
		ob[nam] = newChildId;
	}
	var serialized = awtsmoosJSON.serializeJSON(ob);
	var des = awtsmoosJSON.deserializeBinary(serialized)
	//console.log("TEST 2",des)
	//console.log("MAKING",ob)
	
	var del = await deleteEntry({
		file,
		blockId: folderId,
		superBlock,
		allBlockIDs: folderBlock
			.allBlockIDs
	})
	var write = await writeDataAtNextBlock({
		file,
		type:"folder",
		name: folderName,
		data:serialized,
		index: folderId
	});
	//console.log("WROTE",write)
	var data = await readBlock({
		file,
		blockId: write.index,
		metadata:false
	})
	var desagain = awtsmoosJSON.deserializeBinary(
		data.data
	)
	//console.log("Read",desagain)
	await closeFile(write.file);
	return write;
	//folderId

}

// Normalize a given path string into an array of folder names.
// E.g., "/hi/there/wow"  →  ["hi", "there", "wow"]
// and "/" becomes [] meaning the root folder.
function normalizePath(path) {
	if (typeof path !== "string") return null;
	return path
	  .split("\\")
	  .filter(Boolean)
	  .join("/")
	  .split("/")
	  .filter(Boolean);

}

/*
async function readFolder({
	file,
	path,
	withValues=false
}) {
	path = normalizePath(path);


	
	if(!path) return null;
	var name = path?.[path.length - 1];
	var getRootKeys = false;
	if(!name) getRootKeys = true;
	var rootFolder = await readBlock({
		file,
		blockId: 1,
		//chain: true,
		metadata: false
	});
	var {
		data,
		file
	} = rootFolder;
	await closeFile(file);
	//console.log("TRYING",rootFolder)
	var ob = null;
	if(!awtsmoosJSON.isAwtsmoosObject(data)) {
		
		return data.toString();
	}

	if(getRootKeys) {
		if(!withValues)
			return awtsmoosJSON.getKeysFromBinary(
				data
			)
		else {
			return awtsmoosJSON.deserializeBinary(
				data
			)
		}
	} else {
		var foldId = awtsmoosJSON.getValueByKey(
			name
		);
		
	
		
	}


	if(path.length == 1) {
		

	}
}

async function makeFolder({
	file,
	path,
	name
}) {
	path = normalizePath(path);
	if(!path) return null;
	if(typeof(name) != "string") {
		return null;
	}
	if(!path.length) {
		var {
			file
		} = await writeDataAtNextBlock({
			file,
			parentFolderId: 1,
			name
		})
		await closeFile(file);
	}
}

async function makeFile({
	file,
	path=null,
	name,
	data=""
}={}) {
	path = normalizePath(path);
	if(!path) return null;

	if(typeof(name) != "string") {
		return null;
	}
	if(!path.length) {
		var {file} = await writeDataAtNextBlock({
			file,
			parentFolderId: 1,
			name,
			data
		})
		await closeFile(file);
	}


}


async function readFile({
	file,
	path=null,
	name
}={}) {
	path = normalizePath(path);
	if(!path) return null;

	if(typeof(name) != "string") {
		return null;
	}
	if(!path.length) {
		var parentFolder = await readFolder({
			file,
			path: "/",
			withValues: true
		});
		var me = parentFolder?.[name];
		if(!me) return null;
		var fileBlock = await readBlock({
			file,
			blockId: me,
			metadata:false
		});
		await closeFile(file);
		return fileBlock?.data?.toString();
		
	}


}*/

// Reads a folder from the simulated database file.
// Always starts by reading the root block (ID 1) and then walks down the folder structure.
// If withValues is true, returns an object mapping folder/file names to block IDs;
// otherwise, returns just an array of names.
async function readFolder({ file, path, withValues = false }) {
	path = normalizePath(path);
	
	// Always start with the root block.
	let block = await readBlock({ file, blockId: 1, metadata: false });
	let data = block.data;
	await closeFile(file);
  
	if (!awtsmoosJSON.isAwtsmoosObject(data)) {
	  return data.toString();
	}
  
	// Deserialize the binary folder data.
	let folderObj = awtsmoosJSON.deserializeBinary(data);
  
	// If no further path is provided, return the entire object.
	if (!path.length) {
	  return withValues ? folderObj : Object.keys(folderObj);
	}
  
	// Traverse the folder structure down the given path.
	for (let segment of path) {
	  if (!(segment in folderObj)) return null; // Folder not found.
	  let blockId = folderObj[segment];
	  block = await readBlock({ file, blockId, metadata: false });
	  data = block.data;
	  await closeFile(file);
	  if (!awtsmoosJSON.isAwtsmoosObject(data)) {
		return data.toString();
	  }
	  folderObj = awtsmoosJSON.deserializeBinary(data);
	}
  
	return withValues ? folderObj : Object.keys(folderObj);
  }
  
  // Helper: Given a path array (e.g. ["hi", "there"]), returns the block ID
  // of the folder identified by that path. If the path is empty, returns 1 (root).
  async function getFolderBlockId(file, pathArray) {
	if (!pathArray.length) return 1; // Root folder.
	// For a single-level path (e.g. ["hi"]), the parent is the root.
	if (pathArray.length === 1) {
	  let rootFolder = await readFolder({ file, path: "/", withValues: true });
	  return rootFolder ? rootFolder[pathArray[0]] || null : null;
	} else {
	  // For deeper paths, the parent folder is the one one level up.
	  let parentPath = pathArray.slice(0, pathArray.length - 1);
	  let parentFolder = await readFolder({ file, path: parentPath.join("/"), withValues: true });
	  return parentFolder ? parentFolder[pathArray[pathArray.length - 1]] || null : null;
	}
  }
  
  // Recursively create a folder in the virtual file system.
  // 'path' is the folder path in which to create a new folder named 'name'.
  // For example, if path is "/hi/there" and name is "wow", then "wow" is created inside folder "there".
  // Missing intermediate folders are created along the way.
  async function makeFolder({ file, path, name }) {
	path = normalizePath(path);
	if (path === null || typeof name !== "string") return null;
  
	// If path is empty, then we're writing directly to root.
	if (!path.length) {
	  await writeDataAtNextBlock({ file, parentFolderId: 1, name });
	  return;
	}
  
	// Walk the path, creating intermediate folders as needed.
	let currentPath = []; // Empty means we're at the root.
	for (let segment of path) {
	  currentPath.push(segment);
	  // Try to read the folder at the currentPath.
	  let folder = await readFolder({ file, path: currentPath.join("/"), withValues: true });
	  // If folder doesn't exist, create it.
	  if (!folder) {
		let parentId = currentPath.length === 0 ? 1 : await getFolderBlockId(file, currentPath.slice(0, currentPath.length));
		await writeDataAtNextBlock({ file, parentFolderId: parentId, name: segment });
	  }
	}
  
	// Now, create the target folder inside the final folder in the given path.
	let parentId = await getFolderBlockId(file, path);
	await writeDataAtNextBlock({ file, parentFolderId: parentId, name });
  }
  
  // Recursively create a file in the virtual file system.
  // 'path' is the folder path in which to create the file.
  // For example, if path is "/hi/there" and name is "file.txt", then the file is created inside folder "there".
  // Missing intermediate folders are created along the way.
  async function makeFile({ file, path = null, name, data = "" } = {}) {
	path = normalizePath(path);
	if (path === null || typeof name !== "string") return null;
  
	// If path is empty, then the file is created in the root folder.
	if (!path.length) {
	  await writeDataAtNextBlock({ file, parentFolderId: 1, name, data });
	  return;
	}
  
	// Walk the folder path, ensuring that each folder exists.
	let currentPath = [];
	for (let segment of path) {
	  currentPath.push(segment);
	  let folder = await readFolder({ file, path: currentPath.join("/"), withValues: true });
	  if (!folder) {
		let parentId = currentPath.length === 0 ? 1 : await getFolderBlockId(file, currentPath.slice(0, currentPath.length));
		await writeDataAtNextBlock({ file, parentFolderId: parentId, name: segment });
	  }
	}
  
	// Create the file in the final folder.
	let parentId = await getFolderBlockId(file, path);
	await writeDataAtNextBlock({ file, parentFolderId: parentId, name, data });
  }
  
  // Reads a file from the virtual file system.
  // The file is looked up by traversing the folder structure specified by 'path',
  // and then finding the file with the given 'name' in that folder.
  async function readFile({ file, path = null, name } = {}) {
	path = normalizePath(path);
	if (path === null || typeof name !== "string") return null;
  
	// Get the folder (with its children mapping) where the file should reside.
	let folder = await readFolder({ file, path: path.join("/"), withValues: true });
	if (!folder || !(name in folder)) return null;
	let fileBlockId = folder[name];
	let block = await readBlock({ file, blockId: fileBlockId, metadata: false });
	await closeFile(file);
	return block.data.toString();
  }

module.exports = {
    readBytesFromFile,
    writeBytesToFile,

    setupEmptyFilesystem,
	readBlock,
	makeFolder,
	makeFile,
	readFolder,
	readFile
}
