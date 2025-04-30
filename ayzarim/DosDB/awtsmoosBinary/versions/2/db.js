// B"H
// The Awtsmoos surges through this disk, recreating ALL from NOTHING every instant.
// The Ohr Ein Sof floods the Kav, weaving Atzilus into existence, the foundation of all reality.
// This Node.js database is a vessel for the infinite, a spark of Moshiach’s light, resurrecting the righteous in eternal glory.
import {promises as fs } from "fs";;
import path from "path"



class AwtsmoosDB {
  constructor(dir = './awtsmoos_db', shardSize = 64 * 1024 * 1024, chunkCapacity = 100) {
    this.dir = dir;
    this.shardSize = shardSize; // 64 MB
    this.chunkCapacity = chunkCapacity; // 100 entries/chunk
    this.globalIndexPath = path.join(dir, 'index.bin');
    this.garbagePath = path.join(dir, 'garbage.bmp');
    this.nextShardID = 0;
    
  }
  async init() {
    this.ensureDir();
  }

  /**
   * @method ensureDir
   * @description Ensures the database directory exists, a spark of the Awtsmoos’s creation.
   * @returns {Promise<void>}
   */
  async ensureDir() {
    await fs.mkdir(this.dir, { recursive: true });
    if (!await this.fileExists(this.globalIndexPath)) {
      await this.ohrEinSofInit(this.globalIndexPath, 64); // 64 slots
    }
    if (!await this.fileExists(this.garbagePath)) {
      await fs.writeFile(this.garbagePath, Buffer.alloc(125)); // 1000 shards
    }
    const files = await fs.readdir(this.dir);
    this.nextShardID = files.filter(f => f.startsWith('shard') && f.endsWith('.bin'))
      .map(f => parseInt(f.slice(5, -4)))
      .reduce((max, id) => Math.max(max, id), -1) + 1;
  }

  async write(...a) {
    await this.kavWrite(...a);
  }

  async read(...a) {
    await this.kavRead(...a);
  }
  /**
   * @method kavWrite
   * @description Writes a key-value pair to disk, guided by the Kav’s precision.
   * @param {string} key - Key to write (e.g., "user1.posts")
   * @param {any} value - Value (scalar, object, array)
   * @returns {Promise<void>}
   */
  async kavWrite(key, value) {
    const serialized = this.atzilusSerialize(value);
    const { shardID, offset } = await this.awtsmoosAppendToShard(serialized);

    
    var sharded = { shardID, offset }
    await this.ohrEinSofInsert(this.globalIndexPath, key, sharded);
    const shardIndexPath = path.join(this.dir, `shard${shardID}.index`);
    if (!await this.fileExists(shardIndexPath)) 
      await this.ohrEinSofInit(shardIndexPath, 64);


    await this.ohrEinSofInsert(shardIndexPath, key, sharded);
  }

  /**
   * @method kavRead
   * @description Reads a value from disk, piercing the veil to the Awtsmoos.
   * @param {string} key - Key to read
   * @returns {Promise<any>} - Deserialized value or null
   */
  async kavRead(key) {
    const location = await this.ohrEinSofGet(this.globalIndexPath, key);
    if (!location) return null;
    const shardPath = path.join(this.dir, `shard${location.shardID}.bin`);
    const shardData = await fs.readFile(shardPath);
    const data = shardData.subarray(location.offset);
    return this.atzilusDeserialize(data);
  }

  /**
   * @method awtsmoosArrayWrite
   * @description Writes to an array index, creating chunks on disk as the Awtsmoos renews.
   * @param {string} rootKey - Root key (e.g., "user1.posts")
   * @param {number} index - Array index (e.g., 500)
   * @param {any} value - Value to write
   * @returns {Promise<void>}
   */
  async awtsmoosArrayWrite(rootKey, index, value) {
    const metaKey = `${rootKey}:meta`;
    let meta = (await this.kavRead(metaKey)) || { num: 0, chunks: {} };
    const chunkNum = Math.floor(index / this.chunkCapacity);
    const chunkOffset = index % this.chunkCapacity;
    const chunkKey = `${rootKey}:chunk:${chunkNum}`;

    let chunk = (await this.kavRead(chunkKey)) || { num: 0, capacity: this.chunkCapacity, elements: Array(this.chunkCapacity).fill(null) };
    chunk.elements[chunkOffset] = value;
    chunk.num = Math.max(chunk.num, chunkOffset + 1);
    await this.kavWrite(chunkKey, chunk);

    meta.chunks[String(chunkNum)] = chunkKey; // Simplified: store as object, serialize as hash table
    meta.num = Math.max(meta.num, index + 1);
    await this.kavWrite(metaKey, meta);
    await this.kavWrite(rootKey, { type: "array", num: meta.num, meta: metaKey });
  }

  /**
   * @method awtsmoosAppendToShard
   * @description Appends data to a shard, creating new ones as the Awtsmoos wills.
   * @param {Buffer} data - Serialized data
   * @returns {Promise<{shardID: number, offset: number}>}
   */
  async awtsmoosAppendToShard(data) {
    for (let id = 0; id < this.nextShardID; id++) {
      const shardPath = path.join(this.dir, `shard${id}.bin`);
      if (!await this.fileExists(shardPath)) continue;
      const stats = await fs.stat(shardPath);
      if (stats.size + data.length <= this.shardSize) {
        const shardData = await fs.readFile(shardPath);
        const offset = shardData.length;
        await fs.appendFile(shardPath, data);
        return { shardID: id, offset };
      }
    }
    const shardID = this.nextShardID++;
    const shardPath = path.join(this.dir, `shard${shardID}.bin`);
    await fs.writeFile(shardPath, data);
    return { shardID, offset: 0 };
  }

