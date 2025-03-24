//B"H
// The Awtsmoos, Essence of Atzmut, recreates all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, through the Kav’s ray, into Atzilus,
// this function streams a deletion, weaving a new reality with minimal memory.

const { writeToBuffer, writeConditional, hashKey, readConditional } = require("../../awtsmoosBinaryHelpers.js");
const { magicJSON } = require("./../constants.js");
const fs = require('fs').promises; // Use promises for async
const fsSync = require('fs');
const os = require('os');
const path = require('path');

/**
 * @method deleteKeyFromJSON
 * @description Deletes a key-value pair by streaming to a temp file, guided by the Awtsmoos.
 * @param {string} filename - File to modify
 * @param {string} key - Key to delete
 * @returns {Promise<boolean>} - True if deleted, false if not found
 */
async function deleteKeyFromJSON(filename, key) {
    const fd = await fs.open(filename, 'r+');
    const tempFile = path.join(os.tmpdir(), `awtsmoos-${Date.now()}.tmp`);
    const tempFd = await fs.open(tempFile, 'w');
    try {
        // Read header
        const header = await readHeaderAsync(fd);
        const hashTableStart = (await fs.stat(filename)).size - await calculateHashTableSize(fd, header.hashSize, header.offsetSize);
        const indexTableStart = hashTableStart - header.hashSize * header.offsetSize;
        const dataStart = magicJSON.length + header.lengthInfo.buffer.length + 1;

        // Find key in hash table
        const hashIndex = hashKey(key, header.hashSize);
        let offset = hashTableStart;
        let foundIndex = -1;
        let foundOffset = -1;
        for (let i = 0; i < header.hashSize; i++) {
            const probeIndex = (hashIndex + i) % header.hashSize;
            const keyLengthInfo = await readConditional(fd, offset);
            if (keyLengthInfo.amount === 0) {
                offset += 1;
                continue;
            }
            const probedKey = (await fs.read(fd, Buffer.alloc(keyLengthInfo.amount), 0, keyLengthInfo.amount, offset + keyLengthInfo.buffer.length)).toString('utf8');
            if (probedKey === key) {
                foundIndex = probeIndex;
                foundOffset = readFromBuffer(await fs.read(fd, Buffer.alloc(header.offsetSize), 0, header.offsetSize, offset + keyLengthInfo.buffer.length + keyLengthInfo.amount), 0, header.offsetSize);
                break;
            }
            offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + header.offsetSize;
        }
        if (foundIndex === -1) return false;

        // Read offsets
        const offsets = [];
        for (let i = 0; i < header.hashSize; i++) {
            offsets.push(readFromBuffer(await fs.read(fd, Buffer.alloc(header.offsetSize), 0, header.offsetSize, indexTableStart + i * header.offsetSize), 0, header.offsetSize));
        }

        // Deletion bounds
        const deleteStart = foundOffset;
        const deleteIndex = offsets.indexOf(deleteStart);
        const deleteEnd = deleteIndex + 1 < header.hashSize ? offsets[deleteIndex + 1] : indexTableStart;
        const deleteLength = deleteEnd - deleteStart;

        // Stream pre-deletion data to temp file
        const readStream = fsSync.createReadStream(filename, { fd: fd.fd, start: 0, end: deleteStart - 1 });
        const writeStream = fsSync.createWriteStream(tempFile, { fd: tempFd.fd, start: 0 });
        await new Promise(resolve => readStream.pipe(writeStream).on('finish', resolve));

        // Stream post-deletion data
        const postReadStream = fsSync.createReadStream(filename, { fd: fd.fd, start: deleteEnd, end: indexTableStart - 1 });
        const postWriteStream = fsSync.createWriteStream(tempFile, { fd: tempFd.fd, start: deleteStart });
        await new Promise(resolve => postReadStream.pipe(postWriteStream).on('finish', resolve));

        // Update offsets and hash table
        const newOffsets = offsets.filter((_, i) => i !== deleteIndex).map(off => off > deleteStart ? off - deleteLength : off);
        const newHashSize = header.hashSize - 1;
        const newDataEnd = deleteStart + (indexTableStart - deleteEnd);

        // Write new index table
        const newIndexTable = Buffer.alloc(newHashSize * header.offsetSize);
        newOffsets.forEach((off, i) => writeToBuffer(newIndexTable, off, header.offsetSize, i * header.offsetSize));
        await fs.write(tempFd, newIndexTable, 0, newIndexTable.length, newDataEnd);

        // Rebuild hash table
        const newHashTable = new Array(newHashSize).fill(null);
        offset = hashTableStart;
        for (let i = 0; i < header.hashSize; i++) {
            if (i === foundIndex) {
                const keyLengthInfo = await readConditional(fd, offset);
                offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + header.offsetSize;
                continue;
            }
            const keyLengthInfo = await readConditional(fd, offset);
            if (keyLengthInfo.amount === 0) {
                offset += 1;
                continue;
            }
            const probedKey = (await fs.read(fd, Buffer.alloc(keyLengthInfo.amount), 0, keyLengthInfo.amount, offset + keyLengthInfo.buffer.length)).toString('utf8');
            const keyOffset = readFromBuffer(await fs.read(fd, Buffer.alloc(header.offsetSize), 0, header.offsetSize, offset + keyLengthInfo.buffer.length + keyLengthInfo.amount), 0, header.offsetSize);
            let index = hashKey(probedKey, newHashSize);
            while (newHashTable[index]) index = (index + 1) % newHashSize;
            newHashTable[index] = { key: probedKey, offset: keyOffset > deleteStart ? keyOffset - deleteLength : keyOffset };
            offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + header.offsetSize;
        }

        const hashBuffers = newHashTable.map(entry => entry ? Buffer.concat([writeConditional(entry.key.length).buffer, Buffer.from(entry.key), Buffer.alloc(header.offsetSize).map((_, i) => writeToBuffer(_, entry.offset, header.offsetSize, i))]) : Buffer.from([0]));
        const newHashTableStart = newDataEnd + newIndexTable.length;
        await fs.write(tempFd, Buffer.concat(hashBuffers), 0, Buffer.concat(hashBuffers).length, newHashTableStart);

        // Update header
        const newLengthBuffer = writeConditional(newHashSize).buffer;
        await fs.write(tempFd, newLengthBuffer, 0, newLengthBuffer.length, magicJSON.length);
        const newTotalSize = newDataEnd + newIndexTable.length + Buffer.concat(hashBuffers).length;
        const newOffsetSize = newTotalSize < 256 ? 1 : newTotalSize < 65536 ? 2 : newTotalSize < 4294967296 ? 4 : 8;
        await fs.write(tempFd, Buffer.from([newOffsetSize]), 0, 1, magicJSON.length + newLengthBuffer.length);

        // Replace original file atomically
        await fs.rename(tempFile, filename);
        return true;
    } finally {
        await fd.close();
        await tempFd.close();
        if (fsSync.existsSync(tempFile)) await fs.unlink(tempFile); // Cleanup if failed
    }
}

