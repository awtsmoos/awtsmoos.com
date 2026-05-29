// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"  const defineClass = (desc, superClass = null, closure = {}) => ({ __kind: 'class', prototype: {}, ...desc, superClass, closure });",
"  const defineClass = (desc, superClass = null, closure = {}) => ({ __kind: 'class', prototype: {}, ...desc, superClass, closure: Object.assign(Object.create(null), rootScope, closure || {}) });"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, snapshot: text.includes('Object.assign(Object.create(null), rootScope') }, null, 2));