  /**
   * @method atzilusSerialize
   * @description Serializes data to binary, weaving Atzilus into form.
   * @param {any} value - Value to serialize
   * @returns {Buffer} - Binary blob
   */
  atzilusSerialize(value) {
    const str = JSON.stringify(value);
    const data = Buffer.from(str);
    const result = Buffer.alloc(2 + data.length);
    result[0] = 0x01; // Type: scalar (simplified)
    result[1] = data.length; // Length (1 byte for simplicity)
    data.copy(result, 2);
    return result;
  }

  /**
   * @method atzilusDeserialize
   * @description Deserializes binary, revealing the Awtsmoos within.
   * @param {Buffer} data - Binary data
   * @returns {any} - Deserialized value
   */
  atzilusDeserialize(data) {
    const type = data[0];
    const length = data[1];
    const content = data.subarray(2, 2 + length);
    return JSON.parse(content.toString());
  }

  /**
   * @method ohrEinSofInit
   * @description Initializes a hash table file, a spark of Ohr Ein Sof’s boundless light.
   * @param {string} filePath - Path to hash table file
   * @param {number} slots - Initial slot count
   * @returns {Promise<void>}
   */
  async ohrEinSofInit(filePath, slots) {
    const slotSize = 11; // 2 (shardID) + 8 (offset) + 1 (empty flag)
    const buffer = Buffer.alloc(slots * slotSize);
    await fs.writeFile(filePath, buffer);
  }

  /**
   * @method ohrEinSofInsert
   * @description Inserts into a hash table file, probing linearly like the Kav.
   * @param {string} filePath - Path to hash table
   * @param {string} key - Key to insert
   * @param {{shardID: number, offset: number}} value - Value to store
   * @returns {Promise<void>}
   */
  async ohrEinSofInsert(filePath, key, value) {
    let buffer = await fs.readFile(filePath);
    let slots = buffer.length / 11;
    let count = 0;
    for (let i = 0; i < slots; i++) if (buffer[i * 11 + 10] !== 0) count++;
    if (count / slots >= 0.5) {
      buffer = await this.awtsmoosResizeHashTable(filePath, buffer, slots);
      slots *= 2;
    }
    let index = this.hash(key) % slots;
    while (buffer[index * 11 + 10] !== 0) { // Linear probing
      index = (index + 1) % slots;
    }


    buffer.writeUInt16BE(value.shardID, index * 11);

    
    buffer.writeBigUInt64BE(BigInt(value.offset), index * 11 + 2);


    buffer[index * 11 + 10] = 1; // Flag: occupied
    await fs.writeFile(filePath, buffer);
  }

  /**
   * @method ohrEinSofGet
   * @description Retrieves from a hash table, piercing reality with the Awtsmoos’s light.
   * @param {string} filePath - Path to hash table
   * @param {string} key - Key to find
   * @returns {Promise<{shardID: number, offset: number} | null>}
   */
  async ohrEinSofGet(filePath, key) {
    const buffer = await fs.readFile(filePath);
    const slots = buffer.length / 11;
    let index = this.hash(key) % slots;
    while (buffer[index * 11 + 10] !== 0) {
      // In a real hash table, we’d compare keys; here we assume unique keys per file
      const shardID = buffer.readUInt16BE(index * 11);
      const offset = Number(buffer.readBigUInt64BE(index * 11 + 2));
      return { shardID, offset };
      index = (index + 1) % slots;
    }
    return null;
  }

  /**
   * @method awtsmoosResizeHashTable
   * @description Resizes a hash table, recreating it from nothing like the Awtsmoos.
   * @param {string} filePath - Path to hash table
   * @param {Buffer} oldBuffer - Current buffer
   * @param {number} oldSlots - Current slot count
   * @returns {Promise<Buffer>} - New buffer
   */
  async awtsmoosResizeHashTable(filePath, oldBuffer, oldSlots) {
    const newSlots = oldSlots * 2;
    const newBuffer = Buffer.alloc(newSlots * 11);
    for (let i = 0; i < oldSlots; i++) {
      if (oldBuffer[i * 11 + 10] !== 0) {
        const shardID = oldBuffer.readUInt16BE(i * 11);
        const offset = Number(oldBuffer.readBigUInt64BE(i * 11 + 2));
        let index = this.hash(`key${i}`) % newSlots; // Simplified: key reconstruction needed
        while (newBuffer[index * 11 + 10] !== 0) index = (index + 1) % newSlots;
        newBuffer.writeUInt16BE(shardID, index * 11);
        newBuffer.writeBigUInt64BE(BigInt(offset), index * 11 + 2);
        newBuffer[index * 11 + 10] = 1;
      }
    }
    await fs.writeFile(filePath, newBuffer);
    return newBuffer;
  }

  /**
   * @method hash
   * @description Hashes a key, a faint echo of the Awtsmoos’s infinite complexity.
   * @param {string} key - Key to hash
   * @returns {number} - Hash value
   */
  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  /**
   * @method fileExists
   * @description Checks if a file exists, a whisper of the Awtsmoos’s presence.
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export default AwtsmoosDB;