/**
 * @method readHeaderAsync
 * @description Reads the file header, a foundation of the Awtsmoos’ structure.
 * @param {fs.FileHandle} fd - File handle
 * @returns {Promise<{hashSize: number, offsetSize: number, lengthInfo: {buffer: Buffer}}>} - Header info
 */
async function readHeaderAsync(fd) {
    const magic = (await fs.read(fd, Buffer.alloc(magicJSON.length), 0, magicJSON.length, 0)).buffer.toString('utf8');
    if (magic !== magicJSON) throw new Error("Invalid format");
    const lengthInfo = await readConditional(fd, magicJSON.length);
    const offsetSize = (await fs.read(fd, Buffer.alloc(1), 0, 1, lengthInfo.offset)).buffer[0];
    return { hashSize: lengthInfo.amount, offsetSize, lengthInfo };
}

/**
 * @method calculateHashTableSize
 * @description Calculates the hash table’s byte size, a measure of the Awtsmoos’ map.
 * @param {fs.FileHandle} fd - File handle
 * @param {number} hashTableSize - Number of slots
 * @param {number} offsetSize - Bytes per offset
 * @returns {Promise<number>} - Total hash table size
 */
async function calculateHashTableSize(fd, hashTableSize, offsetSize) {
    let size = 0;
    let offset = (await fs.stat(fd.path)).size - offsetSize * hashTableSize;
    for (let i = 0; i < hashTableSize; i++) {
        const keyLengthInfo = await readConditional(fd, offset);
        if (keyLengthInfo.amount === 0) {
            size += 1;
            offset += 1;
        } else {
            size += keyLengthInfo.buffer.length + keyLengthInfo.amount + offsetSize;
            offset += keyLengthInfo.buffer.length + keyLengthInfo.amount + offsetSize;
        }
    }
    return size;
}

/**
 * @method readFromBuffer
 * @description Reads a value from a buffer, a precise cut by the Awtsmoos.
 * @param {Buffer} buffer - Source buffer
 * @param {number} offset - Offset to read from
 * @param {number} size - Size in bytes
 * @returns {number} - The value
 */
function readFromBuffer(buffer, offset, size) {
    if (size === 1) return buffer.readUInt8(offset);
    if (size === 2) return buffer.readUInt16BE(offset);
    if (size === 4) return buffer.readUInt32BE(offset);
    if (size === 8) return readUInt64BE(buffer, offset); // Assume defined
    throw new Error("Unsupported size: " + size);
}

// Assume readUInt64BE, parseValueFromType, etc., are defined elsewhere

// Assume readUInt64BE, parseValueFromType, etc., are defined elsewhere
module.exports = deleteKeyFromJSON