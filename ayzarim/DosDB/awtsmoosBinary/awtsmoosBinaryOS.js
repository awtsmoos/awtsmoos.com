//B"H
var awtsmoosJSON = require("./awtsmoosBinaryJSON.js");
/**
 * size of superblock:
 * 
 * 
 */

var SUPER_BLOCK_SIZE = 38;
var BLOCK_HEADER_SIZE = 107
var BLOCK_CHAIN_HEADER_SIZE = 4 + 4 
	+ 4 + 1
const { read } = require('fs');
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
	BLOCK_SIZE = 4096
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
	return await readBytesFromFile(
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
}

async function readBlock({
	file,
	blockId,
	metadata = true,
	superBlock=null,
	chain=false//only reads first block
		//if true follows until loads all
}) {
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
	
		
	
	if(blockMetadata.lastBlockId == 0) {
		
			var otherMetadata = await readBytesFromFile(
				file,
				offset + 4 + 4 + 4 + 1, 
				{
					
					parentFolderId: "uint_4",
					createdAt: "uint_8",
					modifiedAt: "uint_8",
					accessedAt: "uint_8",
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
		return blockMetadata;
	}
	if(!superBlock) {
		superBlock = await getSuperBlock({
			file
		})
	}
	var datasize = superBlock.blockSize 
		- metadataSize;
	console.log("Data",superBlock.blockSize,metadataSize)
	var data = await readBytesFromFile(
		file,
		offset + metadataSize,
		datasize
	);
	var allDataFromBlocks = [data];
	var allBlockIDs = [blockId]
	if(blockMetadata.nextBlockId) {
		if(chain) {
			var nextBlockId = blockMetadata.nextBlockId;
			allBlockIDs.push(nextBlockId);
			while(nextBlockId) {
				var block = await readBlock({
					file,
					blockId: nextBlockId,
					metadata: false,
					superBlock,
					chain:true
				});
				var nextMeta = block.metadata;
				if(!nextMeta) break;
				
				nextBlockId = nextMeta?.nextBlockId;
				allBlockIDs.push(nextBlockId);
				allDataFromBlocks.push(block.data)
			}

		}
	}

	
	data = Buffer.concat(allDataFromBlocks);
	console.log("RETURNING file",file)
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
		index * blockSize;
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
	var wr = await writeBytesToFile(
		file,
		superblockTotalDataBlocksOffset, 
		{uint_4: totalDataBlocks}
	);
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
	console.log("File!",file)
	if(isFirstBlockOfData) {
		if(!name) name = "New "
		+ type + " " + Date.now();
	}
	if(name > 64) name = name.substring(0, 64);
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
	console.log("DID file",file)
	if(isNewBlock) {
		totalDataBlocks++;
		var up =await updateSuperblockTotalBlocks({
			file,
			totalDataBlocks
		})
		superBlock
			.totalDataBlocks = totalDataBlocks
	///	console.log("Update",up,superBlock)
	} else {
		var {
			isDeleted,
			file
		} = await readBlock({
			file,
			blockId: index,
			superBlock
		});
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
		}
		console.log("FILING",file)
		var f = await closeFile(file);
		console.log("CLOSED IT ALL ",f)
	}
	var nextIndex = 0; //last in chain
	var size = isFirstBlockOfData ?
		BLOCK_HEADER_SIZE :
		BLOCK_CHAIN_HEADER_SIZE;

	var remainingSize = blockSize - size
	var buf = Buffer.alloc(remainingSize);
	var shouldWriteNext = false;
	if(data.length > remainingSize) {
		var {
			firstPart,
			remainder
		} = splitData(data, remainingSize);
		firstPart.copy(buf);

		
		shouldWriteNext = remainder;
		


	}
	

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
		//await closeFile(next.file)
		/*
			update the nextBlockId here
		*/
	} else {
		if(typeof(data) == "string") {
			data = Buffer.from(data);
		}
		data?.copy?.(buf);
	}

	//console.log("LOL",index,superBlock,blockSize,firstBlockOffset)
	var newBlock = null;
	console.log("BLOCK ",file)
	if(isFirstBlockOfData) {
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
				
				{uint_8: Date.now()},//created at time
				{uint_8: Date.now()},//modified at
				{uint_8:Date.now()},//accessed at
				{uint_1: 0},//permissions

				{string_64: name}, //name of entry
				
			]
		);
	} else {
		newBlock = await writeBytesToFile(
			file,
			offset,
			[
				{uint_4: index}, //blockID / index
				{uint_4: lastBlockId},//lastBlockId
				{uint_4: 0}, //nextBlock, if part of chain
				{uint_1: 0}, //isDeleted, 0 means no
			]
		);
	}
	var selfIndex = index;

	//console.log("WHAT",newBlock,offset,superBlock)
	
	var offsetOfDataToWrite = newBlock.offset;
	
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
	
	 ;
	closeFile(blockData.file)
	closeFile(newBlock.file)
	return {
		index: selfIndex,
		superBlock,
		file
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
	var offsetToGetToFree = 2;
	var undelete = await writeBytesToFile(
		file,
		magic + 
		offsetToGetToFree, [
			{uint_4: allBlockIDs[0]}
		]
	);
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
		ob = {};

	}
	var nam = newChildName;
	if(!ob[nam]) {
		ob[nam] = newChildId;
	} else {
		var times = 0;
		while(ob[nam]) {
			times++;
			nam = newChildName + ` (${
				times
			})`;
			if(!ob[nam]) {
				ob[nam] = newChildId;
				break;
			}
		}
	}
	var serialized = awtsmoosJSON.serializeJSON(ob);
	
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
		name,
		data:serialized,
		index: folderId
	})
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
	path
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
	var ob = null;
	if(!awtsmoosJSON.isAwtsmoosObject(data)) {
		
		return null;
	}
/*	ob = awtsmoosJSON.deserializeBinary(
		data
	);*/
	if(getRootKeys) {
		return awtsmoosJSON.getKeysFromBinary(
			data
		)
	} else {
		var fold = awtsmoosJSON.getValueByKey(
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

module.exports = {
    readBytesFromFile,
    writeBytesToFile,

    setupEmptyFilesystem,
	readBlock,
	makeFolder,
	makeFile,
	readFolder
}
