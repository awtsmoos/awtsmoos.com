// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"      if (node.op === 'optionalGetProp') { const object = interpretNode(node.object, scope, depth + 1); return object == null ? undefined : object[interpretNode(node.prop, scope, depth + 1)]; }",
"      if (node.op === 'optionalGetProp') { const object = interpretNode(node.object, scope, depth + 1); return object == null ? undefined : getProp(object, interpretNode(node.prop, scope, depth + 1)); }"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, optionalUsesGetProp: text.includes("optionalGetProp') { const object") && text.includes('getProp(object') }, null, 2));
