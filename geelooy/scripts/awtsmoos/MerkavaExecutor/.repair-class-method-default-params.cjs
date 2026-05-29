// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"    params: (method.value.params || []).map(p => p.name),",
"    params: (method.value.params || []).map(paramName),"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, methodUsesParamName: text.includes('params: (method.value.params || []).map(paramName)') }, null, 2));
