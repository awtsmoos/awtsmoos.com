//B"H
var {
    getFileHandle
} = require("../../awtsmoosBinary/awtsmoosBinaryHelpers.js");
module.exports = 

/**
 * getSuperBlock:
 * Reads the superblock—the primordial header of our filesystem—from the file.
 * Its structure is as follows:
 *   - Magic Number (4 bytes): "AWTS"
 *   - blockSize (uint_16): e.g., 4096
 *   - firstBlockOffset (uint_8): where data blocks begin
 *   - bytesOfTotalBlockLength (uint_8): the byte-length used for block IDs
 *   - nextFreeBlockId (uint_variable): pointer to the next free block
 *   - totalBlocks (uint_variable): count of blocks allocated
 *   - nextFreeMiniBlockHolderId (uint_variable) reference to the next block that can 
 * 			hold miniblocks.
 */
async function getSuperBlock(filePath) {
	// Read the fixed portion: 4 + 2 + 1 + 1 = 8 bytes.
	const fixedSize = 8;
	const handle = await getFileHandle(filePath);
	const fixedBuffer = Buffer.alloc(fixedSize);
	await handle.read(fixedBuffer, 0, fixedSize, 0);

	const magic = fixedBuffer.subarray(0, 4).toString('utf8');
	const blockSize = fixedBuffer.readUInt16BE(4);
	const firstBlockOffset = fixedBuffer.readUInt8(6);
	const bytesOfTotalBlockLength = fixedBuffer.readUInt8(7);

	// Read the variable part: nextFreeBlockId and totalBlocks.
	const variableSize = bytesOfTotalBlockLength * 2;
	const varBuffer = Buffer.alloc(variableSize);
	await handle.read(varBuffer, 0, variableSize, fixedSize);
	let nextFreeBlockId, totalBlocks;
	if (bytesOfTotalBlockLength === 1) {
		nextFreeBlockId = varBuffer.readUInt8(0);
		totalBlocks = varBuffer.readUInt8(1);
	} else if (bytesOfTotalBlockLength === 2) {
		nextFreeBlockId = varBuffer.readUInt16BE(0);
		totalBlocks = varBuffer.readUInt16BE(2);
	} else if (bytesOfTotalBlockLength === 4) {
		nextFreeBlockId = varBuffer.readUInt32BE(0);
		totalBlocks = varBuffer.readUInt32BE(4);
	} else if (bytesOfTotalBlockLength === 8) {
		nextFreeBlockId = Number(varBuffer.readBigUInt64BE(0));
		totalBlocks = Number(varBuffer.readBigUInt64BE(8));
	} else {
		throw new Error(`Unsupported block ID byte size in superBlock: ${bytesOfTotalBlockLength}`);
	}

	return {
		magic,
		blockSize,
		firstBlockOffset,
		blockIdByteSize: bytesOfTotalBlockLength,
		nextFreeBlockId,
		totalBlocks
	};
}