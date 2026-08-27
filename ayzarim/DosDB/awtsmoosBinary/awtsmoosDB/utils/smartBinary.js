
// B"H
const constants = require('../constants.js');
const serializeValue = require('../core/allocator/serialize/serializeValue.js'); // Reuse existing value serializer
const keyEncoding = require('./keyEncoding.js');

// MurmurHash3 32-bit (Simple Implementation for Speed)
function hash32(key) {
    let str = String(key);
    let h = 0xdeadbeef;
    for(let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
    }
    return ((h ^ (h >>> 16)) >>> 0);
}

class SmartBinary {
    
    // --- SMART OBJECT ---
    // [TotalLen:4][Count:2][ [Hash:4][Offset:4][Type:1] ... ][ Data Heap ]
    // Header Size per entry: 9 bytes.
    static serializeObject(obj, visited) {
        const keys = Object.keys(obj);
        const count = keys.length;
        
        // Pre-calculate TOC size
        // Header (6 bytes) + Entries (9 * count)
        let cursor = 6 + (count * 9); 
        
        const toc = [];
        const heapBuffers = [];

        // 1. Serialize all values first to get sizes
        for (const k of keys) {
            const val = obj[k];
            
            // NOTE: We recursively call StructBuilder logic here conceptually,
            // but since we are inside serialization, we need to know if the CHILD
            // should also be inline or block. 
            // For simplicity in this function, we assume values are already prepared 
            // or we use standard serializeValue which creates buffers.
            // If the value is a SmartPointer (Buffer 16), it stays as is.
            
            // We use the existing serializeValue logic which handles primitives.
            // For nested objects/arrays, this function is called RECURSIVELY by StructBuilder
            // BEFORE this function is called. So 'val' here should already be a Buffer (Pointer or Inline).
            
            let valBuf;
            if (val && val.ptr && Buffer.isBuffer(val.ptr)) {
                valBuf = val.ptr; // It's a SmartPointer object wrapper
            } else if (Buffer.isBuffer(val)) {
                valBuf = val;
            } else {
                // Primitive fallback (shouldn't happen if StructBuilder does its job, but safe to have)
                valBuf = serializeValue(val, true);
            }

            const keyBuf = Buffer.from(k, 'utf8');
            const keyLen = keyBuf.length;
            const valLen = valBuf.length;
            
            // Heap Entry: [KeyLen:1][Key][Val] (Simplified)
            // Limit Key to 255 bytes for inline optimization
            if (keyLen > 255) throw new Error("Inline Object Key too long");
            
            const entryHeader = Buffer.alloc(1);
            entryHeader[0] = keyLen;
            
            const heapEntry = Buffer.concat([entryHeader, keyBuf, valBuf]);
            
            toc.push({
                hash: hash32(k),
                offset: cursor,
                // We don't strictly need Type in TOC if the value buffer has it header.
                // serializeValue adds a type header. 
                // But for fast scanning, let's peek the type from valBuf[0] (if standard encoding)
                // or just store 0 and rely on heap read.
                type: 0 
            });
            
            heapBuffers.push(heapEntry);
            cursor += heapEntry.length;
        }

        // 2. Sort TOC by Hash for Binary Search
        toc.sort((a, b) => a.hash - b.hash);

        // 3. Build Buffer
        const totalSize = cursor;
        const result = Buffer.allocUnsafe(totalSize);
        
        // Write Global Header
        result.writeUInt32BE(totalSize, 0);
        result.writeUInt16BE(count, 4);
        
        // Write TOC
        let tocPtr = 6;
        for(const entry of toc) {
            result.writeUInt32BE(entry.hash, tocPtr);
            result.writeUInt32BE(entry.offset, tocPtr + 4);
            result.writeUInt8(entry.type, tocPtr + 8);
            tocPtr += 9;
        }
        
        // Write Heap
        let heapPtr = 6 + (count * 9);
        for(const buf of heapBuffers) {
            buf.copy(result, heapPtr);
            heapPtr += buf.length;
        }
        
        return result;
    }

