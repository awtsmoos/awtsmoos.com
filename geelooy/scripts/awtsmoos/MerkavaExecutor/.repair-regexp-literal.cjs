// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = "if (node.type === 'Literal') return { const: node.value };";
const newText = "if (node.type === 'Literal' && node.regex) return { op: 'new', class: { get: 'RegExp' }, args: [{ const: node.regex.pattern }, { const: node.regex.flags || '' }] };\n    if (node.type === 'Literal') return { const: node.value };";
if (!text.includes('node.regex')) {
  if (!text.includes(oldText)) throw new Error('Literal branch not found');
  text = text.replace(oldText, newText);
}
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasRegex: text.includes('node.regex') }, null, 2));
