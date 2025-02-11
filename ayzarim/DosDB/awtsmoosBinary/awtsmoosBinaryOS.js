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
	
	
	return file;
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
		[data || null].filter(Boolean) // Start with an empty array

	if(isfirst) {
		for(var bId of allBlockIDs) {
			var block = await readBlock({
				file,
				blockId: bId,
				metadata: false,
				superBlock,
				chain
			});
			if(block.data)
				allDataFromBlocks.push(block.data)
		}

		
	}


	if(!withoutData)
		data = Buffer.concat(allDataFromBlocks);

	return {
		data,
		//file,
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
	//await closeFile(wr.file)
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
		file = up.file;
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
	///	console.log("REMANDER",index,next)
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
		file = newBlock.file;
	} else {
		if(nextIndex) {
		
			
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
		file = newBlock.file;
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
	file = blockData.file;
	

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
	var fileHandle = file;
	for(var blockId of allBlockIDs) {
		var {
			offset
		} = await getBlockOffsetFromId({
			file,
			blockId,
			superBlock
		});
		/*
			structure of beginning
			of block:

			{
				index: "uint_4",
				lastBlockId: "uint_4",
				nextIndex: "uint_4",
				isDeleted: "uint_1"
			}

			so offset to isDeleted:
			4 + 4 + 4
		*/
		var metadataExtraOffset = 4 + 
			4 + 4;
		fileHandle = (await writeBytesToFile(
			file,
			offset + metadataExtraOffset,
			{uint_1: 1}
		))?.file;
		
		deleted++;

	}
	
	var offsetToGetToFree = 2;
	var currentFreeBlock = await readBytesFromFile(
		fileHandle, 
		magic +
		offsetToGetToFree, {
			nextFreeBlock: "uint_4"
		}
	);
	currentFreeBlock = currentFreeBlock?.nextFreeBlock;
	if(currentFreeBlock) {
		/*
			if we already have a free block,
			then make the nextBlockId of the LAST
			block of this chain 
			(which should be nothing, 
			because it's at the end of the chain)

			to the nextFreeBlock. This way,
			when we later look for new free blocks,
			after reaching the end of this chain,
			we will continue to the previous chain
			and so on.
		*/
		var lastBlockOfChainID = allBlockIDs[
			allBlockIDs.length - 1
		];
		var {
			offset: lastBlockOfThisChainOffset
		} = await getBlockOffsetFromId({
			fileHandle,
			blockId: lastBlockOfChainID,
			superBlock
		});
		var offsetToNextBlockOfLastInChain = 
			lastBlockOfThisChainOffset + 
			4/*index*/ +
			4 /*lastBlockId*/
			/*nextBlocKId (uint_4) here*/;
		var wrote = await writeBytesToFile(
			fileHandle,
			offsetToNextBlockOfLastInChain,
			{uint_4: currentFreeBlock}
		);
		fileHandle = wrote.file;
	}
	fileHandle = (await writeBytesToFile(
		fileHandle,
		magic + 
		offsetToGetToFree, [
			{uint_4: allBlockIDs[0]} /*
				setting next
				free block to the 
				first block of this chain
			*/
		]
	)).file;
	
	superBlock.nextFreeBlock = allBlockIDs[0]
	var offsetToUsed = 2  +
		4 + 4 + 4
	var sup = await readBytesFromFile(
		fileHandle,
		magic + offsetToUsed,
		{
			usedBlocks: "uint_4",
			deletedBlocks: "uint_4"
		}
	)
	
	if(sup.usedBlocks > 0) {
		sup.usedBlocks--;
	}
	sup.deletedBlocks += deleted;
	var usedWrite = await writeBytesToFile(
		fileHandle,
		magic + offsetToUsed, [
			{uint_4: sup.usedBlocks},
			{uint_4: sup.deletedBlocks}
		]
	)
	fileHandle  = usedWrite.file;
	file = fileHandle;
	
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
	});
	file = del.file;
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

// Reads a folder from the simulated database file.
// Always starts by reading the root block (ID 1) and then walks down the folder structure.
// If withValues is true, returns an object mapping folder/file names to block IDs;
// otherwise, returns just an array of names.
async function readFolder({
	file,
	path,
	name,
	withValues = false
}) {
	path = normalizePath(path);
	if(!name) {
	//	name = path.pop();
	}
	// Always start with the root block.
	let block = await readBlock({
		file,
		blockId: 1,
		metadata: false
	});
	let data = block.data;
	

	if (!awtsmoosJSON
		.isAwtsmoosObject(data)) {
		return data
	}

	// Deserialize the binary folder data.
	let folderObj = (data);

	// If no further path is provided, return the entire object.
	if (!path.length) {
		return withValues ?
			awtsmoosJSON
			.deserializeBinary(folderObj) : 
			
			awtsmoosJSON.getKeysFromBinary(
				folderObj
			)
	}

	// Traverse the folder structure down the given path.
	for (let segment of path) {
		var segmentInFolder = 
			awtsmoosJSON
			.getValueByKey(folderObj, segment)
		if (!segmentInFolder)
			return null; // Folder not found.
		let blockId = segmentInFolder;
		block = await readBlock({
			file,
			blockId,
			metadata: false
		});
		data = block.data;
	
		if (!awtsmoosJSON
			.isAwtsmoosObject(data)
		) {
			return null
		}
		folderObj = 
				data
	}

	return withValues ? awtsmoosJSON
		.deserializeBinary(folderObj) :
		awtsmoosJSON.getKeysFromBinary(
			folderObj
		) 
}

