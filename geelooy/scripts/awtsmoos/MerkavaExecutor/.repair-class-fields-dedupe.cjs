// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const duplicate = `  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const fieldDescriptor = field => ({`;
if (!text.includes(duplicate)) throw new Error('duplicate fieldDescriptor block not found');
text = text.replace(duplicate, `  const fieldDescriptor = field => ({`);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, count: (text.match(/fieldDescriptor/g) || []).length }, null, 2));
