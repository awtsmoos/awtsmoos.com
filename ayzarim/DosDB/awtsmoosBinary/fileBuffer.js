//B"H
var {
    magicJSON,
    magicArray,
    hashAmount

} = require("./constants");

var {
    readFileBytesAtOffset,
    hashKey
} = require("./awtsmoosBinaryHelpers.js")

class FileBuffer {
    constructor(filePath) {
      this.filePath = filePath;
    }
  
    // Read functions for common buffer operations using existing logic
    async readUInt8(offset) {
        if(isNaN(offset)) {
            console.trace("hi",offset)
        }
      const result = await readFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: { awtsmoosVal: "uint_8" }
      });
      return result.awtsmoosVal;  // Return the value of the "awtsmoosVal" field
    }
  
    async readUInt16BE(offset) {
      const result = await readFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: { awtsmoosVal: "uint_16" }
      });
      return result.awtsmoosVal;  // Return the value of the "awtsmoosVal" field
    }
  
    async readUInt32BE(offset) {
      const result = await readFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: { awtsmoosVal: "uint_32" }
      });
      return result.awtsmoosVal;  // Return the value of the "awtsmoosVal" field
    }
  
    async readString(offset, length) {
      const result = await readFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: { awtsmoosVal: `string_${length}` }
      });
      return result.awtsmoosVal;  // Return the value of the "awtsmoosVal" field
    }
  
    async readBuffer(startIndex, endIndex) {
      var length = endIndex - startIndex;
      if(length < 0) length = 0;
      var offset = startIndex;

     // console.log("Reading at length",offset,length,startIndex,endIndex)
      const result = await readFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: { awtsmoosVal: `buffer_${length}` }
      });
      return result.awtsmoosVal;  // Return the value of the "awtsmoosVal" field
    }
  
    // Write functions for common buffer operations using existing logic
    async writeUInt8(offset, value) {
      await writeFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: [{ uint_8: value }]
      });
    }
  
    async writeUInt16BE(offset, value) {
      await writeFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: [{ uint_16: value }]
      });
    }
  
    async writeUInt32BE(offset, value) {
      await writeFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: [{ uint_32: value }]
      });
    }
  
    async writeString(offset, str) {
      await writeFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: [{ string_4: str }]
      });
    }
  
    async writeBuffer(offset, buffer) {
      await writeFileBytesAtOffset({
        filePath: this.filePath,
        offset,
        schema: [{ ["buffer_"+buffer.length]: buffer }]
      });
    }
  
    // Buffer-like method for subarray (to read part of the file)
    async subarray(startIndex, endIndex) {
        if(isNaN(endIndex)) {
            console.log("NULL",endIndex)
        }
      
      return this.readBuffer(startIndex, endIndex);
    }

    async toString(mode="utf8", startIndex=0, endIndex) {
        var sub = await this.subarray(startIndex, endIndex);
        return sub.toString(mode);
    }
  
    // Add any other buffer methods you'd like to implement in a similar way
  }
  /*
  // Example usage:
  async function exampleUsage() {
    const fileBuffer = new FileBuffer("path/to/file");
  
    // Read a uint8
    const uint8 = await fileBuffer.readUInt8BE(0);
    console.log(uint8);  // Output the uint8 value
  
    // Read a string of 4 bytes
    const str = await fileBuffer.readString(10, 4);
    console.log(str);  // Output the string
  
    // Write a uint8
    await fileBuffer.writeUInt8BE(10, 255);
  
    // Write a string
    await fileBuffer.writeString(20, "test");
  
    // Use subarray to get part of the file (for example, 6 bytes starting from offset 30)
    const subData = await fileBuffer.subarray(30, 6);
    console.log(subData);  // Output the subarray buffer
  }
  */
 module.exports = FileBuffer;