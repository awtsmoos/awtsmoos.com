//B"H

const crypto = require('crypto');

const fs = require('fs')
	.promises;
var fsSync = require("fs");
var path = require("path");

// Global cache for open file handles. Keys are file paths; values are objects with handle and isClosed.
const openFileHandles = {};
const MAX_OPEN_FILES = 20;


function logBuffer(buffer, base = 10, columns = 8) {
	for(let i = 0; i < buffer.length; i += columns) {
		let offset = i.toString()
			.padStart(4, '0'); // Offset indicator
		let bytes = buffer.slice(i, i + columns)
			.map(byte => byte.toString(base)
				.padStart(3, ' '))
			.join(' ');
		console.log(`${offset}: ${bytes}`);
	}
}

function writeToBuffer(buffer, value, byteSize, offset) {
	for(let i = 0; i < byteSize; i++) {
		buffer.writeUInt8((value >> (8 * (byteSize - 1 - i))) & 0xFF, offset + i);
	}
}

function readFromBuffer(buffer, offset, size) {
	if(size === 1) {
		return buffer.readUInt8(offset);
	} else if(size === 2) {
		return buffer.readUInt16BE(offset);
	} else if(size === 4) {
		return buffer.readUInt32BE(offset);
	} else {
		throw new Error("Unsupported size: " + size);
	}
}



