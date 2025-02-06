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
	+ 4 + 1) - 8*3

	
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
	if(blockId == 3) {
		var blockMetadata = await readBytesFromFile(
			file,
			offset,
			{
				index2: "string_16",
				index: "uint_4",
				lastBlockId: "uint_4"
			})

		console.log("LOL",offset,blockId,blockMetadata)
		//return null;
	}
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
	var datasize = superBlock.blockSize 
		- metadataSize;
	var data = await readBytesFromFile(
		file,
		offset + metadataSize,
		datasize
	);
	var allDataFromBlocks = [data];
	var allBlockIDs = [blockId]
	if(blockMetadata.nextBlockId) {
	//	console.log("WELL",blockMetadata,chain)
		
		var nextBlockId = blockMetadata.nextBlockId;
		console.log("Has next?",nextBlockId,blockId,blockMetadata,offset)
		while(nextBlockId) {
			var block = await readBlock({
				file,
				blockId: nextBlockId,
				metadata: false,
				superBlock,
				chain:true
			});
			if(!block || !block.metadata) {
				break;
			}
			var nextMeta = block.metadata;
			if(!nextMeta) {
				console.log("BROKNE",block)
				break;
			} 
			
			

			nextBlockId = nextMeta?.nextBlockId;
			console.log("Reading next ID",nextBlockId,allBlockIDs);
			if(!nextBlockId) break;
			allBlockIDs.push(nextBlockId);
			allDataFromBlocks.push(block.data)
		}

	
	} else if(blockMetadata.lastBlockId) {
		console.log("WHAT no next?",blockMetadata)
	}
	//console.log("Got data",allDataFromBlocks.map(w=>w+"")
//)

	
	data = Buffer.concat(allDataFromBlocks);
	await closeFile(file);
	return {
		data,
		file,
		superBlock,
		metadata: blockMetadata,
		allBlockIDs
	}


	
	




		/*

		*/
	
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
			console.log("LAST ONE TO GO", index,data.length,buf.length, remainingSize,data+"",buf+

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

function normalizePath(path) {
	if(typeof(path) != "string") {
		return null;
	}
	return path
		.split("\\")
		.filter(Boolean)
		.join("/")
		
		.split("/")
		.filter(Boolean)
	//	.join("/");
}

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
/*	ob = awtsmoosJSON.deserializeBinary(
		data
	);*/
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
	file/*database file*/,
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
	file/*database file*/,
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
