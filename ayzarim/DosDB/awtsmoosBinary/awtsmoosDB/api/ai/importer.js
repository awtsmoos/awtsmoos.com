
// B"H
const fs = require('fs');
const path = require('path');

class GGUFImporter {
    constructor(db) {
        this.db = db;
        this.CHUNK_THRESHOLD = 4 * 1024 * 1024; 
    }

    async import(filePath, modelName) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`GGUF file not found: ${filePath}`);
        }

        const fd = fs.openSync(filePath, 'r');
        const read = (pos, length) => {
            const buf = Buffer.allocUnsafe(length);
            const bytesRead = fs.readSync(fd, buf, 0, length, pos);
            if (bytesRead < length) throw new Error(`Unexpected EOF at ${pos}`);
            return buf;
        };

        let offset = 0;
        
        // 1. Magic
        const magic = read(offset, 4).toString(); offset += 4;
        if (magic !== 'GGUF') { fs.closeSync(fd); throw new Error("Invalid GGUF Magic"); }

        // 2. Header
        const version = read(offset, 4).readUInt32LE(0); offset += 4;
        const tensorCount = read(offset, 8).readBigUInt64LE(0); offset += 8;
        const kvCount = read(offset, 8).readBigUInt64LE(0); offset += 8;

        console.log(`B"H [Import] Ver:${version} Tensors:${tensorCount} KV:${kvCount}`);

        // Prepare DB Structure
        await this.db.batch(async () => {
             if (!(await this.db.has(this.db.root.ai, 'models'))) {
                 await this.db.createMap(this.db.root.ai, 'models');
             }
             const models = this.db.root.ai.models;
             if (!(await this.db.has(models, modelName))) {
                 await this.db.createObject(models, modelName);
             }
             
             const model = models[modelName];
             if (!(await this.db.has(model, 'config'))) await this.db.createObject(model, 'config');
             if (!(await this.db.has(model, 'tensors'))) await this.db.createMap(model, 'tensors');
             
             // B"H - Bucketed Storage: Using 'vocab_data' Map instead of B-Tree
             if (!(await this.db.has(model, 'vocab_data'))) await this.db.createMap(model, 'vocab_data');
        });

        const model = this.db.root.ai.models[modelName];

        // 3. Metadata
        const decoder = new TextDecoder('utf-8');
        let vocab = [];
        
        console.log("B\"H [Import] Reading Metadata...");
        
        for (let i = 0n; i < kvCount; i++) {
            const kLen = Number(read(offset, 8).readBigUInt64LE(0)); offset += 8;
            const key = decoder.decode(read(offset, kLen)); offset += kLen;
            const type = read(offset, 4).readUInt32LE(0); offset += 4;
            
            if (i % 5n === 0n) process.stdout.write(`\rB"H [Import] Meta [${i+1n}/${kvCount}]: ${key.padEnd(40)}`);

            const { value, newOffset } = this._readValue(read, offset, type, decoder);
            offset = newOffset;

            if (key === 'tokenizer.ggml.tokens') {
                vocab = value;
            } else if (key === 'tokenizer.ggml.scores') {
                // Store scores as raw buffer (compact)
                const scoresBuf = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
                await model.config.set('scores_raw', scoresBuf);
            } else {
                if (ArrayBuffer.isView(value)) {
                    const buf = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
                    await model.config.set(key, buf);
                } else {
                    await model.config.set(key, value);
                }
            }
        }
        process.stdout.write('\n');

        // 4. Bucketed Vocab Storage
        if(vocab.length > 0) {
            console.log(`B"H [Import] Bucketing ${vocab.length} tokens...`);
            
            // Configuration: Higher bucket count = smaller individual reads = faster random access
            const BUCKET_COUNT = 2048; 
            const CHUNK_SIZE = 1024;
            
            await model.config.set('vocab_bucket_count', BUCKET_COUNT);
            await model.config.set('vocab_chunk_size', CHUNK_SIZE);
            await model.config.set('vocab_size', vocab.length);

            // A. Forward Lookup Buckets (String -> ID)
            const buckets = new Array(BUCKET_COUNT).fill(null).map(() => ({}));
            
            // B. Reverse Lookup Chunks (ID -> String)
            const chunks = [];
            
            let lastReport = Date.now();
            
            // Prepare data in memory (Strings are small enough to hold before write)
            for (let i = 0; i < vocab.length; i++) {
                const token = vocab[i];
                
                // 1. Hash for Bucket (djb2 variant)
                let hash = 5381;
                for (let j = 0; j < token.length; j++) {
                    hash = ((hash << 5) + hash) + token.charCodeAt(j);
                }
                const bucketId = (hash >>> 0) % BUCKET_COUNT;
                buckets[bucketId][token] = i;

                // 2. Chunk List
                const chunkId = Math.floor(i / CHUNK_SIZE);
                if (!chunks[chunkId]) chunks[chunkId] = [];
                chunks[chunkId].push(token);

                if (i % 10000 === 0 && Date.now() - lastReport > 500) {
                    process.stdout.write(`\rB"H [Import] Sorting Vocab: ${((i/vocab.length)*100).toFixed(1)}%`);
                    lastReport = Date.now();
                }
            }
            console.log("\nB\"H [Import] Writing Vocab Buckets to DB...");

            await this.db.batch(async () => {
                // Write Buckets
                for (let i = 0; i < BUCKET_COUNT; i++) {
                    if (Object.keys(buckets[i]).length > 0) {
                        const json = JSON.stringify(buckets[i]);
                        await model.vocab_data.set(`bucket_${i}`, json);
                    }
                    if (i % 100 === 0) process.stdout.write(`\rB"H [Import] Saving Lookup: ${((i/BUCKET_COUNT)*100).toFixed(1)}%`);
                }
                
                // Write Chunks
                console.log("\nB\"H [Import] Writing Vocab Lists...");
                for (let i = 0; i < chunks.length; i++) {
                    const json = JSON.stringify(chunks[i]);
                    await model.vocab_data.set(`chunk_${i}`, json);
                    if (i % 10 === 0) process.stdout.write(`\rB"H [Import] Saving Lists: ${((i/chunks.length)*100).toFixed(1)}%`);
                }
            });
            console.log(`\nB"H [Import] Vocab Optimized.`);
        }

        // 5. Tensors
        console.log(`B"H [Import] Scanning ${tensorCount} tensors...`);
        const tensors = [];
        for (let i = 0n; i < tensorCount; i++) {
            const nLen = Number(read(offset, 8).readBigUInt64LE(0)); offset += 8;
            const name = decoder.decode(read(offset, nLen)); offset += nLen;
            const nDims = read(offset, 4).readUInt32LE(0); offset += 4;
            const dims = [];
            for (let d = 0; d < nDims; d++) { dims.push(Number(read(offset, 8).readBigUInt64LE(0))); offset += 8; }
            const type = read(offset, 4).readUInt32LE(0); offset += 4;
            const dataOffset = Number(read(offset, 8).readBigUInt64LE(0)); offset += 8;
            tensors.push({ name, dims, type, dataOffset });
        }
        
        const alignment = (await model.config.get('general.alignment')) || 32;
        const padding = (offset % alignment === 0) ? 0 : (alignment - (offset % alignment));
        const dataBase = offset + padding;
        
        let tensorIdx = 0;
        let totalBytes = 0;
        let lastReport = Date.now();
        
        await this.db.batch(async () => {
            for (const t of tensors) {
                const { blockSize, blockElements } = this._getTypeSize(t.type);
                const numElements = t.dims.reduce((a,b)=>a*b, 1);
                const blocks = Math.ceil(numElements / blockElements);
                const byteSize = blocks * blockSize;
                const filePos = dataBase + t.dataOffset;
                
                totalBytes += byteSize;
                tensorIdx++;

                if (Date.now() - lastReport > 500) {
                    const pct = ((tensorIdx / tensors.length) * 100).toFixed(1);
                    const mb = (totalBytes / (1024*1024)).toFixed(1);
                    process.stdout.write(`\rB"H [Import] Tensors: ${pct}% | ${tensorIdx}/${tensors.length} | ${mb} MB`);
                    lastReport = Date.now();
                }

                if (byteSize > this.CHUNK_THRESHOLD && t.dims.length >= 2) {
                    const rows = t.dims[1]; 
                    const rowSize = (t.dims[0] / blockElements) * blockSize;
                    const rowsPerChunk = Math.floor((1024 * 1024) / rowSize) || 1;
                    const numChunks = Math.ceil(rows / rowsPerChunk);
                    
                    await model.tensors.set(t.name, {
                        type: t.type, dims: t.dims, chunked: true,
                        rowsPerChunk, chunkCount: numChunks, rowSize
                    });

                    for(let c=0; c<numChunks; c++) {
                        const startRow = c * rowsPerChunk;
                        const count = Math.min(rowsPerChunk, rows - startRow);
                        const chunkSize = count * rowSize;
                        const chunkPos = filePos + (startRow * rowSize);
                        const buf = Buffer.allocUnsafe(chunkSize);
                        fs.readSync(fd, buf, 0, chunkSize, chunkPos);
                        await model.tensors.set(`${t.name}.chunk.${c}`, { data: buf });
                    }
                } else {
                    const buf = Buffer.allocUnsafe(byteSize);
                    fs.readSync(fd, buf, 0, byteSize, filePos);
                    await model.tensors.set(t.name, { type: t.type, dims: t.dims, data: buf });
                }
            }
        });
        
        fs.closeSync(fd);
        console.log("\nB\"H [Import] Completed Successfully.");
    }

    _readValue(read, offset, type, decoder) {
        let value, newOffset = offset;
        switch (type) {
            case 0: value = read(offset, 1).readUInt8(0); newOffset+=1; break;
            case 1: value = read(offset, 1).readInt8(0); newOffset+=1; break;
            case 2: value = read(offset, 2).readUInt16LE(0); newOffset+=2; break;
            case 3: value = read(offset, 2).readInt16LE(0); newOffset+=2; break;
            case 4: value = read(offset, 4).readUInt32LE(0); newOffset+=4; break;
            case 5: value = read(offset, 4).readInt32LE(0); newOffset+=4; break;
            case 6: value = read(offset, 4).readFloatLE(0); newOffset+=4; break;
            case 7: value = !!read(offset, 1).readUInt8(0); newOffset+=1; break;
            case 8: { 
                const len = Number(read(offset, 8).readBigUInt64LE(0)); newOffset+=8;
                value = decoder.decode(read(newOffset, len)); newOffset+=len;
                break;
            }
            case 9: { 
                const aType = read(offset, 4).readUInt32LE(0); newOffset+=4;
                const len = Number(read(newOffset, 8).readBigUInt64LE(0)); newOffset+=8;
                
                // Efficiently read numeric arrays as TypedArrays to avoid 'hanging' on token_type
                const elSizeMap = { 0:1, 1:1, 2:2, 3:2, 4:4, 5:4, 6:4, 7:1, 10:8, 11:8, 12:8 };
                if (elSizeMap[aType]) {
                    const elSize = elSizeMap[aType];
                    const totalBytes = len * elSize;
                    const buf = read(newOffset, totalBytes);
                    newOffset += totalBytes;
                    switch(aType) {
                        case 0: value = new Uint8Array(buf.buffer, buf.byteOffset, len); break;
                        case 1: value = new Int8Array(buf.buffer, buf.byteOffset, len); break;
                        case 2: value = new Uint16Array(buf.buffer, buf.byteOffset, len); break;
                        case 3: value = new Int16Array(buf.buffer, buf.byteOffset, len); break;
                        case 4: value = new Uint32Array(buf.buffer, buf.byteOffset, len); break;
                        case 5: value = new Int32Array(buf.buffer, buf.byteOffset, len); break; 
                        case 6: value = new Float32Array(buf.buffer, buf.byteOffset, len); break; 
                        case 7: value = new Uint8Array(buf.buffer, buf.byteOffset, len); break; 
                        case 10: value = new BigUint64Array(buf.buffer, buf.byteOffset, len); break;
                        case 11: value = new BigInt64Array(buf.buffer, buf.byteOffset, len); break;
                        case 12: value = new Float64Array(buf.buffer, buf.byteOffset, len); break;
                    }
                } else {
                    value = new Array(len);
                    let lastLog = Date.now();
                    for(let i=0; i<len; i++) {
                        if (i % 5000 === 0 && Date.now() - lastLog > 500) {
                             process.stdout.write(`\rB"H [Import] Reading Array: ${i}/${len} (${((i/len)*100).toFixed(1)}%)   `);
                             lastLog = Date.now();
                        }
                        const r = this._readValue(read, newOffset, aType, decoder);
                        value[i] = r.value;
                        newOffset = r.newOffset;
                    }
                }
                break;
            }
            case 10: value = read(offset, 8).readBigUInt64LE(0); newOffset+=8; break;
            case 11: value = read(offset, 8).readBigInt64LE(0); newOffset+=8; break;
            case 12: value = read(offset, 8).readDoubleLE(0); newOffset+=8; break;
            default: value = 0; newOffset+=0;
        }
        return { value, newOffset };
    }

    _getTypeSize(type) {
        switch (type) {
            case 0:  return { blockElements: 1, blockSize: 4 };    // F32
            case 1:  return { blockElements: 1, blockSize: 2 };    // F16
            case 2:  return { blockElements: 32, blockSize: 18 };   // Q4_0
            case 3:  return { blockElements: 32, blockSize: 20 };   // Q4_1
            case 6:  return { blockElements: 32, blockSize: 22 };   // Q5_0
            case 7:  return { blockElements: 32, blockSize: 24 };   // Q5_1
            case 8:  return { blockElements: 32, blockSize: 34 };   // Q8_0
            case 9:  return { blockElements: 32, blockSize: 40 };   // Q8_1
            case 10: return { blockElements: 256, blockSize: 84 };  // Q2_K 
            case 11: return { blockElements: 256, blockSize: 110 }; // Q3_K
            case 12: return { blockElements: 256, blockSize: 144 }; // Q4_K
            case 13: return { blockElements: 256, blockSize: 176 }; // Q5_K
            case 14: return { blockElements: 256, blockSize: 210 }; // Q6_K
            case 15: return { blockElements: 256, blockSize: 256 }; // Q8_K
            case 16: return { blockElements: 256, blockSize: 66 };  // IQ2_XXS
            case 17: return { blockElements: 256, blockSize: 74 };  // IQ2_XS
            case 18: return { blockElements: 256, blockSize: 88 };  // IQ3_XXS
            case 19: return { blockElements: 256, blockSize: 56 };  // IQ1_S
            case 20: return { blockElements: 32, blockSize: 18 };   // IQ4_NL
            case 21: return { blockElements: 256, blockSize: 112 }; // IQ3_S
            case 22: return { blockElements: 256, blockSize: 80 };  // IQ2_S
            case 23: return { blockElements: 256, blockSize: 144 }; // IQ4_XS
            case 24: return { blockElements: 1, blockSize: 1 };     // I8
            case 25: return { blockElements: 1, blockSize: 2 };     // I16
            case 26: return { blockElements: 1, blockSize: 4 };     // I32
            case 30: return { blockElements: 1, blockSize: 2 };     // BF16
            default: throw new Error(`[GGUF] CRITICAL: Unknown Tensor Type ID: ${type}.`);
        }
    }
}

module.exports = GGUFImporter;
