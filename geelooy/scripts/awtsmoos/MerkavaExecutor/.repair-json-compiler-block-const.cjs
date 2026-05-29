// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaJsonCompiler.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace('if (prop && typeof prop === \'object\' && (prop.op || prop.get || prop.const !== undefined || prop.value !== undefined)) return normalizeNode(prop);', "if (prop && typeof prop === 'object' && (prop.op || prop.get || Object.prototype.hasOwnProperty.call(prop, 'const') || prop.value !== undefined)) return normalizeNode(prop);");
text = text.replace('if (node.const !== undefined) return pushConst(bytecode, constants, node.const);', "if (Object.prototype.hasOwnProperty.call(node, 'const')) return pushConst(bytecode, constants, node.const);");
if (!text.includes("node.op === 'block'")) {
  text = text.replace(
    "    if (node.op === 'try') {",
    "    if (node.op === 'block') { emitBlock(node.body || []); pushConst(bytecode, constants, undefined); return; }\n    if (node.op === 'try') {"
  );
}
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, block: text.includes("node.op === 'block'"), constOwn: text.includes("hasOwnProperty.call(node, 'const')") }, null, 2));
