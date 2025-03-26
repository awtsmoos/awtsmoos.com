// helpers.js


var fs = require("fs")
var path = require("path")
module.exports = {
    deserializeChunk,
    ensureDir
  }


  function ensureDir(dir) {
    try {
      fs.mkdirSync(path.dirname(dir), {
        recursive: true
      })
    } catch(e){
      console.log(e)
    }
  }

  async function deserializeChunk(buffer) {
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