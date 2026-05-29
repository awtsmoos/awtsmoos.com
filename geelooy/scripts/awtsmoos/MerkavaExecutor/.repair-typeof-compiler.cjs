// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonCompiler.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace("['not','neg','pos'].includes(node.op)", "['not','neg','pos','typeof','void'].includes(node.op)");
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasTypeof: text.includes("'typeof'") }, null, 2));