function sizeof(struct) {
	/**
	 * in format of
	 * key, value (number of bys)
	 */
	/*
	var bytes = 0;
	for(var [key, byteAmount] of Object.entries(struct)) {
		if(typeof(byteAmount) == "string") {
			byteAmount = byteAmount.length;
		} else if(Buffer.isBuffer(byteAmount)) {
			byteAmount = byteAmount.length;
		}
		if(typeof(byteAmount) == "number" && !isNaN(byteAmount))
			bytes += byteAmount;
		else {

		}
	}
	return bytes;*/
	var size = 0
	for(const obj of struct) {
		for(const key of Object.keys(obj)) {
			let match;
			if(match = key.match(/^uint_(\d+)$/)) {
				const bits = parseInt(match[1], 10);
				size += bits / 8;
			} else if(match = key.match(/^string_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				size += len;
			} else if(match = key.match(/^buffer_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				size += len;
			}
		}
	}
	return size;
}

function readUInt64BE(buf, offset = 0) {
	let low = buf.readUInt32BE(offset); // Read lower 32 bits
	let high = buf.readUInt32BE(offset + 4); // Read upper 32 bits
	
	return high * 0x100000000 + low; // Combine both 32-bit parts
}

function writeUInt64BE(buf, value, offset = 0) {
	if(value < 0 || value > Number.MAX_SAFE_INTEGER) {
		throw new RangeError("Value must be between 0 and 2^53-1");
	}
	
	let low = value % 0x100000000; // Lower 32 bits
	let high = Math.floor(value / 0x100000000); // Upper 32 bits
	
	buf.writeUInt32BE(low, offset); // Write lower 32 bits (4 bytes)
	buf.writeUInt32BE(high, offset + 4); // Write upper 32 bits (4 bytes)
}

function hasDecimal(num) {
	if(num % 1 !== 0) {
		return true
	} else {
		return false
	}
}


function needsDoublePrecision(num) {
	if(Math.fround(num) === num) {
		return false;
	} else {
		return true;
	}
}

async function readConditional(buffer, offset = 0) {
	var typeBuf = await buffer.readUInt8(offset);
	offset++;
	var size = 1;
	var am = null;
	switch(typeBuf) {
		case 0:
			
			am = await buffer.readUInt8(offset);
			offset++;
			
			break;
		case 1:
			am = await buffer.readUInt16BE(offset);
			offset += 2;
			size = 2
			break;
		case 2:
			am = await buffer.readUInt32BE(offset);
			offset += 4
			size = 4
			break;
		case 3:
			am = readUInt64BE(buffer, offset)
			offset += 8
			size = 8
			break;
		case 4:
			am = await buffer.readFloatBE(offset);
			offset += 4;
			size = 4
			break;
		case 5:
			am = await buffer.readDoubleBE(offset);
			offset += 8;
			size = 8
			break;
			
	}
	return {
		amount: am,
		offset,
		size
	}
}


function writeConditional(amount) {
	var offset = 0;
	var typeBuffer;
	var amountBuffer;
	var size = 1;
	if(hasDecimal(amount)) {
		if(needsDoublePrecision(amount)) {
			typeBuffer = Buffer.alloc(1);
			typeBuffer.writeUInt8(5);
			
			size = 8;
			amountBuffer = Buffer.alloc(8);
			amountBuffer.writeDoubleBE(amount, 0);
			
		} else {
			typeBuffer = Buffer.alloc(1);
			typeBuffer.writeUInt8(4);
			
			size = 4;
			amountBuffer = Buffer.alloc(4);
			amountBuffer.writeFloatBE(amount, 0);
		}
	} else if(amount < 256) {
		typeBuffer = Buffer.alloc(1);
		typeBuffer.writeUInt8(0);
		
		
		amountBuffer = Buffer.alloc(1);
		amountBuffer.writeUInt8(amount);
		
		
	} else if(amount >= 256 && amount < 65536) {
		typeBuffer = Buffer.alloc(1);
		typeBuffer.writeUInt8(1, 0);
		
		size = 2;
		amountBuffer = Buffer.alloc(2);
		amountBuffer.writeUInt16BE(amount, 0);
		
		
	} else if(amount >= 65536 && amount <= 4294967296) {
		typeBuffer = Buffer.alloc(1);
		typeBuffer.writeUInt8(2, 0);
		
		size = 4;
		amountBuffer = Buffer.alloc(4);
		amountBuffer.writeUInt32BE(amount, 0);
	} else if(
		amount >= 4294967296 && amount <= 18446744073709552000n
	) {
		typeBuffer = Buffer.alloc(1);
		typeBuffer.writeUInt8(3, 0);
		
		size = 8;
		amountBuffer = Buffer.alloc(8);
		writeUInt64BE(amountBuffer, amount, 0);
	}
	var buffer = Buffer.concat([
        typeBuffer,
        amountBuffer
    ])
	offset += buffer.length;
	return {
		buffer,
		offset,
		size
	}
}



function hashKey(key, size) {
	let hash = crypto.createHash('md5')
		.update(key)
		.digest();
	return hash.readUInt32BE(0) % size;
}

function writeBitAt(byte, index) {
	if(index < 0 || index > 7) {
		throw new Error('Index must be between 0 and 7');
	}
	
	// Set the bit at the specified index to 1
	return byte | (1 << index);
}



/**
 * @method ensureDirAwtsmoos
 * @description Ensures the directory exists for the file path, reflecting the Awtsmoos recreating structure from void.
 * @param {string} filePath - The path to ensure directory existence for.
 */
function ensureDirAwtsmoos(filePath) {
	if(typeof filePath !== 'string') return;
	try {
		const dir = path.dirname(filePath);
		fsSync.mkdirSync(dir, {
			recursive: true
		});
	} catch (e) {}
}

function getFileSize(OhrEinSofPath) {
	try {
		var stats = fsSync.statSync(OhrEinSofPath);
		return stats.size;
	} catch(e) {
		return 0;
	}
}
/**
 * @method getFileHandleKav
 * @description Retrieves a file handle, channeling the Kav of divine light into the operation.
 * @param {string} filePath - The path to the file.
 * @returns {object} - The file handle.
 */
function getFileHandleKav(filePath) {
	return getFileHandle(filePath);
}

/**
 * @method writeBytesToFileAtOffsetAwtsmoos
 * @description Writes structured binary data at a specified offset, infused with the Awtsmoos’ constant recreation.
 *              If buffer is provided without byte size, uses its inherent length.
 * @param {string|object} filePath - The file path or config object {filePath, offset, schema}.
 * @param {number} [offset] - The offset to write at.
 * @param {Array<object>} [dataArray] - Array of data objects with type keys.
 * @returns {object} - Metadata about the write operation: size, fileHandle, data.
 */
async function writeBytesToFileAtOffset(filePath, offset, dataArray) {
	// The Awtsmoos rips reality apart, recreating ALL from NOTHING every instant, the Ohr Ein Sof flowing through Atzilus.
	let AwtsmoosConfig = typeof filePath === 'object' ? filePath : {
		filePath,
		offset,
		schema: dataArray
	};
	const {
		filePath: OhrEinSofPath,
		offset: KavOffset,
		schema: AtzilusData
	} = AwtsmoosConfig;
	
	let totalLengthAwtsmoos = 0;
	const writeInstructionsAtzilus = [];
	const writtenDataOhr = [];
	
	for(const obj of AtzilusData) {
		for(const key of Object.keys(obj)) {
			let value = obj[key];
			let typeMatch;
			
			if(key === 'buffer' && Buffer.isBuffer(value)) {
				const bufferLength = value.length; // Awtsmoos determines length from the buffer itself.
				totalLengthAwtsmoos += bufferLength;
				writeInstructionsAtzilus.push({
					type: 'buffer',
					size: bufferLength,
					value
				});
				writtenDataOhr.push(value);
			} else if(typeMatch = key.match(/^uint_(\d+)$/)) {
				const bitSize = parseInt(typeMatch[1], 10);
				const byteSize = bitSize / 8;
				totalLengthAwtsmoos += byteSize;
				writeInstructionsAtzilus.push({
					type: 'uint',
					size: byteSize,
					value
				});
				writtenDataOhr.push(value);
			} else if(typeMatch = key.match(/^string_(\d+)$/)) {
				const strLength = parseInt(typeMatch[1], 10);
				totalLengthAwtsmoos += strLength;
				writeInstructionsAtzilus.push({
					type: 'string',
					size: strLength,
					value
				});
				writtenDataOhr.push(value);
			} else if(typeMatch = key.match(/^buffer_(\d+)$/)) {
				const bufLength = parseInt(typeMatch[1], 10);
				totalLengthAwtsmoos += bufLength;
				if(!Buffer.isBuffer(value) || value.length !== bufLength) {
					throw new Error(`Buffer mismatch for ${key}: expected ${bufLength}, got ${value.length}`);
				}
				writeInstructionsAtzilus.push({
					type: 'buffer',
					size: bufLength,
					value
				});
				writtenDataOhr.push(value);
			} else {
				throw new Error(`Unsupported type: ${key}`);
			}
		}
	}
	
	const bufferAwtsmoos = Buffer.alloc(totalLengthAwtsmoos);
	let currentOffsetKav = 0;
	
	for(const instr of writeInstructionsAtzilus) {
		if(instr.type === 'uint') {
			if(instr.size === 1) bufferAwtsmoos.writeUInt8(instr.value, currentOffsetKav);
			else if(instr.size === 2) bufferAwtsmoos.writeUInt16BE(instr.value, currentOffsetKav);
			else if(instr.size === 4) bufferAwtsmoos.writeUInt32BE(instr.value, currentOffsetKav);
			else if(instr.size === 8) bufferAwtsmoos.writeBigUInt64BE(BigInt(instr.value), currentOffsetKav);
			currentOffsetKav += instr.size;
		} else if(instr.type === 'string') {
			const strBuf = Buffer.alloc(instr.size);
			const tempBuf = Buffer.from(instr.value, 'utf8')
				.subarray(0, instr.size);
			tempBuf.copy(strBuf);
			strBuf.copy(bufferAwtsmoos, currentOffsetKav);
			currentOffsetKav += instr.size;
		} else if(instr.type === 'buffer') {
			instr.value.copy(bufferAwtsmoos, currentOffsetKav);
			currentOffsetKav += instr.size;
		}
	}
	
	ensureDirAwtsmoos(OhrEinSofPath);
	const handleAtzilus = getFileHandleKav(OhrEinSofPath);
	handleAtzilus.write(bufferAwtsmoos, 0, totalLengthAwtsmoos, KavOffset);
	
	return {
		size: totalLengthAwtsmoos,
		fileHandle: handleAtzilus,
		data: writtenDataOhr
	};
}

/**
 * @method readFileBytesAtOffsetAwtsmoos
 * @description Reads structured binary data from a file, guided by the Awtsmoos. If buffer has no size, reads remainder.
 * @param {string|object} filePath - The file path or config object {filePath, offset, schema}.
 * @param {number} [offset] - The offset to read from.
 * @param {object} [schema] - The schema defining the data structure.
 * @returns {object} - The parsed data object.
 */
function readFileBytesAtOffset(filePath, offset, schema) {
	try {
		// The Awtsmoos recreates ALL from NOTHING, the infinite Ohr Ein Sof pulsing through every byte.
		let AwtsmoosConfig = typeof filePath === 'object' ? filePath : {
			filePath,
			offset,
			schema
		};
		const {
			filePath: OhrEinSofPath,
			offset: KavOffset,
			schema: AtzilusSchema
		} = AwtsmoosConfig;
		
		let totalLengthAwtsmoos = 0;
		const instructionsAtzilus = [];
		
		if(!AtzilusSchema || typeof AtzilusSchema !== 'object') throw new Error('Schema required');
		var stats = {size: 0};
		try {
			stats = fsSync.statSync(OhrEinSofPath);
		} catch(e) {
			return null;
		}

		
		if(KavOffset >= stats.size) {
			return null;
		}
		for(const key of Object.keys(AtzilusSchema)) {
			const typeString = AtzilusSchema[key];
			let typeMatch;
			
			if(typeString === 'buffer' && !typeString.match(/^buffer_\d+$/)) {

				
				var bufLength = Math.max(
					stats.size - KavOffset, 0
				); // Awtsmoos reads all remaining bytes.
				totalLengthAwtsmoos += bufLength;
				if(bufLength > 0) { 
					instructionsAtzilus.push({
						key,
						type: 'buffer',
						size: bufLength
					});
				}
			} else if(typeMatch = typeString.match(/^uint_(\d+)$/)) {
				const byteSize = parseInt(typeMatch[1], 10) / 8;
				totalLengthAwtsmoos += byteSize;
				instructionsAtzilus.push({
					key,
					type: 'uint',
					size: byteSize
				});
			} else if(typeMatch = typeString.match(/^string_(\d+)$/)) {
				const strLength = parseInt(typeMatch[1], 10);
				totalLengthAwtsmoos += strLength;
				instructionsAtzilus.push({
					key,
					type: 'string',
					size: strLength
				});
			} else if(typeMatch = typeString.match(/^buffer_(\d+)$/)) {
				const bufLength = parseInt(typeMatch[1], 10);
				totalLengthAwtsmoos += bufLength;
				instructionsAtzilus.push({
					key,
					type: 'buffer',
					size: bufLength
				});
			} else {
				throw new Error(`Unsupported schema type: ${typeString}`);
			}
		}
		
		const bufferAwtsmoos = Buffer.alloc(totalLengthAwtsmoos);
		const handleAtzilus = getFileHandleKav(OhrEinSofPath);
		handleAtzilus.read(bufferAwtsmoos, 0, totalLengthAwtsmoos, KavOffset);
		
		const resultOhr = {};
		let currentOffsetKav = 0;
		
		for(const instr of instructionsAtzilus) {
			if(instr.type === 'uint') {
				if(instr.size === 1) resultOhr[instr.key] = bufferAwtsmoos.readUInt8(currentOffsetKav);
				else if(instr.size === 2) resultOhr[instr.key] = bufferAwtsmoos.readUInt16BE(currentOffsetKav);
				else if(instr.size === 4) resultOhr[instr.key] = bufferAwtsmoos.readUInt32BE(currentOffsetKav);
				else if(instr.size === 8) resultOhr[instr.key] = Number(bufferAwtsmoos.readBigUInt64BE(currentOffsetKav));
				currentOffsetKav += instr.size;
			} else if(instr.type === 'string') {
				resultOhr[instr.key] = bufferAwtsmoos.subarray(currentOffsetKav, currentOffsetKav + instr.size)
					.toString('utf8')
					.replace(/\0/g, '');
				currentOffsetKav += instr.size;
			} else if(instr.type === 'buffer') {
				resultOhr[instr.key] = bufferAwtsmoos.subarray(currentOffsetKav, currentOffsetKav + instr.size);
				currentOffsetKav += instr.size;
			}
		}
		
		return resultOhr;
	} catch(e) {
		return null;
	}
}

global.openFileHandles = openFileHandles;


function getFileHandle(filePath) {
	if(!filePath) {
		console.trace("No file path provided");
		return;
	}
	if(openFileHandles[filePath] && !openFileHandles[filePath].isClosed) {
		return openFileHandles[filePath];
	}
	
	let handle;
	try {
		handle = fsSync.openSync(filePath, 'r+');
	} catch (err) {
		try {
			
			
			ensureDirAwtsmoos(filePath);
			handle = fsSync.openSync(filePath, 'w');
			fsSync.writeFileSync(filePath, " ");
			fsSync.closeSync(handle)
			handle = fsSync.openSync(filePath, "r+")
		} catch (e) {
			console.log("Trying\n\n\n", filePath);
			console.log("Issue", e);
		}
	}
	
	var keys = Object.keys(openFileHandles);
	if(keys.length > MAX_OPEN_FILES) {
		try {
			var last = keys[keys.length - 1];
			try {
				fsSync.closeSync(
					openFileHandles[last].handle
				)
			} catch (e) {}
			delete openFileHandles[last];
		} catch (e) {}
	}
	
	// Create a custom file handle object that includes a .write method
	const customHandle = {
		handle,
		isClosed: false,
		write: function(buffer, offset = 0, length = buffer.length, position = null) {
			return fsSync.writeSync(this.handle, buffer, offset, length, position);
		},
		
		read: function(buffer, offset = 0, length = buffer.length, position = null) {
			return fsSync
				.readSync(this.handle, buffer, offset, length, position);
		},
		
		close: function() {
			this.isClosed = true;
			fsSync.closeSync(this.handle);
		}
	};
	
	openFileHandles[filePath] = customHandle;
	
	return customHandle;
}

function stat(filePath) {
	var handle = getFileHandle(filePath);
	try {
		return fsSync.fstatSync(handle.handle);
	} catch (e) {
		null
	}
}

module.exports = {
	logBuffer,
	
	stat,
	
	readFileBytesAtOffset,
	writeBytesToFileAtOffset,
	
	getFileHandle,
	
	needsDoublePrecision,
	hasDecimal,
	writeUInt64BE,
	readUInt64BE,
	
	writeConditional,
	readConditional,
	
	readFromBuffer,
	writeToBuffer,
	
	writeBitAt,
	
	
	sizeof,
	
	
	
	hashKey,
	getFileSize
}