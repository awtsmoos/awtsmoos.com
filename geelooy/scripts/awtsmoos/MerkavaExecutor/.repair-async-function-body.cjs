// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const oldText = "else if (stmt.async) target.push({ op: 'set', name: stmt.id.name, value: { op: 'asyncFunction', result: returnExpr(stmt.body) } });";
const newText = "else if (stmt.async) target.push({ op: 'set', name: stmt.id.name, value: fnDescriptor(stmt) });";
if (!text.includes(oldText)) throw new Error('async FunctionDeclaration lowering branch not found');
text = text.replace(oldText, newText);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, patched: text.includes(newText) }, null, 2));
