//B"H
const fs = require('fs').promises;

async function readBytesFromFile(filePath, offset, struct) {
    try {
      // Calculate the total size of the buffer needed based on the struct
      let totalBytes = 0;
      const bufferMap = {};
  
      for (const [key, type] of Object.entries(struct)) {
        let typeSize = 0;
        switch (type) {
          case 'uint8_t':
            typeSize = 1;
            break;
          case 'uint16_t':
            typeSize = 2;
            break;
          case 'uint32_t':
            typeSize = 4;
            break;
          case 'uint64_t':
            typeSize = 8;
            break;
          default:
            throw new Error(`Unsupported type: ${type}`);
        }
        bufferMap[key] = typeSize
        totalBytes += typeSize;
      }
  
      // Open the file for reading
      const fileHandle = await fs.open(filePath, 'r');
      
      // Read the file into a single buffer starting from the offset
      const buffer = Buffer.alloc(totalBytes);
      await fileHandle.read(buffer, 0, totalBytes, offset);
  
      // Parse the buffer into the struct format using subarray for efficiency
      let currentByte = 0;
      for (const [key, type] of Object.entries(struct)) {
        const size = bufferMap[key];
        bufferMap[key] = buffer.subarray(currentByte, currentByte + size).toString();
        currentByte += size;
      }
  
      await fileHandle.close();
      
      return bufferMap;
    } catch (err) {
      console.error('Error reading file:', err);
    }
  }
  
  async function writeBytesToFile(filePath, offset, data) {
    try {
      // Calculate total size of the buffer based on data
      let totalBytes = 0;
      const bufferArray = [];
  
      for (var [key, value] of Object.entries(data)) {
        let valueBuffer;
        if(typeof(value) == "string") {
            value = Buffer.from(value)
        }
        // Handle if value is already a buffer
        if (Buffer.isBuffer(value)) {
          valueBuffer = value;
        } else {
          switch (value) {
            case 'uint8_t':
              valueBuffer = Buffer.alloc(1);
              break;
            case 'uint16_t':
              valueBuffer = Buffer.alloc(2);
              break;
            case 'uint32_t':
              valueBuffer = Buffer.alloc(4);
              break;
            case 'uint64_t':
              valueBuffer = Buffer.alloc(8);
              break;
            default:
              throw new Error(`Unsupported value type: ${value}`);
          }
        }
  
        bufferArray.push(valueBuffer);
        totalBytes += valueBuffer.length;
      }
  
      // Combine all buffers into one single buffer to write
      const writeBuffer = Buffer.concat(bufferArray);
  
      // Open the file for writing
      const fileHandle = await fs.open(filePath, 'w+');
      
      // Write the combined buffer at the specified offset
      await fileHandle.write(writeBuffer, 0, totalBytes, offset);
  
      await fileHandle.close();
      console.log(`Wrote data at offset ${offset}`);
    } catch (err) {
      console.error('Error writing to file:', err);
    }
  }

module.exports = {
    readBytesFromFile,
    writeBytesToFile
}
