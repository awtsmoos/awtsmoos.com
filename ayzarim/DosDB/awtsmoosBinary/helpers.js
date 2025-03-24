// helpers.js
import crypto from "crypto";

export function hash(str) {
  return crypto.createHash("sha256").update(str).digest().slice(0, 16);
}

export function serialize(value) {
    if (value === true) return Buffer.from([0x02, 0x00]);
    if (value === false) return Buffer.from([0x03, 0x00]);
    if (typeof value === "string") {
      const data = Buffer.from(value, "utf8");
      return Buffer.concat([Buffer.from([0x01, data.length]), data]);
    }
    if (typeof value === "number") {
      const data = Buffer.alloc(8);
      data.writeDoubleBE(value);
      return Buffer.concat([Buffer.from([0x01, 0x08]), data]);
    }
    if (Array.isArray(value)) {
      const metaKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const lengthBuf = Buffer.alloc(2);
      lengthBuf.writeUInt16BE(value.length, 0);
      return Buffer.concat([Buffer.from([0x05, metaKey.length + 2]), lengthBuf, Buffer.from(metaKey)]);
    }
    if (value && value.array === true) {
      const lengthBuf = Buffer.alloc(2);
      lengthBuf.writeUInt16BE(value.length, 0);
      return Buffer.concat([Buffer.from([0x05, value.meta.length + 2]), lengthBuf, Buffer.from(value.meta)]);
    }
    if (value instanceof Set) {
      const entries = Array.from(value);
      const data = serializeObjectOrMap(entries.map((v, i) => [i.toString(), v]));
      return Buffer.concat([Buffer.from([0x07]), data]);
    }
    if (typeof value === "object" && value !== null) {
      const data = serializeObjectOrMap(Object.entries(value));
      return Buffer.concat([Buffer.from([0x04]), data]);
    }
    return Buffer.from([0x00, 0x00]); // Null/empty marker
  }

  export function serializeObjectOrMap(entries) {
    
    const numBuf = Buffer.alloc(2);
    numBuf.writeUInt16BE(entries.length, 0);
   // console.log(`Serializing object/map with ${entries.length} entries, numBuf: ${numBuf.toString("hex")}`);
    const buffers = [numBuf];
    const values = [];
    let offset = 0;
    for (const [key, value] of entries) {
      const keyBuf = Buffer.from(key, "utf8");
      const keyLen = Buffer.alloc(1);
      keyLen.writeUInt8(keyBuf.length, 0);

      const keyHash = hash(key);
      const valueData = serialize(value);
      const offsetBuf = Buffer.alloc(4);
      offsetBuf.writeUInt32BE(offset, 0);
     // console.log(`Entry ${key}: hash ${keyHash.toString("hex")}, offset ${offset}, valueData ${valueData.toString("hex")}`);
      buffers.push(Buffer.concat([keyLen, keyBuf, keyHash, offsetBuf])); // Store key length, key, hash, offset
      values.push(valueData);
      offset += valueData.length;
    }
    const result = Buffer.concat(buffers.concat(values));
  //  console.log(`Serialized object/map: ${result.toString("hex")}`);
    return result;
  }

  export async function deserialize(buffer,log=false) {
    const type = buffer[0];
   // if(log) console.log("ok",buffer)
    if (type === 0x00) return null;
    if (type === 0x01 || type === 0x02 || type === 0x03) {
      const length = buffer[1];
      const data = buffer.slice(2, 2 + length);
      if (type === 0x01) {
        if (length === 8) return data.readDoubleBE();
        return data.toString("utf8");
      }
      if (type === 0x02) return true;
      if (type === 0x03) return false;
    }
    if (type === 0x04 || type === 0x07) {
      return await deserializeObjectOrMap(buffer.slice(1));
    }
    if (type === 0x05) {
      const length = buffer[1];
      const data = buffer.slice(2, 2 + length);
      return { array: true, length: data.readUInt16BE(0), meta: data.slice(2).toString() };
    }
    if (type === 0x06) {
      return await deserializeChunk(buffer); // Pass full buffer, not sliced
    }
    throw new Error(`Unknown type: ${type}`);
  }


  export async function deserializeObjectOrMap(buffer) {
    const num = buffer.readUInt16BE(0);
    const result = buffer[0] === 0x07 ? new Set() : {};
    const keys = [];
    const offsets = [];
    let tableOffset = 2;
  
    // Step 1: Parse the entry table and collect keys and offsets
    for (let i = 0; i < num; i++) {
      const keyLen = buffer.readUInt8(tableOffset);
      const keyEnd = tableOffset + 1 + keyLen;
      const key = buffer.slice(tableOffset + 1, keyEnd).toString("utf8");
      const offsetPos = keyEnd + 16; // Skip hash
      const offset = buffer.readUInt32BE(offsetPos);
      keys.push(key);
      offsets.push(offset);
      tableOffset += 1 + keyLen + 16 + 4; // Move to next entry
    }
  
    const valuesStart = tableOffset; // Exact start of values section
  
    // Step 2: Slice and deserialize each value
    for (let i = 0; i < num; i++) {
      const start = valuesStart + offsets[i];
      const end = i + 1 < num ? valuesStart + offsets[i + 1] : buffer.length;
      const valueData = buffer.slice(start, end);
      const value = await deserialize(valueData);
      if (buffer[0] === 0x07) result.add(value);
      else result[keys[i]] = value;
    }
  
    return result;
  }



  export async function deserializeChunk(buffer) {
    const type = buffer[0]; // Should be 0x06
    if (type !== 0x06) throw new Error(`Invalid chunk type: ${type}`);
    const num = buffer.readUInt16BE(1);
    const offsetsStart = 3; // After type (1) + num (2)
    const offsetsEnd = offsetsStart + num * 8;
    if (offsetsEnd > buffer.length) {
   //   console.log(`Chunk offsets exceed buffer length: ${offsetsEnd} > ${buffer.length}`);
      return { type: 0x06, num, elements: Array(num).fill(null) };
    }
    const offsets = buffer.slice(offsetsStart, offsetsEnd);
    const elementsStart = offsetsEnd;
    const result = [];
    for (let i = 0; i < num; i++) {
      const offset = Number(offsets.readBigUInt64BE(i * 8));
      const nextOffset = i + 1 < num ? Number(offsets.readBigUInt64BE((i + 1) * 8)) : buffer.length;
      if (offset < elementsStart || offset >= buffer.length || nextOffset > buffer.length || offset > nextOffset) {
        console.log(`Invalid offset ${offset} for element ${i}`);
        result[i] = null;
        continue;
      }
      const data = buffer.slice(offset, nextOffset);
      result[i] = data.length ? await deserialize(data) : null;

     // console.log(`Deserializing chunk: num=${num}, offsets=${offsets.toString("hex")}`);
    }
    return { type: 0x06, num, elements: result };
  }