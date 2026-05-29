// B"H
const fs = require('fs');
const lowerer = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
const host = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let l = fs.readFileSync(lowerer, 'utf8');
l = l.replace("const UNARY = { '!': 'not', '-': 'neg', '+': 'pos' };", "const UNARY = { '!': 'not', '-': 'neg', '+': 'pos', typeof: 'typeof', void: 'void' };");
fs.writeFileSync(lowerer, l);
let h = fs.readFileSync(host, 'utf8');
if (!h.includes("node.op === 'typeof'")) {
  h = h.replace("if (node.op === 'pos') return +interpretNode(node.value, scope, depth + 1);", "if (node.op === 'pos') return +interpretNode(node.value, scope, depth + 1);\n      if (node.op === 'typeof') return typeof interpretNode(node.value, scope, depth + 1);\n      if (node.op === 'void') return void interpretNode(node.value, scope, depth + 1);");
}
fs.writeFileSync(host, h);
console.log(JSON.stringify({ ok: true, lowerer: l.includes('typeof'), host: h.includes("node.op === 'typeof'") }, null, 2));
