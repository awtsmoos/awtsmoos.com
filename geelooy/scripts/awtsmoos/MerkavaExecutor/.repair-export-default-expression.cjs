// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"  code = code.replace(/export\\s+default\\s+([^;\\n]+)\\s*;?/g, (_, expression) => { defaultName = '__merkavaDefaultExport'; return `const ${defaultName} = ${expression};`; });",
"  code = code.replace(/export\\s+default\\s+/g, () => { defaultName = '__merkavaDefaultExport'; return `const ${defaultName} = `; });"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, expressionExport: text.includes('const ${defaultName} = `') }, null, 2));
