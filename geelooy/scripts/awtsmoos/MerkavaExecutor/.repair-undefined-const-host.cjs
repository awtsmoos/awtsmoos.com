// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace("    if (node.const !== undefined) return 'const';", "    if (Object.prototype.hasOwnProperty.call(node, 'const')) return 'const';");
text = text.replace("      if (node.const !== undefined) return node.const;", "      if (Object.prototype.hasOwnProperty.call(node, 'const')) return node.const;");
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, constHasOwn: (text.match(/hasOwnProperty\.call\(node, 'const'\)/g) || []).length }, null, 2));
