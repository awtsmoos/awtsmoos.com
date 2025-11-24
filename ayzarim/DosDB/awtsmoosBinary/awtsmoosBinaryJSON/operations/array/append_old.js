//B"H

const fs = require('fs');
/**
 * @method appendToArray
 * @description Appends items to a file, updating the index
 *   table at the end, a breath of the Awtsmoos.
 * @param {string} filename - File to append to
 * @param {Array} newItems - Items to append
 */
function appendToArray(filename, newItems) {
    
    
    try {
        const fd = fs.openSync(filename, 'r+');
        const stat = fs.fstatSync(fd);
        let fileSize = stat.size;

        // Read header
        const magic = Buffer.alloc(4);
        fs.readSync(fd, magic, 0, 4, 0);
        if (!magic.equals(Buffer.from(magicArray))) throw new Error('Invalid format');

        const lengthInfo = parseConditionalFromFile(fd, 4); // Assume this exists
        const currentLength = lengthInfo.value;
        const lengthPos = 4;
        const offsetSizePos = lengthInfo.offset;
        const offsetSize = fs.readSync(fd, Buffer.alloc(1), 0, 1, offsetSizePos)[0];
        const dataStart = offsetSizePos + 1;

        // Current index table position
        const indexTableSize = currentLength * offsetSize;
        const dataEnd = fileSize - indexTableSize;

        // Serialize new items
        const newBuffers = newItems.map(item => {
            const serialized = serializeArray([item]);
            return serialized.slice(4 + writeConditional(1).buffer.length + 1); // Strip header
        });
        const newData = Buffer.concat(newBuffers);
        const newLength = currentLength + newItems.length;

        // Write new data
        fs.writeSync(fd, newData, 0, newData.length, dataEnd);

        // Update index table
        const newOffsets = [];
        let offset = dataStart;
        for (let i = 0; i < currentLength; i++) {
            newOffsets.push(readFromBuffer(
                fs.readSync(fd, Buffer.alloc(offsetSize), 
                0, offsetSize, dataEnd + i * offsetSize), 0, offsetSize)
            );
        }
        let currentOffset = dataEnd;
        newItems.forEach(() => {
            newOffsets.push(currentOffset);
            currentOffset += newBuffers.shift().length;
        });

        const totalSize = dataEnd + newData.length;
        const newOffsetSize = totalSize < 256 ? 1 
            : totalSize < 65536 ? 2 
            : totalSize < 4294967296 ? 4 : 8;
        const indexTable = Buffer.alloc(newLength * newOffsetSize);
        newOffsets.forEach((off, i) => writeToBuffer(indexTable, off, newOffsetSize, i * newOffsetSize));

        // Write updated index table
        fs.writeSync(fd, indexTable, 0, indexTable.length, dataEnd + newData.length);

        // Update header
        fs.writeSync(fd, writeConditional(newLength).buffer, 0, writeConditional(newLength).buffer.length, lengthPos);
        fs.writeSync(fd, Buffer.from([newOffsetSize]), 0, 1, offsetSizePos);

        fs.ftruncateSync(fd, totalSize + indexTable.length);
    } finally {
        fs.closeSync(fd);
    }
}

module.exports = appendToArray;