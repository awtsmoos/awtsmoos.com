// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const blockRe = /  const classDescriptor = node => \(\{\n    name: node\.id\.name,\n    superClass: node\.superClass \? \{ get: node\.superClass\.name \} : null,\n    methods: \(node\.body\?\.body \|\| \[\]\)\.map\(methodDescriptor\)\n  \}\);/;
const next = `  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).filter(member => member.type === 'MethodDefinition').map(methodDescriptor),
    fields: (node.body?.body || []).filter(member => member.type === 'PropertyDefinition' || member.type === 'FieldDefinition').map(fieldDescriptor)
  });`;
if (!blockRe.test(text)) throw new Error('classDescriptor regex target not found');
text = text.replace(blockRe, next);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasFieldDescriptor: text.includes('fieldDescriptor'), filtersMethods: text.includes("member.type === 'MethodDefinition'") }, null, 2));