// Helper: Given a path array (e.g. ["hi", "there"]), returns the block ID
// of the folder identified by that path. If the path is empty, returns 1 (root).
async function getFolderBlockId(file,
	pathArray) {
	if (!pathArray.length)
		return 1; // Root folder.
	// For a single-level path (e.g. ["hi"]), the parent is the root.
	if (pathArray.length === 1) {
		let rootFolder =
			await readFolder({
				file,
				path: "/",
				withValues: true
			});
		return rootFolder ?
			rootFolder[pathArray[
				0]] || null : null;
	} else {
		// For deeper paths, the parent folder is the one one level up.
		let parentPath = pathArray
			.slice(0, pathArray
				.length - 1);
		let parentFolder =
			await readFolder({
				file,
				path: parentPath
					.join("/"),
				withValues: true
			});
		return parentFolder ?
			parentFolder[pathArray[
				pathArray
				.length - 1]] ||
			null : null;
	}
}

// Recursively create a folder in the virtual file system.
// 'path' is the folder path in which to create a new folder named 'name'.
// For example, if path is "/hi/there" and name is "wow", then "wow" is created inside folder "there".
// Missing intermediate folders are created along the way.
async function makeFolder({
	file,
	path,
	name
}) {
	path = normalizePath(path);
	if(!name) {
		name = path.pop();
	}


	// If path is empty, then we're writing directly to root.
	if (!path.length) {
		await writeDataAtNextBlock({
			file,
			parentFolderId: 1,
			name
		});
		return;
	}

	// Walk the path, creating intermediate folders as needed.
	let
		currentPath = []; // Empty means we're at the root.
	for (let segment of path) {
		currentPath.push(segment);
		// Try to read the folder at the currentPath.
		let folder =
			await readFolder({
				file,
				path: currentPath
					.join("/"),
				withValues: true
			});
		// If folder doesn't exist, create it.
		if (!folder) {
			let parentId =
				currentPath
				.length === 0 ? 1 :
				await getFolderBlockId(
					file,
					currentPath
					.slice(0,
						currentPath
						.length));
			await writeDataAtNextBlock
				({
					file,
					parentFolderId: parentId,
					name: segment
				});
		}
	}

	// Now, create the target folder inside the final folder in the given path.
	let parentId =
		await getFolderBlockId(file,
			path);
	await writeDataAtNextBlock({
		file,
		parentFolderId: parentId,
		name
	});
}

async function deleteFolder({
	file/*the database file handle*/,
	path,/*path of (emulated) folder to delete minus the name*/
	name/*name of folder. if null defaults to last
		element of path*/
}) {
	path = normalizePath(path);//makes array out of path str
	if(!name) {
		name = path.pop();
	}
	/**
	 * to delete an entry:
	 * var folderBlock = await readBlock({
	 * 	file,
	 * 	blockId,/*in our case the startting block* /
	 * //opitional:set metadata=true
	 * to just get metadata like type etc.
	 * })
	 * 
	 * can use folderBlock.metadata.type
	 * 0 is folder 1 is file;
	 * 
	 * var del = await deleteEntry({
			file,
			blockId: folderId,
			superBlock,
			allBlockIDs: folderBlock
				.allBlockIDs
		});


		but in this function it need sto read the
		folder like 

		await readFolder({
			file,
			path: parentPath
				.join("/"),
			withValues: true
		});

		if with Values then it returns an object
		with the keys being its children
		(files / folders) and the values
		being the block IDs where they start


		so in our case we need to recursively 
		go through each of the children of the folder
		and read the block of it with just metadata.
		if its a folder, then first get all of its
		data (with readBlock again without metadata) 
		then call deleteEntry on the folder.
		then loop through its hcildren and recursively
		do it.

		If it's a .metadata.type == 1 (file) then
		just deleteEntry on it
	 */

	// Invoke the ancient function to read the parent's folder listing, drawing forth its hidden children.
	const parentFolder = await readFolder({
		file,
		path: parentPath.join("/"),
		withValues: true
	});
	
	// Seek the folder's block ID among the parent's children—a whisper in the dark.
	const folderBlockID = parentFolder[name];
	if (folderBlockID === undefined) {
		throw new Error("Folder not found: " + name);
	}
	
	// Delve into the folder’s inner sanctum to unveil its spectral contents.
	const folderContents = await readFolder({
		file,
		path: [...parentPath, name].join("/"),
		withValues: true
	});
	
	// For every child—every fragile memory and digital echo—we invoke the recursive ritual.
	for (const child in folderContents) {
		const childBlockID = folderContents[child];
		
		// Read the metadata, the lifeblood that reveals whether the child is a folder of hidden realms or a mere file.
		const childBlock = await readBlock({
			file,
			blockId: childBlockID,
			metadata: true
		});
		
		if (childBlock.metadata.type === 0) { // A folder pulsating with untold secrets.
			await deleteFolder({
				file,
				path: [...parentPath, name, child],
				name: child
			});
		} else if (childBlock.metadata.type === 1) { // A file—a solitary memory in the void.
			const childBlockFull = await readBlock({
				file,
				blockId: childBlockID,
				metadata: false
			});
			await deleteEntry({
				file,
				blockId: childBlockID,
				allBlockIDs: childBlockFull.allBlockIDs
			});
		}
	}
	
	// At last, when the children have been reduced to mere echoes, delete the folder itself.
	const fullFolderBlock = await readBlock({ file, blockId: folderBlockID });
	await deleteEntry({
		file,
		blockId: folderBlockID,
		allBlockIDs: fullFolderBlock.allBlockIDs
	});
}

