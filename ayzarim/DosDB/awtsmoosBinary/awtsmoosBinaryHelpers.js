//B"H

const crypto = require('crypto');

const fs = require('fs').promises;
function logBuffer(buffer, base = 10, columns = 8) {
    for (let i = 0; i < buffer.length; i += columns) {
        let offset = i.toString().padStart(4, '0'); // Offset indicator
        let bytes = buffer.slice(i, i + columns)
                          .map(byte => byte.toString(base).padStart(3, ' '))
                          .join(' '); 
       console.log(`${offset}: ${bytes}`);
    }
}
function readUIntFromBuffer(buffer) {
    switch (buffer.length) {
        case 0: 
            return 0;
        case 1:
            return buffer.readUInt8(0);
        case 2:
            return buffer.readUInt16LE(0);
        case 3: 
            return buffer[0] | (buffer[1] << 8) | (buffer[2] << 16);
        case 4:
            return buffer.readUInt32LE(0);
        case 5:
            return buffer.readUInt32LE(0) |
             (buffer[4] << 32);
        case 6:
            return buffer.readUInt32LE(0) | 
            (buffer[4] << 32) | (buffer[5] << 40);
        case 7:
            return buffer.readUInt32LE(0) | 
            (buffer[4] << 32) | 
            (buffer[5] << 40) | 
            (buffer[6] << 48);
        case 8:
            return buffer.readUInt32LE(0) + buffer.readUInt32LE(4) * 0x100000000;
        default:
            console.log("Unsupported buffer size", buffer);
    }
}

function writeUIntToBuffer(buffer, value, byteSize, offset=0) {
    buffer = buffer || Buffer.alloc(byteSize);
    
    switch (byteSize) {
        case 1:
            
            buffer.writeUInt8(value, offset);
            break;
        case 2:
            buffer.writeUInt16LE(value, offset);
            break;
        case 4:
            buffer.writeUInt32LE(value, offset);
            break;
        case 8:
            writeUInt64LE(buffer, value, offset);
            break;
        default:
            throw new Error("Unsupported byte size");
    }
    
    return buffer;
}

var types = {
    uint_: (buf) => readUIntFromBuffer(buf),
    string_: buf => buf?.toString(),
    buffer_: buf => buf
}

