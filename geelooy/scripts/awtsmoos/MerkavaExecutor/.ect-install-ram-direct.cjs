// B"H
const fs = require("fs");
const path = "app/ect-storage-codec.js";
let text = fs.readFileSync(path, "utf8");
const oldBlock = `  function buildRamImage(bytes) {
    const stream = new Uint8Array(bytes);
    const sections = new Uint16Array([0, stream.length]);
    const total = stream.length + sections.byteLength;
    return {
      stream,
      sections,
      totalBytes: total,
      summary: {
        streamBytes: stream.length,
        sectionBytes: sections.byteLength,
        totalBytes: total,
        typedArraysOnly: true,
        mode: "compact-single-stream-ram"
      }
    };
  }`;
const newBlock = `  /**
   * B"H. Direct RAM vessel: no duplicate constants, no JS object graph, and no
   * per-project section header when the semantic VM has one contiguous stream.
   */
  function buildRamImage(bytes) {
    const stream = new Uint8Array(bytes);
    return {
      stream,
      totalBytes: stream.byteLength,
      summary: {
        streamBytes: stream.byteLength,
        sectionBytes: 0,
        totalBytes: stream.byteLength,
        typedArraysOnly: true,
        mode: "direct-single-stream-ram"
      }
    };
  }`;
if (!text.includes(oldBlock)) throw new Error("buildRamImage block not found");
text = text.replace(oldBlock, newBlock);
fs.writeFileSync(path, text);
console.log("installed direct RAM image", Buffer.byteLength(text));
