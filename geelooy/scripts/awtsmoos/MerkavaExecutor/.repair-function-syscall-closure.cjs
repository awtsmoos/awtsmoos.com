// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace('31: setProp, 32: makeFunction, 33:', '31: setProp, 32: node => makeFunction(node, rootScope), 33:');
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, patched: text.includes('32: node => makeFunction(node, rootScope)') }, null, 2));