// Recursively create a file in the virtual file system.
// 'path' is the folder path in which to create the file.
// For example, if path is "/hi/there" and name is "file.txt", then the file is created inside folder "there".
// Missing intermediate folders are created along the way.
async function makeFile({
	file,
	path = null,
	name,
	data = ""
} = {}) {
	path = normalizePath(path);
	if(!name) {
		name = path.pop();
	}
	if (
		path === null ||
		typeof name !== "string"
	)
		return null;
	
	// If path is empty, then the file is created in the root folder.
	if (!path.length) {
		await writeDataAtNextBlock({
			file,
			parentFolderId: 1,
			name,
			data
		});
		return;
	}

	// Walk the folder path, ensuring that each folder exists.
	let currentPath = [];
	for (let segment of path) {
		currentPath.push(segment);
		let folder =
			await readFolder({
				file,
				path: currentPath
					.join("/"),
				withValues: true
			});
		if (!folder) {
			let parentId =
				currentPath
				.length === 0 ? 1 :
				await getFolderBlockId(
					file,
					currentPath
					.slice(0,
						currentPath
						.length));
			await writeDataAtNextBlock
				({
					file,
					parentFolderId: parentId,
					name: segment
				});
		}
	}

	// Create the file in the final folder.
	let parentId =
		await getFolderBlockId(file,
			path);
	await writeDataAtNextBlock({
		file,
		parentFolderId: parentId,
		name,
		data
	});
}

// Reads a file from the virtual file system.
// The file is looked up by traversing the folder structure specified by 'path',
// and then finding the file with the given 'name' in that folder.
async function readFile({
	file,
	path = null,
	name,
	isString=true
} = {}) {
	path = normalizePath(path);
	if(!name) {
		name = path.pop();
	}
	if (
		path === null ||
		typeof name !== "string"
	)
		return null;
	
	// Get the folder (with its children mapping) where the file should reside.
	let folder = await readFolder({
		file,
		path: path.join(
			"/"
		),
		withValues: true
	});
	if (!folder || !(name in
			folder
	)
	) return null;
	let fileBlockId = folder[name];
	let block = await readBlock({
		file,
		blockId: fileBlockId,
		metadata: false
	});

	
	return isString ? block.data.toString()
		:block.data;
}

async function deleteFile({
	file,
	path,
	name
}) {
	path = normalizePath(path);
	if(!name) {
		name = path.pop();
	}
	if (
		path === null ||
		typeof name !== "string"
	)
		return null;
	
	// Get the folder (with its children mapping) where the file should reside.
	let folder = await readFolder({
		file,
		path: path.join(
			"/"
		),
		withValues: true
	});
	if (!folder || !(name in
			folder
	)
	) return null;
	let fileBlockId = folder[name];
	const childBlockFull = await readBlock({
		file,
		blockId: fileBlockId,
		metadata: false
	});
	return await deleteEntry({
		file,
		blockId: childBlockID,
		allBlockIDs: childBlockFull.allBlockIDs
	});
}

async function stat({
	file,
	path,
	name
}) {
	path = normalizePath(path);
	if(!name) {
		name = path.pop();
	}
	if (
		path === null ||
		typeof name !== "string"
	)
		throw Error("No name provided")

	let folder = await readFolder({
		file,
		path: path.join(
			"/"
		)
	});
	if(folder === null) {
		console.log("HAS NU:L",path);
		throw Error("Not found")
	}
	var keys = Object.keys(folder);
	console.log("KEY",folder,folder.length,folder+"",typeof(folder),"fold");
	if (!folder || !(name in
			folder
		)
	) throw Error ("Not found file");
	let entryBlockId = folder[name];
	var entryMeta = await readBlock({
		file,
		blockId: entryBlockId,
		metadata:true
	});
	var type = entryMeta.metadata.type == 0 ?
		"folder" : "file";
	return {
		type
	};
}

module.exports = {

    setupEmptyFilesystem,
	readBlock,
	makeFolder,
	makeFile,
	readFolder,
	readFile,

	deleteFile,
	deleteFolder,
	stat
}
