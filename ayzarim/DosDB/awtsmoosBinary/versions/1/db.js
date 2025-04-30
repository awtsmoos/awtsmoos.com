// B"H
import { promises as fs } from "fs";
import path from "path";
import { serialize, deserialize, hash, serializeObjectOrMap } from "./helpers.js";

class Database {
  constructor(dir, { chunkSize = 100, superChunkSize = 100, shardSize = 64 * 1024 * 1024 } = {}) {
    this.dir = dir;
    this.chunkSize = chunkSize;
    this.superChunkSize = superChunkSize;
    this.shardSize = shardSize;
    this.bmp = Buffer.alloc(125); // Garbage bitmap
    this.shardCount = 0;
    this.init();
  }

  async init() {
    await fs.mkdir(this.dir, { recursive: true });
    try {
      await fs.readFile(path.join(this.dir, "index.bin"));
      this.bmp = await fs.readFile(path.join(this.dir, "garbage.bmp"));
      const files = await fs.readdir(this.dir);
      this.shardCount = files.filter(f => f.startsWith("shard") && f.endsWith(".bin")).length;
      console.log("Initialized with", this.shardCount, "shards");
    } catch (e) {
      console.log("New database created");
      await fs.writeFile(path.join(this.dir, "index.bin"), Buffer.alloc(0));
      await fs.writeFile(path.join(this.dir, "garbage.bmp"), this.bmp);
    }
  }

  async write(keyPath, value) {
    const parts = keyPath.split("/").filter(Boolean);
    let currentKey = "";
    let currentValue = null;
  
    for (let i = 0; i < parts.length; i++) {
      currentKey = i === 0 ? `/${parts[0]}` : `${currentKey}/${parts[i]}`;
      if (i === parts.length - 1) {
        currentValue = value;
      } else {
        currentValue = await this.read(currentKey) || (parts[i + 1].match(/^\d+$/) ? [] : {});
      }
  
      if (Array.isArray(currentValue)) {
        await this.writeArray(currentKey, currentValue, parts[i + 1]);
      } else {
        if (i < parts.length - 1) {
          const nextPart = parts[i + 1];
          if (!nextPart.match(/^\d+$/)) {
            const nextValue = await this.read(`${currentKey}/${nextPart}`);
            currentValue[nextPart] = nextValue !== null ? nextValue : (parts[i + 2]?.match(/^\d+$/) ? [] : {});
          }
        }
        // Handle nested arrays within objects
        await this.writeNestedObject(currentKey, currentValue);
      }
    }

}
  

