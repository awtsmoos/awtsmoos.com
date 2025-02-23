//B"H

const crypto = require('crypto');

const fs = require('fs').promises;

// Global cache for open file handles. Keys are file paths; values are objects with handle and isClosed.
const openFileHandles = {};
const MAX_OPEN_FILES = 20;


function logBuffer(buffer, base = 10, columns = 8) {
    for (let i = 0; i < buffer.length; i += columns) {
        let offset = i.toString().padStart(4, '0'); // Offset indicator
        let bytes = buffer.slice(i, i + columns)
                          .map(byte => byte.toString(base).padStart(3, ' '))
                          .join(' '); 
       console.log(`${offset}: ${bytes}`);
    }
}

function writeToBuffer(buffer, value, byteSize, offset) {
    for (let i = 0; i < byteSize; i++) {
        buffer.writeUInt8((value >> (8 * (byteSize - 1 - i))) & 0xFF, offset + i);
    }
}

function readFromBuffer(buffer, offset, size) {
    if (size === 1) {
        return buffer.readUInt8(offset);
    } else if (size === 2) {
        return buffer.readUInt16BE(offset);
    } else if (size === 4) {
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
    for (const obj of struct) {
		for (const key of Object.keys(obj)) {
			let match;
			if (match = key.match(/^uint_(\d+)$/)) {
				const bits = parseInt(match[1], 10);
				size += bits / 8;
			} else if (match = key.match(/^string_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				size += len;
			} else if (match = key.match(/^buffer_(\d+)$/)) {
				const len = parseInt(match[1], 10);
				size += len;
			}
		}
	}
    return size;
}

function readUInt64BE(buf, offset = 0) {
    let low = buf.readUInt32BE(offset);       // Read lower 32 bits
    let high = buf.readUInt32BE(offset + 4);  // Read upper 32 bits

    return high * 0x100000000 + low; // Combine both 32-bit parts
}

function writeUInt64BE(buf, value, offset = 0) {
    if (value < 0 || value > Number.MAX_SAFE_INTEGER) {
        throw new RangeError("Value must be between 0 and 2^53-1");
    }

    let low = value % 0x100000000; // Lower 32 bits
    let high = Math.floor(value / 0x100000000); // Upper 32 bits

    buf.writeUInt32BE(low, offset);      // Write lower 32 bits (4 bytes)
    buf.writeUInt32BE(high, offset + 4); // Write upper 32 bits (4 bytes)
}

function hasDecimal(num) {
    if (num % 1 !== 0) {
        return true
    } else {
        return false
    }
}


function needsDoublePrecision(num) {
    if (Math.fround(num) === num) {
        return false;
    } else {
        return true;
    }
}

async function readConditional(buffer, offset=0) {
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
            offset+=2;
            size = 2
        break;
        case 2:
            am = await buffer.readUInt32BE(offset);
            offset+=4
            size = 4
        break;
        case 3:
            am = readUInt64BE(buffer,offset)
            offset+=8
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
    offset +=  buffer.length;
    return {buffer, offset, size}
}



function hashKey(key, size) {
    let hash = crypto.createHash('md5').update(key).digest();
    return hash.readUInt32BE(0) % size;
}

function writeBitAt(byte, index) {
    if (index < 0 || index > 7) {
        throw new Error('Index must be between 0 and 7');
    }

    // Set the bit at the specified index to 1
    return byte | (1 << index);
}




/**
 * writeBytesToFileAtOffset:
 * A helper function to write structured binary data at a specified file offset.
 * The data parameter is an array of objects. Each object represents a C-like structure,
 * where keys denote type and fixed length. Supported types include:
 *   - uint_X: An unsigned integer occupying X bits (e.g. uint_8, uint_16, uint_32, uint_64).
 *   - string_N: A fixed-length string of N bytes (padded or truncated as needed).
 *   - buffer_N: A Buffer of exactly N bytes.
 *
 * This function collates all the data into one large Buffer, writes it at the given offset,
 * and returns an object containing metadata about the operation.
 */
async function writeBytesToFileAtOffset(filePath, offset, dataArray) {
    // Calculate total length and build write instructions.
    let totalLength = 0;
    const writeInstructions = [];
    const writtenData = [];

    for (const obj of dataArray) {
        for (var key of Object.keys(obj)) {
            let value = obj[key];
            let typeMatch;
            if(key == "buffer") {
                key = key+"_" + value?.length;
            }
            if (typeMatch = key.match(/^uint_(\d+)$/)) {
                const bitSize = parseInt(typeMatch[1], 10);
                const byteSize = bitSize / 8;
                totalLength += byteSize;
                writeInstructions.push({
                    type: 'uint',
                    size: byteSize,
                    value
                });
                writtenData.push(value);
            } else if (typeMatch = key.match(/^string_(\d+)$/)) {
                const strLength = parseInt(typeMatch[1], 10);
                totalLength += strLength;
                writeInstructions.push({
                    type: 'string',
                    size: strLength,
                    value
                });
                writtenData.push(value);
            } else if (typeMatch = key.match(/^buffer_(\d+)$/)) {
                const bufLength = parseInt(typeMatch[1], 10);
                totalLength += bufLength;
                if (!Buffer.isBuffer(value) || value.length !== bufLength) {
                    throw new Error(`Value for ${key} must be a Buffer of length ${bufLength

                    }. Got: ${value} : ${value.length} ${JSON.stringify(value)} `);
                }
                writeInstructions.push({
                    type: 'buffer',
                    size: bufLength,
                    value
                });
                writtenData.push(value);
            } else {
                throw new Error(`Unsupported type key: ${key}`);
            }
        }
    }

    // Allocate the complete Buffer.
    const buffer = Buffer.alloc(totalLength);
    let currentOffset = 0;
    for (const instr of writeInstructions) {
        if (instr.type === 'uint') {
            if (instr.size === 1) {
                buffer.writeUInt8(instr.value, currentOffset);
            } else if (instr.size === 2) {
                buffer.writeUInt16BE(instr.value, currentOffset);
            } else if (instr.size === 4) {
                buffer.writeUInt32BE(instr.value, currentOffset);
            } else if (instr.size === 8) {
                buffer.writeBigUInt64BE(BigInt(instr.value), currentOffset);
            } else {
                throw new Error(`Unsupported uint byte size: ${instr.size}`);
            }
            currentOffset += instr.size;
        } else if (instr.type === 'string') {
            let strBuf = Buffer.alloc(instr.size);
            let tempBuf = Buffer.from(instr.value, 'utf8');
            if (tempBuf.length > instr.size) {
                tempBuf = tempBuf.subarray(0, instr.size);
            }
            tempBuf.copy(strBuf);
            strBuf.copy(buffer, currentOffset);
            currentOffset += instr.size;
        } else if (instr.type === 'buffer') {
            instr.value.copy(buffer, currentOffset);
            currentOffset += instr.size;
        }
    }

    const handle = await getFileHandle(filePath);
    await handle.write(buffer, 0, totalLength, offset);

    return {
        size: totalLength,
        fileHandle: handle,
        data: writtenData
    };
}

/**
 * readFileBytesAtOffset:
 * Reads structured binary data from a file at a given offset using a provided schema.
 * The schema is an object whose keys are the desired property names and whose values are
 * type strings (e.g., "uint_8", "string_16", "buffer_64"). The function computes the total
 * number of bytes to read, fetches them, and then maps them into an object based on the schema.
 */
async function readFileBytesAtOffset({
    filePath,
    offset,
    schema
}) {
    let totalLength = 0;
    const instructions = [];
    if(!schema || typeof(schema) != "object") {
        return console.trace("NO schema/!")
    }
    var keys =Object.keys(schema)
    for (const key of keys ) {
        const typeString = schema[key];
        if(typeof(typeString) != "string") {
            return console.trace("BIG ISSUE",schema,key,typeString)
        }
        let typeMatch;
        if (typeMatch = typeString.match(/^uint_(\d+)$/)) {
            const bitSize = parseInt(typeMatch[1], 10);
            const byteSize = bitSize / 8;
            totalLength += byteSize;
            instructions.push({
                key,
                type: 'uint',
                size: byteSize
            });
        } else if (typeMatch = typeString.match(/^string_(\d+)$/)) {
            const strLength = parseInt(typeMatch[1], 10);
            totalLength += strLength;
            instructions.push({
                key,
                type: 'string',
                size: strLength
            });
        } else if (typeMatch = typeString.match(/^buffer_(\d+)$/)) {
            const bufLength = parseInt(typeMatch[1], 10);
            totalLength += bufLength;
            instructions.push({
                key,
                type: 'buffer',
                size: bufLength
            });
        } else {
            throw new Error(`Unsupported schema type: ${typeString}`);
        }
    }

    const buffer = Buffer.alloc(totalLength);
    const handle = await getFileHandle(filePath);
    if(!handle) {
        console.trace("WHAT",filePath.substring(0,5));
        return null;
    }
    await handle.read(buffer, 0, totalLength, offset);

    const result = {};
    let currentOffset = 0;
    for (const instr of instructions) {
        if (instr.type === 'uint') {
            if (instr.size === 1) {
                result[instr.key] = buffer.readUInt8(currentOffset);
            } else if (instr.size === 2) {
                result[instr.key] = buffer.readUInt16BE(currentOffset);
            } else if (instr.size === 4) {
                result[instr.key] = buffer.readUInt32BE(currentOffset);
            } else if (instr.size === 8) {
                result[instr.key] = Number(buffer.readBigUInt64BE(currentOffset));
            } else {
                throw new Error(`Unsupported uint byte size in schema: ${instr.size}`);
            }
            currentOffset += instr.size;
        } else if (instr.type === 'string') {
            let strBuf = buffer.subarray(currentOffset, currentOffset + instr.size);
            result[instr.key] = strBuf.toString('utf8').replace(/\0/g, '');
            currentOffset += instr.size;
        } else if (instr.type === 'buffer') {
            result[instr.key] = buffer.subarray(currentOffset, currentOffset + instr.size);
            currentOffset += instr.size;
        }
    }

    return result;
}



global.openFileHandles = openFileHandles;

/**
 * getFileHandle:
 * Opens a file using fs.promises and caches the file handle for rapid successive I/O.
 * If a file handle is already open (and not marked as closed), it returns that handle.
 */
async function getFileHandle(filePath) {
    if(!filePath) {
        console.trace("no file path")
        return;
    }
	if (openFileHandles[filePath] && !openFileHandles[filePath].isClosed) {
		return openFileHandles[filePath].handle;
	}
	// Attempt to open the file with read/write access; create it if it does not exist.
	let handle;
	try {
		handle = await fs.open(filePath, 'r+');
	} catch (err) {
		try {
			handle = await fs.open(filePath, 'w+');
			await handle.close();
			handle = await fs.open(filePath, "r+");
		} catch(e) {
            console.log("Trying \n\n\n",filePath)
			console.log("Issue",e);

		}
	}
	var keys = Object.keys(openFileHandles)
	if(keys.length > MAX_OPEN_FILES) {
		try {
            var last = keys[keys.length - 1]
            try {
                await openFileHandles[last].close();
            } catch(e){}
			delete openFileHandles[last];
		} catch(e){}
	}
	openFileHandles[filePath] = {
		handle,
		isClosed: false
	};
	// (Optional: implement LRU closing if count exceeds MAX_OPEN_FILES)
	return handle;
}

module.exports = {
    logBuffer,

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

	

    hashKey
}