function sizeof(struct) {
	/**
	 * in format of
	 * key, value (number of bys)
	 */
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
	return bytes;
}
function getBuffers(struct, getValue = true) {
	let totalBytes = 0;
	var bufferMap = {};

	for (const [key, type] of Object.entries(struct)) {
		let typeSize = 0;
		var value = null;
		for(var [typeStart, func] of Object.entries(types)) {

			var indicator = getValue ? type : key
			if(indicator.startsWith(typeStart)) {
				var ind = indicator.indexOf(typeStart);
				var amount = indicator.substring(ind + typeStart.length);
			//	console.log("G",typeStart,key,type,ind,amount)
				var num = parseInt(amount);
				if(!isNaN(num)) {

					typeSize = num;
					if(getValue) {
						value = {
							length: typeSize,
							func
						}

						bufferMap[key] = value;
					}
					else {
						var buf = bufferize(type, typeSize);
						
						value = buf;
						
						bufferMap = value;
					}
				} else {
					
				}
			}
		}
	
	
		totalBytes += typeSize;
	}
	return {
		bufferMap,
		totalBytes
	}
}
async function readBytesFromFile(filePath, offset, struct) {
    try {
		// Open the file for reading
		const fileHandle = typeof(
			filePath
		) == "string" ?
			await fs.open(filePath, 'r')
		: filePath // fileHandler
		if(typeof(struct) == "object") {
			// Calculate the total size of the buffer needed based on the struct
			var {
				bufferMap,
				totalBytes
			} = getBuffers(struct)
		
			
			
			// Read the file into a single buffer starting from the offset
			const buffer = Buffer.alloc(totalBytes);
			await fileHandle.read(buffer, 0, totalBytes, offset);
		
			// Parse the buffer into the struct format using subarray for efficiency
			let currentByte = 0;
			for (const [key, type] of Object.entries(struct)) {
				const val = bufferMap[key];
				if(!val) continue;
				var size = val?.length
			//  console.log("va",val,key,currentByte,size)
				var buf = buffer.subarray(currentByte, currentByte + size);
				var mod = typeof(val.func) == "function" ?
					val.func(buf) : buf;
				bufferMap[key] = mod;
				currentByte += size;
			}
		
			
			return bufferMap;
		} else if(typeof(struct) == "number") {
			try {
			
                
				const buffer = Buffer.alloc(struct);
				await fileHandle.read(buffer, 0, struct, offset);
				return buffer;
			} catch(e){
				console.log(e);
			}
		}
    } catch (err) {
      console.error('Error reading file:', err);
    }
  }

	function numberToBuffer(num, size = null) {
		if (typeof num !== "number" || !Number.isInteger(num) || num < 0) {
			throw new TypeError("Input must be a non-negative integer.");
		}

		let bytes = [];

		while (num > 0) {
			bytes.push(num & 0xFF); // Get the least significant byte
			num = Math.floor(num / 256); // Shift right by 8 bits (division by 256)
		}

		if (bytes.length === 0) {
			bytes.push(0); // Ensure at least one byte for the number 0
		}

		// If `size` is provided and greater than current length, pad with zeros
		if (size !== null && Number.isInteger(size) && size > bytes.length) {
			while (bytes.length < size) {
				bytes.push(0); // Pad with trailing zeros (Little-Endian)
			}
		}

		return Buffer.from(size === null ? bytes : bytes.slice(0, size)); // No reverse()
	}
  function bufferize(data, size) {
	//console.log("Writing",data)
	if(!data && data !== 0) return null;
    if(!Buffer.isBuffer(data)) {
		
        if(
            typeof(data) == "string"
		) {
			var str = Buffer.from(data);
			if(size) {
				var buf = Buffer.alloc(size);
				str.copy(buf);
				data = buf;
			} else {
				data = str;
			}

        } else if(typeof(data) == "number") {
            try {
			//	console.log("Trying it",data)
                data = numberToBuffer(data, size)
            } catch(e) {
                console.log(e)
            }
        } else if(typeof(data) == "boolean") {
			var buf = Buffer.alloc(size || 1);
			buf.writeUInt8(data?1:0, 0)
            data = buf
        } else if(Array.isArray(data)) {
		
			var ars = []
			data.forEach(q => {
				var buf = bufferize(q);
				if(Buffer.isBuffer(buf))
				ars.push(buf);
			});
			data = Buffer.concat(ars);
			

        } else if(data && typeof(data) == "object") {
			var bufs = getBuffers(data, false);
			//writeUIntToBuffer(buf, readUIntFromBuffer(bufs))
			/*var totalBytes = 0;
			bufs.forEach(b => {
				totalBytes += b.totalBytes
			});
			var masterBuffer = Buffer.alloc(totalBytes);
			bufs.forEach(q => {
				var sz = q.totalBytes;
				if(isNaN(sz)) return;
				
			})*/
			
			data = bufs.bufferMap;
			
		} else return null;
      }
	  return data;
  }
  async function writeBytesToFile(filePath, offset, data) {
    try {
      // Calculate total size of the buffer based on data
      if(isNaN(offset)) {
		
		return {offset, size: 0}
	  }
      data = bufferize(data);
      
	  
      // Combine all buffers into one single buffer to write
      
      if(
        filePath?.awtsmoosPath && 
        filePath?.awtsmoosClosed
    ) {
        console.log("WHAT?",filePath)
       // filePath = fileHandle.awtsmoosPath;
      }
      if(typeof(filePath) == "string") {
        console.log("Str",filePath,data)
      }
      // Open the file for writing
      var fileHandle = typeof(filePath) == "string" ?
        await openFile(filePath) : 
        filePath;
     if(!fileHandle) {
        console.log("Not working",data, filePath);
        return {
            offset: newOffset,
            size: data.legth,
            data,
            file: filePath
        }
     }
      
      // Write the combined buffer at the specified offset
      await fileHandle.write(data, 0, data.length, offset);
  
     // await fileHandle.close();

      var newOffset = offset + data.length
      return {
		offset:newOffset,
		size: data.length,
		data,
        file: fileHandle
	  }
    } catch (err) {
      console.error('Error writing to file:', err);
    }
  }

  async function closeFile(fh) {
   
    if(!fh) {
        console.log("What is this",fh)
        return;
    }
	var fh1 = await fh?.close?.();

    fh.awtsmoosClosed = true
   // console.log("CLOSED",fh, fh1)
    return fh;
  }
  async function openFile(path) {
    var fh;
    try {
        fh = await fs.open(path, 'r+');
        fh.awtsmoosPath = path;
    } catch(e) {
        console.log(e, " FILE ERROR AWT")
    }

    if(!fh) {

        fh = await fs.open(path, "w+");
        fh.awtsmoosPath = path;
        
        try {
			await fh?.close?.();
            fh = await fs.open(path, "r+");
            fh.awtsmoosPath = path;
        } catch(e) {
            console.log(e, "FILE OPENING ERROR");
            return null;
        }
    }
    return fh;
  }

