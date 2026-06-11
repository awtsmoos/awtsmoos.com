// B"H
const fs = require("fs");
const path = "app/ect-storage-codec.js";
let text = fs.readFileSync(path, "utf8");
const pattern = /  function buildRamImage\(bytes\) \{[\s\S]*?\n  \}\r?\n\r?\n  function buildDictionary/;
const replacement = `  /**
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
  }

  function buildDictionary`;
if (!pattern.test(text)) throw new Error("buildRamImage regex not found");
text = text.replace(pattern, replacement);
fs.writeFileSync(path, text);
console.log("installed direct RAM image", Buffer.byteLength(text));
