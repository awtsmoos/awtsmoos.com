// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
  "if (node.type === 'Literal' && node.regex) return { op: 'new', class: { get: 'RegExp' }, args: [{ const: node.regex.pattern }, { const: node.regex.flags || '' }] };",
  "if (node.type === 'Literal' && node.regex) return { const: new RegExp(node.regex.pattern, node.regex.flags || '') };"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, nativeConst: text.includes('new RegExp(node.regex.pattern') }, null, 2));
