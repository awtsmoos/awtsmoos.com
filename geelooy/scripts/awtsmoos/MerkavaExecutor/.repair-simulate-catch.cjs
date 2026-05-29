// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/core/simulateRuntime.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = 'const raw = await assembler.run(hydrated.entry);';
const newText = `let raw;
  try {
    raw = await assembler.run(hydrated.entry);
  } catch (error) {
    raw = {
      ok: false,
      assembly: null,
      result: {
        ok: false,
        error: error.message,
        stack: error.stack || '',
        code: error.code || null,
        trace: error.trace || null,
        snapshot: null
      },
      runtime: null,
      graph: null,
      console: []
    };
  }`;
if (!text.includes(oldText)) throw new Error('simulateRuntime assembler line not found');
text = text.replace(oldText, newText);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasCatch: text.includes('trace: error.trace') }, null, 2));
