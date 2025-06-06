//B"H

var {
	readFileBytesAtOffset,
	
	writeBytesToFileAtOffset,
	truncateFile,
	stat
} = require("./awtsmoosBinaryHelpers.js");

var fs = require("fs")
var path = require("path")

class FileBuffer {
	constructor(filePath) {
		this.filePath = filePath;
		
		var basename = path.basename(filePath);
		this.name = basename;
		this.path = filePath;
		
		this.isFileBuffer = true;
		var stats = (stat(filePath));
		this.stats = stats;
		this._length = stats?.size || 0;
		
		return new Proxy(this, {
			get(target, property) {
				if(
					!isNaN(property)
				) {
					return this.readUInt8(property)
				}
				return target[property];
			},
			
			set(target, property, value) {
				if(
					!isNaN(property) &&
					!isNaN(value)
				) {
					
					var val = parseInt(value)
					this.writeUInt8(property, val);
					return val;
				}
				target[property] = value;
				return value;
			}
		})
	}
	_length = null;
	get length() {
		//	if(this._length === null) {
		var stats = (stat(this.filePath));
		this.stats = stats;
		this._length = stats?.size || 0;
		
		//}
		return this._length
	}
	
	set length(v) {
		_length = v;
	}
	readUIntBE(offset, byteLength) {
		return readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: "uint_" + (byteLength * 8)
			}
		})?.awtsmoosVal;
	}
	// Read functions for common buffer operations using existing logic
	readUInt8(offset) {
		if(isNaN(offset)) {
			//console.trace("hi", offset)
			return null;
		}
		const result = readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: "uint_8"
			}
		});
		return result?.awtsmoosVal; // Return the value of the "awtsmoosVal" field
	}
	
	readUInt16BE(offset) {
		const result = readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: "uint_16"
			}
		});
		return result?.awtsmoosVal; // Return the value of the "awtsmoosVal" field
	}
	
	readUInt32BE(offset) {
		const result = readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: "uint_32"
			}
		});
		return result?.awtsmoosVal; // Return the value of the "awtsmoosVal" field
	}
	
	readString(offset, length) {
		const result = readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: `string_${length}`
			}
		});
		return result?.awtsmoosVal; // Return the value of the "awtsmoosVal" field
	}
	
	readBuffer(startIndex, endIndex) {
		var length = endIndex - startIndex;
		if(length < 0) length = 0;
		var offset = startIndex;
		
		// console.log("Reading at length",offset,length,startIndex,endIndex)
		const result = readFileBytesAtOffset({
			filePath: this.filePath,
			offset,
			schema: {
				awtsmoosVal: `buffer_${length}`
			}
		});
		
		
		return result?.awtsmoosVal || Buffer.alloc(0); // Return the value of the "awtsmoosVal" field
	}
	
	// Write functions for common buffer operations using existing logic
	writeUInt8(offset, value) {
		writeBytesToFileAtOffset({
			filePath: this.filePath,
			offset,
			schema: [{
				uint_8: value
			}]
		});
	}
	
	writeUInt16BE(offset, value) {
		writeBytesToFileAtOffset({
			filePath: this.filePath,
			offset,
			schema: [{
				uint_16: value
			}]
		});
	}
	
	writeUInt32BE(offset, value) {
		writeBytesToFileAtOffset({
			filePath: this.filePath,
			offset,
			schema: [{
				uint_32: value
			}]
		});
	}
	
	writeString(offset, str) {
		writeBytesToFileAtOffset({
			filePath: this.filePath,
			offset,
			schema: [{
				[`string_${
			str.length
		}`]: str
			}]
		});
	}
	
	truncate(offset) {
		truncateFile(this.filePath, offset)
	}
	
	writeBuffer(offset, buffer) {
		return writeBytesToFileAtOffset({
			filePath: this.filePath,
			offset,
			schema: [{
				["buffer_" + buffer.length]: buffer
			}]
		});
	}
	
	write(offset, buffer) {
		return this.writeBuffer(offset, buffer)
	}
	// Buffer-like method for subarray (to read part of the file)
	subarray(startIndex, endIndex) {
		if(isNaN(endIndex)) {
			console.log("NULL", endIndex)
		}
		
		return this.readBuffer(startIndex, endIndex);
	}
	
	toString(mode = "utf8", startIndex = 0, endIndex) {
		var sub = this.subarray(startIndex, endIndex);
		return sub.toString(mode);
	}
	
	// Add any other buffer methods you'd like to implement in a similar way
}
/*
// Example usage:
function exampleUsage() {
  const fileBuffer = new FileBuffer("path/to/file");

  // Read a uint8
  const uint8 = fileBuffer.readUInt8BE(0);
  console.log(uint8);  // Output the uint8 value

  // Read a string of 4 bytes
  const str = fileBuffer.readString(10, 4);
  console.log(str);  // Output the string

  // Write a uint8
  fileBuffer.writeUInt8BE(10, 255);

  // Write a string
  fileBuffer.writeString(20, "test");

  // Use subarray to get part of the file (for example, 6 bytes starting from offset 30)
  const subData = fileBuffer.subarray(30, 6);
  console.log(subData);  // Output the subarray buffer
}
*/
module.exports = FileBuffer;