function readUInt64LE(buf, offset = 0) {
    let low = buf.readUInt32LE(offset);       // Read lower 32 bits
    let high = buf.readUInt32LE(offset + 4);  // Read upper 32 bits

    return high * 0x100000000 + low; // Combine both 32-bit parts
}

function writeUInt64LE(buf, value, offset = 0) {
    if (value < 0 || value > Number.MAX_SAFE_INTEGER) {
        throw new RangeError("Value must be between 0 and 2^53-1");
    }

    let low = value % 0x100000000; // Lower 32 bits
    let high = Math.floor(value / 0x100000000); // Upper 32 bits

    buf.writeUInt32LE(low, offset);      // Write lower 32 bits (4 bytes)
    buf.writeUInt32LE(high, offset + 4); // Write upper 32 bits (4 bytes)
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

function readConditional(buffer, offset=0) {
    var typeBuf = buffer.readUInt8(offset);
    offset++;
    var size = 1;
    var am = null;
    switch(typeBuf) {
        case 0:
            
            am = buffer.readUInt8(offset);
            offset++;

        break;
        case 1:
            am = buffer.readUInt16LE(offset);
            offset+=2;
            size = 2
        break;
        case 2:
            am = buffer.readUInt32LE(offset);
            offset+=4
            size = 4
        break;
        case 3:
            am = readUInt64LE(buffer,offset)
            offset+=8
            size = 8
        break;
        case 4:
            am = buffer.readFloatLE(offset);
            offset += 4;
            size = 4
        break;
        case 5:
            am = buffer.readDoubleLE(offset);
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
            amountBuffer.writeDoubleLE(amount, 0);
            
        } else {
            typeBuffer = Buffer.alloc(1);
            typeBuffer.writeUInt8(4);

            size = 4;
            amountBuffer = Buffer.alloc(4);
            amountBuffer.writeFloatLE(amount, 0);
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
        amountBuffer.writeUInt16LE(amount, 0);

      
    } else if(amount >= 65536 && amount <= 4294967296) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(2, 0);

        size = 4;
        amountBuffer = Buffer.alloc(4);
        amountBuffer.writeUInt32LE(amount, 0);
    } else if(
        amount >= 4294967296 && amount <= 18446744073709552000n
    ) {
        typeBuffer = Buffer.alloc(1);
        typeBuffer.writeUInt8(3, 0);

        size = 8;
        amountBuffer = Buffer.alloc(8);
        writeUInt64LE(amountBuffer, amount, 0);
    }
    var buffer = Buffer.concat([
        typeBuffer,
        amountBuffer
    ])
    offset += buffer.length;
    return {buffer, offset, size}
}


function byteLengthToSize(byteLength) {
    if(byteLength < 256) {
        return 1

        
    } else if(byteLength >= 256 && byteLength < 65536) {
       return 2

      
    } else if(byteLength >= 65536 && byteLength <= 4294967296) {
        return 4
    } else if(
        byteLength >= 4294967296 && byteLength <= 18446744073709552000n
    ) {
        return 8
    } else return 16
}

function hashKey(key, size) {
    let hash = crypto.createHash('md5').update(key).digest();
    return hash.readUInt32LE(0) % size;
}

function writeBitAt(byte, index) {
    if (index < 0 || index > 7) {
        throw new Error('Index must be between 0 and 7');
    }

    // Set the bit at the specified index to 1
    return byte | (1 << index);
}


function splitData(data, remainingSize) {
    let firstPart, remainder;

    // Check if the data is a string or a Buffer
    if (typeof data === 'string') {
        // Convert to Buffer first
        data = Buffer.from(data, 'utf8');
    }

    // Check if the data length is larger than the remaining size
    if (data.length > remainingSize) {
        // Extract the first part that fits within the remainingSize
        firstPart = data.slice(0, remainingSize);
        // The remainder is the rest of the data
        remainder = data.slice(remainingSize);
    } else {
        // If the data fits, the first part is the entire data, and there's no remainder
        firstPart = data;
        remainder = Buffer.alloc(0);  // Empty buffer for remainder
    }

    return { firstPart, remainder };
}

module.exports = {
    logBuffer,

    readUIntFromBuffer,
    writeUIntToBuffer,

    needsDoublePrecision,
    hasDecimal,
    writeUInt64LE,
    readUInt64LE,

    writeConditional,
    readConditional,

    byteLengthToSize,
    writeBitAt,

    writeBytesToFile,
    readBytesFromFile,
    openFile,
    closeFile,

	sizeof,

	splitData,

    hashKey
}