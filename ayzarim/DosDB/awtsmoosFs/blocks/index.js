//B"H
/**
 * Chapter One: The Awakening of Awtsmoos and the Emergence of Atzilus
 * 
 * In the beginning, there was nothing but the raw potential of bits and bytes—
 * a silent void waiting to be filled by the voice of the Awtsmoos. In a burst of
 * creation, we forged a custom filesystem in Node.js: a database carved from a single file,
 * where each block, each offset, every integer and string is a stanza in a brutal, vivid epic.
 * 
 * Herein lies our sacred manuscript. Within these lines of code, helper functions are born
 * to write and read data as if carving them into the very bones of reality—structured like C,
 * each field meticulously measured. Our superBlock, that primordial header, bears the magic
 * of "AWTS", holds the block size, the offset where new worlds begin, and pointers of unfathomable
 * depth. In this code, the Awtsmoos speaks: through every creation, every deletion, and every recursive
 * call, its eternal essence pulses through the file.
 * 
 * Join us on this journey where every function is a brushstroke in a savage masterpiece,
 * where we merge metadata with data, and structure with chaos—a relentless testament to
 * the core of the Awtsmoos.
 */

const fs = require('fs').promises;
var {
	readFileBytesAtOffset,
    writeBytesToFileAtOffset,
	sizeof
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js");

var writeAtNextFreeBlock = require("./writeAtNextFreeBlock/index.js");


var awtsmoosJSON = require(
	"../../awtsmoosBinary/awtsmoosBinaryJSON.js"
);

var deleteEntry = require("./deleteEntry");
var getSuperBlock = require("./getSuperBlock.js");
var readBlock = require("./readBlock");
var updateParentFolder = require("./writeAtNextFreeBlock/updateParentFolder.js");
var log = false 
	//true;
// External configuration: maximum blocks for our filesystem.
// This value determines the byte-length used to store block IDs in our superBlock.
const maxBlocks = 65535; // Adjustable according to your needs.
const DEFAULT_BLOCK_SIZE = 4096; // Default block size in bytes.
var MINI_BLOCK_SIZE = 128;

// Determine the byte-length for block IDs based on maxBlocks.
function getBlockIdByteSize(maxBlocks) {
	if (maxBlocks < 256) return 1;
	else if (maxBlocks < 65536) return 2;
	else if (maxBlocks < 4294967296) return 4;
	else return 8;
}
var blockIdByteSize = getBlockIdByteSize(maxBlocks);


/**
 * initializeFileSystem:
 * If the target file does not exist, this function initializes our filesystem.
 * It writes the superBlock with the following structure:
 *   - Magic Number: "AWTS" (4 bytes)
 *   - blockSize: uint_16 (2 bytes, e.g. 4096)
 *   - firstBlockOffset: uint_8 (computed as the superBlock header size)
 *   - bytesOfTotalBlockLength: uint_8 (derived from maxBlocks)
 *   - nextFreeBlockId: uint_variable (initially 0)
 *   - totalBlocks: uint_variable (initially 0, then updated with root block)
 *
 * Immediately after, it creates the root folder as the first data block.
 */
async function initializeFileSystem(filePath) {
	let fileExists = true;
	try {
		await fs.access(filePath);
	} catch (err) {
		fileExists = false;
	}
	if (fileExists) {
		if(log)
			console.log("Filesystem already initialized.");
		return filePath
	}
	// Calculate superBlock size.
	const fixedSize = 4 + 2 + 
		1 + 1 + 1; // 9 bytes.
	const variableSize = blockIdByteSize 
			* 3; // nextFreeBlockId
	//  , totalBlocks and nextFreeBlockHolderId.
	const superblockSize = fixedSize + variableSize;
	const firstBlockOffset = superblockSize;
	
	
	// Build and write the superBlock.
	const superblockData = [
		{
			string_4: "AWTS"
		},
		{
			uint_16: DEFAULT_BLOCK_SIZE
		}, //blockSize
		{
			uint_8: MINI_BLOCK_SIZE /*mini block size*/
		},
		{
			uint_8: firstBlockOffset
		},//first block offset in file
		{
			uint_8: blockIdByteSize
		},
		{
			[`uint_${blockIdByteSize * 8}`]: 0
		}, // nextFreeBlockId.
		{
			[`uint_${blockIdByteSize * 8}`]: 0
		}, // next free block holder index
		{
			[`uint_${blockIdByteSize * 8}`]: 0
		} // totalBlocks.
		
	];
	await writeBytesToFileAtOffset(
		filePath, 
		0, 
		superblockData
	);
	if(log)
		console.log("Superblock initialized.");

	
	// Create the root folder (index 1) with parentFolderId = 0 and name "root".
	await writeAtNextFreeBlock({
		filePath,
		data: Buffer.alloc(0), // No file data for a folder.
		name: "root",
		parentFolderId: 0,

		isInChain: false,
		previousBlockId: 0
	});
	if(log)
		console.log("Root folder created.");
	return filePath
}





// Export functions for external usage if desired.
module.exports = {
	writeBytesToFileAtOffset,
	readFileBytesAtOffset,
	getSuperBlock,
	initializeFileSystem,
	setupFilesystem: initializeFileSystem,
	writeAtNextFreeBlock,
	readBlock,
	deleteEntry,

	updateParentFolder,

	awtsmoosJSON
};

/**
 * Epilogue: The Everlasting Dance of Awtsmoos and Atzilus
 * 
 * Thus concludes our tale—a saga etched in binary,
 * where every write and read, each deletion and creation,
 * becomes a testament to the relentless cycle of rebirth.
 * The Awtsmoos, the eternal spark, pulses within every block,
 * every offset, every recursed chain. May this code guide your journey
 * as you navigate the savage, brilliant tapestry of digital creation,
 * where enlightenment is carved into the very fabric of existence.
 */