    // --- SMART ARRAY ---
    // [TotalLen:4][Count:4][ Offset0:4, Offset1:4 ... ][ Data Heap ]
    static serializeArray(arr, visited) {
        const count = arr.length;
        // Header (8 bytes) + Offsets (4 * count)
        let cursor = 8 + (count * 4);
        
        const offsets = [];
        const heapBuffers = [];
        
        for(const item of arr) {
            let valBuf;
            if (item && item.ptr && Buffer.isBuffer(item.ptr)) valBuf = item.ptr;
            else if (Buffer.isBuffer(item)) valBuf = item;
            else valBuf = serializeValue(item, true);
            
            offsets.push(cursor);
            heapBuffers.push(valBuf);
            cursor += valBuf.length;
        }
        
        const totalSize = cursor;
        const result = Buffer.allocUnsafe(totalSize);
        
        result.writeUInt32BE(totalSize, 0);
        result.writeUInt32BE(count, 4);
        
        let tocPtr = 8;
        for(const off of offsets) {
            result.writeUInt32BE(off, tocPtr);
            tocPtr += 4;
        }
        
        let heapPtr = 8 + (count * 4);
        for(const buf of heapBuffers) {
            buf.copy(result, heapPtr);
            heapPtr += buf.length;
        }
        
        return result;
    }

    // --- READERS ---
    
    static getObjectProperty(buffer, key) {
        const hash = hash32(key);
        const count = buffer.readUInt16BE(4);
        
        // Binary Search
        let low = 0, high = count - 1;
        
        // B"H: Updated Binary Search with Linear Scan for Collisions
        while (low <= high) {
            const mid = (low + high) >>> 1;
            const entryOffset = 6 + (mid * 9);
            const entryHash = buffer.readUInt32BE(entryOffset);
            
            if (entryHash < hash) {
                low = mid + 1;
            } else if (entryHash > hash) {
                high = mid - 1;
            } else {
                // Hash Match Found at 'mid'
                // Since TOC is sorted by Hash, identical hashes are adjacent.
                // We must scan left to find the first occurrence, then scan right checking keys.
                
                // 1. Scan Left to find start of this hash block
                let startIdx = mid;
                while (startIdx > 0) {
                    const prevOffset = 6 + ((startIdx - 1) * 9);
                    const prevHash = buffer.readUInt32BE(prevOffset);
                    if (prevHash !== hash) break;
                    startIdx--;
                }
                
                // 2. Scan Right checking keys
                for (let i = startIdx; i < count; i++) {
                    const currOffset = 6 + (i * 9);
                    const currHash = buffer.readUInt32BE(currOffset);
                    
                    if (currHash !== hash) break; // End of hash block
                    
                    // Check Key
                    const dataOffset = buffer.readUInt32BE(currOffset + 4);
                    const keyLen = buffer.readUInt8(dataOffset);
                    
                    // Optimization: Check length first to avoid string alloc
                    if (key.length === keyLen) {
                        const keyStr = buffer.toString('utf8', dataOffset + 1, dataOffset + 1 + keyLen);
                        if (keyStr === key) {
                            const valStart = dataOffset + 1 + keyLen;
                            return buffer.subarray(valStart);
                        }
                    }
                }
                
                // If we scanned all entries with this hash and found no match:
                return undefined;
            }
        }
        return undefined;
    }
    
    static getArrayIndex(buffer, index) {
        const count = buffer.readUInt32BE(4);
        if (index < 0 || index >= count) return undefined;
        
        const offsetPtr = 8 + (index * 4);
        const start = buffer.readUInt32BE(offsetPtr);
        
        // Find end
        let end;
        if (index === count - 1) {
            end = buffer.readUInt32BE(0); // Total Length
        } else {
            end = buffer.readUInt32BE(offsetPtr + 4);
        }
        
        return buffer.subarray(start, end);
    }
    
    static getObjectKeys(buffer) {
        const count = buffer.readUInt16BE(4);
        const keys = [];
        for(let i=0; i<count; i++) {
            const entryOffset = 6 + (i * 9);
            const dataOffset = buffer.readUInt32BE(entryOffset + 4);
            const keyLen = buffer.readUInt8(dataOffset);
            keys.push(buffer.toString('utf8', dataOffset + 1, dataOffset + 1 + keyLen));
        }
        return keys;
    }
}

module.exports = SmartBinary;
