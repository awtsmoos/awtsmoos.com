// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
  'throw makeVmError(Merkava interpreter step budget exceeded at );',
  'throw makeVmError("Merkava interpreter step budget exceeded at " + nodeLabel(node));'
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, fixed: text.includes('step budget exceeded at " + nodeLabel') }, null, 2));
