// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace('rootScope.__merkavaMaxDepth || 260', 'rootScope.__merkavaMaxDepth || 900');
text = text.replace('rootScope.__merkavaMaxSteps || 9000', 'rootScope.__merkavaMaxSteps || 240000');
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, depth: text.includes('|| 900'), steps: text.includes('|| 240000') }, null, 2));