  async writeNestedObject(key, obj) {
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) {
        await this.writeArray(`${key}/${k}`, v);
        // Store the array metadata directly instead of re-reading
        const metaKey = `${key}/${k}:meta`;
        const meta = await this.readRaw(metaKey);
        if (meta) {
          obj[k] = { array: true, length: v.length, meta: metaKey.split(':meta')[0] };
        }
      } else if (typeof v === "object" && v !== null) {
        await this.writeNestedObject(`${key}/${k}`, v);
      }
    }
    const data = serialize(obj);
    const shard = await this.appendToShard(data, key);
   
}

  
  async writeArray(key, array, nextPart) {
    const metaKey = `${key}:meta`;
    let meta = (await this.readRaw(metaKey)) || { type: 0x03, num: 0, entries: {} };
   
    
    if (nextPart && nextPart.match(/^\d+$/)) {
      // Writing to a specific index (keep this as is)
      const index = parseInt(nextPart, 10);
      const chunkNum = Math.floor(index / this.chunkSize);
      const chunkKey = `${key}:chunk:${chunkNum}`;
      let chunk = await this.readRaw(chunkKey);
      if (!chunk) {
        chunk = { type: 0x06, num: 0, elements: Array(this.chunkSize).fill(null) };
        meta.entries[chunkNum.toString()] = chunkKey;
      }
      chunk.elements[index % this.chunkSize] = array;
      chunk.num = Math.max(chunk.num, (index % this.chunkSize) + 1);
      const chunkData = this.serializeChunk(chunk);
      const chunkShard = await this.appendToShard(chunkData, chunkKey);
     
      meta.num = Math.max(meta.num, index + 1);
    } else {
      // Writing the entire array
      const totalChunks = Math.ceil(array.length / this.chunkSize);
      for (let c = 0; c < totalChunks; c++) {
        const start = c * this.chunkSize;
        const end = Math.min(start + this.chunkSize, array.length);
        const chunkElements = array.slice(start, end);
        const chunk = {
          type: 0x06,
          num: chunkElements.length,
          elements: chunkElements.concat(Array(this.chunkSize - chunkElements.length).fill(null))
        };
        const chunkKey = `${key}:chunk:${c}`;
        const chunkData = this.serializeChunk(chunk);
        const chunkShard = await this.appendToShard(chunkData, chunkKey);
     
        meta.entries[c.toString()] = chunkKey;
      }
      meta.num = array.length;
    }
  
    const metaData = serializeObjectOrMap(Object.entries(meta.entries));
    const metaShard = await this.appendToShard(metaData, metaKey);
  
    await this.updateRoot(key, metaKey, meta.num);
  }
  
  async splitChunk(key, chunkNum, chunk, fullArray) {
    const newChunkNum = chunkNum + 1;
    const newChunkKey = `${key}:chunk:${newChunkNum}`;
    const mid = Math.floor(chunk.elements.length / 2);
    const remaining = fullArray.slice(chunkNum * this.chunkSize);
    const newChunk = {
      type: 0x06,
      num: Math.min(remaining.length - mid, this.chunkSize),
      elements: remaining.slice(mid, mid + this.chunkSize).concat(Array(this.chunkSize - (remaining.length - mid)).fill(null)).slice(0, this.chunkSize)
    };
    chunk.num = mid;
    chunk.elements = remaining.slice(0, mid).concat(Array(this.chunkSize - mid).fill(null)).slice(0, this.chunkSize);
    
    await this.writeChunk(newChunkKey, newChunk);
    await this.writeChunk(`${key}:chunk:${chunkNum}`, chunk);
    const metaKey = `${key}:meta`;
    const meta = await this.readRaw(metaKey);
    meta.entries[newChunkNum.toString()] = newChunkKey;
    meta.num = fullArray.length;
    await this.updateMeta(metaKey, meta);
  }

  async writeObject(key, obj, nextPart, parts, i) {
    if (nextPart && !nextPart.match(/^\d+$/)) {
      obj[nextPart] = (await this.read(`${key}/${nextPart}`)) || (parts[i + 1].match(/^\d+$/) ? [] : {});
    }
    const data = serialize(obj);
    const shard = await this.appendToShard(data, key);
  
}

  async read(keyPath, options = {}) {
    const parts = keyPath.split("/").filter(Boolean);
    let currentKey = "";
    let result = null;

    for (let i = 0; i < parts.length; i++) {
      currentKey = i === 0 ? `/${parts[0]}` : `${currentKey}/${parts[i]}`;
      const data = await this.readRaw(currentKey);
      if (!data) {
      
        if (i === 0 && parts.length > 1) {
          const children = await this.listChildren(currentKey);
          if (children.length) {
            result = Object.fromEntries(children.map(k => [k.split("/")[i + 1], null]));
            continue;
          }
        }
        return null;
      }

      if (data.type === 0x05) {
        result = await this.readArray(currentKey, options);
      } else if (data.type === 0x04 || data.type === 0x07) {
        result = data.value;
      } else {
        result = data;
      }

      if (i < parts.length - 1) {
        if (parts[i + 1].match(/^\d+$/)) {
          result = result[parseInt(parts[i + 1], 10)];
        } else {
          result = result[parts[i + 1]];
        }
      }
    }
  
    return result;
  }

  async listChildren(prefix) {
    const indexBuffer = await fs.readFile(path.join(this.dir, "index.bin"));
    const children = [];
    for (let i = 0; i < indexBuffer.length; i += 24) {
      const keyHash = indexBuffer.slice(i, i + 16);
      if (keyHash.readUInt8(0) !== 0) {
        const offset = Number(indexBuffer.readBigUInt64BE(i + 16));
        const shardId = Math.floor(offset / this.shardSize);
        const shardOffset = offset - shardId * this.shardSize;
        const shardFile = path.join(this.dir, `shard${shardId}.bin`);
        const buffer = await fs.readFile(shardFile);
        const nextOffset = await this.findNextOffset(shardId, shardOffset, buffer);
        const key = Buffer.from(keyHash).toString("hex");
        if (key.startsWith(hash(prefix).toString("hex"))) {
          children.push(key);
        }
      }
    }
    return children;
  }

  async readArray(key, { page = 0, pageSize = this.chunkSize } = {}) {
    const metaKey = `${key}:meta`;
    const meta = await this.readRaw(metaKey);
    if (!meta || !meta.entries) return [];
    const start = page * pageSize;
    const end = Math.min(start + pageSize, meta.num);
    const result = [];
    for (let i = start; i < end; i++) {
      const chunkNum = Math.floor(i / this.chunkSize);
      const chunkKey = meta.entries[chunkNum.toString()];
      if (!chunkKey) continue;
      const chunk = await this.readRaw(chunkKey);
      if (!chunk || !chunk.elements) continue;
      const element = chunk.elements[i % this.chunkSize];
      if (element !== null) result.push(element);
    }
    return result;
  }

  async delete(keyPath) {
    const parts = keyPath.split("/").filter(Boolean);
    let currentKey = `/${parts[0]}`;
    const parentKey = parts.length > 1 ? `/${parts.slice(0, -1).join("/")}` : null;
    const lastPart = parts[parts.length - 1];

    if (parentKey) {
      const parent = await this.readRaw(parentKey);
      if (!parent) {
        console.log(`Parent ${parentKey} not found`);
        return;
      }
      if (parent.type === 0x05) {
        const metaKey = `${parentKey}:meta`;
        const meta = await this.readRaw(metaKey);
        if (!meta) return;
        const chunkNum = Math.floor(parseInt(lastPart, 10) / this.chunkSize);
        const chunkKey = meta.entries[chunkNum.toString()];
        if (!chunkKey) return;
        const chunk = await this.readRaw(chunkKey);
        if (chunk) {
          chunk.elements[lastPart % this.chunkSize] = null;
          chunk.num = chunk.elements.filter(e => e !== null).length;
          await this.writeChunk(chunkKey, chunk);
          meta.num = Object.values(meta.entries).reduce((sum, k) => {
            const c = this.readRaw(k);
            return sum + (c ? c.num : 0);
          }, 0);
          await this.updateMeta(metaKey, meta);
          await this.updateRoot(parentKey, metaKey, meta.num);
        }
      } else if (parent.type === 0x04) {
        delete parent.value[lastPart];
        await this.writeObject(parentKey, parent.value);
      }
    } else {
      const indexBuffer = await fs.readFile(path.join(this.dir, "index.bin"));
      const keyHash = hash(currentKey);
      for (let i = 0; i < indexBuffer.length; i += 24) {
        if (indexBuffer.slice(i, i + 16).equals(keyHash)) {
          const offset = Number(indexBuffer.readBigUInt64BE(i + 16));
          const shardId = Math.floor(offset / this.shardSize);
          this.bmp[Math.floor(shardId / 8)] |= 1 << (shardId % 8);
          await fs.writeFile(path.join(this.dir, "garbage.bmp"), this.bmp);
          break;
        }
      }
    }
   
}

  async appendToShard(data, key) {
    const shardId = this.shardCount > 0 ? this.shardCount - 1 : 0;
    const shardFile = path.join(this.dir, `shard${shardId}.bin`);
    let offset = 0;
    try {
      const stat = await fs.stat(shardFile);
      offset = stat.size;
    } catch (e) {
      // New shard
    }

    if (offset + data.length > this.shardSize) {
      this.shardCount++;
      const newShardId = this.shardCount - 1;
      const newShardFile = path.join(this.dir, `shard${newShardId}.bin`);
      await fs.writeFile(newShardFile, data);
      await this.updateIndex(key, newShardId * this.shardSize);
      await this.updateShardIndex(newShardId, key, 0);
      if (newShardId >= this.bmp.length * 8) {
        const newBmp = Buffer.alloc(this.bmp.length * 2);
        this.bmp.copy(newBmp);
        this.bmp = newBmp;
        await fs.writeFile(path.join(this.dir, "garbage.bmp"), this.bmp);
      }
      return { id: newShardId, offset: newShardId * this.shardSize };
    }

    await fs.appendFile(shardFile, data);
    await this.updateIndex(key, shardId * this.shardSize + offset);
    await this.updateShardIndex(shardId, key, offset);
    return { id: shardId, offset: shardId * this.shardSize + offset };
  }

  async updateIndex(key, offset) {
    const indexFile = path.join(this.dir, "index.bin");
    let indexBuffer = Buffer.alloc(0);
    try {
      indexBuffer = await fs.readFile(indexFile);
    } catch (e) {
      // File might not exist yet
    }
    const keyHash = hash(key);
    const offsetBuf = Buffer.alloc(8);
    offsetBuf.writeBigUInt64BE(BigInt(offset), 0);
    let found = false;
    for (let i = 0; i < indexBuffer.length; i += 24) {
      if (indexBuffer.slice(i, i + 16).equals(keyHash)) {
        offsetBuf.copy(indexBuffer, i + 16);
        found = true;
        break;
      }
    }
    if (!found) {
      indexBuffer = Buffer.concat([indexBuffer, keyHash, offsetBuf]);
    }
  
    await fs.writeFile(indexFile, indexBuffer);
  }

  async updateShardIndex(shardId, key, offset) {
    const shardIndexFile = path.join(this.dir, `shard${shardId}.index`);
    let shardIndexBuffer = Buffer.alloc(0);
    try {
      shardIndexBuffer = await fs.readFile(shardIndexFile);
    } catch (e) {
      // File might not exist yet
    }
    const keyHash = hash(key);
    const offsetBuf = Buffer.alloc(8);
    offsetBuf.writeBigUInt64BE(BigInt(offset), 0);
    let found = false;
    for (let i = 0; i < shardIndexBuffer.length; i += 24) {
      if (shardIndexBuffer.slice(i, i + 16).equals(keyHash)) {
        offsetBuf.copy(shardIndexBuffer, i + 16);
        found = true;
        break;
      }
    }
    if (!found) {
      shardIndexBuffer = Buffer.concat([shardIndexBuffer, keyHash, offsetBuf]);
    }
    await fs.writeFile(shardIndexFile, shardIndexBuffer);
  }

  async updateMeta(metaKey, meta) {
    const data = serializeObjectOrMap(Object.entries(meta.entries));
    await this.appendToShard(data, metaKey);
  }

  async updateRoot(key, metaKey, num) {
    const data = Buffer.concat([
      Buffer.from([0x05, metaKey.length + 2]),
      Buffer.from([num >>> 8, num & 0xFF]),
      Buffer.from(metaKey),
    ]);
    await this.appendToShard(data, key);
  }


  async writeChunk(chunkKey, chunk) {
    const data = this.serializeChunk(chunk);
    await this.appendToShard(data, chunkKey);
  }


  serializeChunk(chunk) {
    const numBuf = Buffer.alloc(2);
    numBuf.writeUInt16BE(chunk.num, 0);
    const buffers = [numBuf];
    const elements = [];
    const headerSize = 1 + 2 + chunk.num * 8; // Type (0x06) + num + offsets
    let dataOffset = 0; // Relative to start of elements section
    for (let i = 0; i < chunk.num; i++) {
      const element = chunk.elements[i] || null;
      const data = serialize(element);
      const offsetBuf = Buffer.alloc(8);
      offsetBuf.writeBigUInt64BE(BigInt(headerSize + dataOffset), 0);
      buffers.push(offsetBuf);
      elements.push(data);
      dataOffset += data.length;
    }
    return Buffer.concat([Buffer.from([0x06]), Buffer.concat(buffers), ...elements]);
  }



  async readRaw(key) {
    const indexBuffer = await fs.readFile(path.join(this.dir, "index.bin"));
  //  console.log(`Index buffer size: ${indexBuffer.length}, hex: ${indexBuffer.toString("hex")}`);
    const keyHash = hash(key);
   // console.log(`Looking for key ${key} with hash: ${keyHash.toString("hex")}`);
    for (let i = 0; i < indexBuffer.length; i += 24) {
      const entryHash = indexBuffer.subarray(i, i + 16);
      if (entryHash.equals(keyHash)) {
        const offset = Number(indexBuffer.readBigUInt64BE(i + 16));
        const shardId = Math.floor(offset / this.shardSize);
        const shardOffset = offset - shardId * this.shardSize;
        const shardFile = path.join(this.dir, `shard${shardId}.bin`);
        const buffer = await fs.readFile(shardFile);
     //   console.log(`Shard ${shardId} size: ${buffer.length}, hex: ${buffer.toString("hex").slice(0, 100)}...`);
        const nextOffset = await this.findNextOffset(shardId, shardOffset, buffer);
   //     console.log(`Reading ${key} from shard ${shardId} at ${shardOffset}-${nextOffset}`);
        const subBuffer = buffer.subarray(shardOffset, nextOffset);
   //     console.log(`Sub-buffer size: ${subBuffer.length}, hex: ${subBuffer.toString("hex")}`);
        return await deserialize(subBuffer);
      }
    }
   // console.log(`Key ${key} not found in index`);
    return null;
  }

  

  
  async findNextOffset(shardId, startOffset, buffer) {
    const shardIndexFile = path.join(this.dir, `shard${shardId}.index`);
    let shardIndexBuffer;
    try {
      shardIndexBuffer = await fs.readFile(shardIndexFile);
    } catch (e) {
      shardIndexBuffer = Buffer.alloc(0);
    }
  //  console.log(`Shard ${shardId} index size: ${shardIndexBuffer.length}, hex: ${shardIndexBuffer.toString("hex")}`);
    let nextOffset = buffer.length;
    for (let i = 0; i < shardIndexBuffer.length; i += 24) {
      const offset = Number(shardIndexBuffer.readBigUInt64BE(i + 16));
     // console.log(`Checking shard index offset: ${offset}`);
      if (offset > startOffset && offset < nextOffset) {
        nextOffset = offset;
     //   console.log(`Found next offset from index: ${nextOffset}`);
      }
    }
    const type = buffer[startOffset];
   // console.log(`Calculating size for type ${type} at ${startOffset}`);

    if (type === 0x04 || type === 0x07) {
        let tableStart = startOffset + 1;
        const num = buffer.readUInt16BE(tableStart);
        tableStart += 2;
        let valuesStart = tableStart;
        for (let i = 0; i < num; i++) {
        if (valuesStart >= buffer.length) break;
        const keyLen = buffer.readUInt8(valuesStart);
        valuesStart += 1 + keyLen + 16 + 4;
        }
        let calcNext = valuesStart;
        tableStart = startOffset + 3;
        for (let i = 0; i < num; i++) {
        const keyLen = buffer.readUInt8(tableStart);
        const offsetPos = tableStart + 1 + keyLen + 16;
        if (offsetPos + 4 > buffer.length) break;
        const relativeOffset = buffer.readUInt32BE(offsetPos);
        if (relativeOffset > buffer.length - valuesStart) continue;
        const valOffset = valuesStart + relativeOffset;
        if (valOffset >= startOffset && valOffset < buffer.length) {
            const valEnd = await this.calculateValueEnd(buffer, valOffset);
            calcNext = Math.max(calcNext, valEnd);
        }
        tableStart += 1 + keyLen + 16 + 4;
        }
        nextOffset = Math.max(nextOffset, calcNext);
    } else if (type === 0x06) {
      const num = buffer.readUInt16BE(startOffset + 1);
      let calcNext = startOffset + 3 + 800;
  //    console.log(`Chunk with ${num} elements`);
      for (let i = 0; i < num && i < this.chunkSize; i++) {
        const valOffset = Number(buffer.readBigUInt64BE(startOffset + 3 + i * 8));
   //     console.log(`Chunk value offset ${i}: ${valOffset}`);
        if (valOffset > 0 && valOffset < buffer.length) {
          const valEnd = await this.calculateValueEnd(buffer, valOffset);
          calcNext = Math.max(calcNext, valEnd);
      //    console.log(`Chunk value end ${i}: ${valEnd}`);
        }
      }
      nextOffset = Math.max(nextOffset, calcNext);
   //   console.log(`Calculated chunk end: ${calcNext}`);
    }
   // console.log(`Final next offset for ${startOffset}: ${nextOffset}`);
    return nextOffset;
  }

  async calculateValueEnd(buffer, start) {
    // Check if start is within bounds
    if (start >= buffer.length) {
      console.log(`Start ${start} is beyond buffer length, returning ${buffer.length}`);
      return buffer.length;
    }
  
    // Read the type byte
    const type = buffer[start];
   // console.log(`Calculating value end at ${start}, type ${type.toString(16)}`);
  
    // Handle basic types
    if (type === 0x00) return start + 2; // Null or small fixed-size type
    if (type === 0x01 || type === 0x02 || type === 0x03) { // Strings or small data
      const length = buffer[start + 1];
      return start + 2 + length;
    }
  
    // Handle objects (type 0x04 or 0x07)
   
    if (type === 0x04 || type === 0x07) {
      let tableStart = start + 1;
      const num = buffer.readUInt16BE(tableStart);
      tableStart += 2;
      let valuesStart = tableStart;
      for (let i = 0; i < num; i++) {
        if (valuesStart >= buffer.length) break;
        const keyLen = buffer.readUInt8(valuesStart);
        valuesStart += 1 + keyLen + 16 + 4;
      }
      let end = valuesStart;
      tableStart = start + 3;
      for (let i = 0; i < num; i++) {
        const keyLen = buffer.readUInt8(tableStart);
        const offsetPos = tableStart + 1 + keyLen + 16;
        if (offsetPos + 4 > buffer.length) break;
        const relativeOffset = buffer.readUInt32BE(offsetPos);
        const valOffset = valuesStart + relativeOffset;
        if (valOffset >= start && valOffset < buffer.length) {
          const valEnd = await this.calculateValueEnd(buffer, valOffset);
          end = Math.max(end, valEnd);
        }
        tableStart += 1 + keyLen + 16 + 4;
      }
      return end;
    }
  
    // Handle other types (e.g., arrays or chunks) as needed
    if (type === 0x05) { // Binary data
      const length = buffer[start + 1];
      return start + 2 + length;
    }
  
    // Fallback for unrecognized types
 //   console.log(`Fallback end for type ${type.toString(16)}: ${start + 2}`);
    return start + 2;
  }
}

export default Database;