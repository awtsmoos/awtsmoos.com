// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const oldBlock = `  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).map(methodDescriptor)
  });`;
const newBlock = `  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).filter(member => member.type === 'MethodDefinition').map(methodDescriptor),
    fields: (node.body?.body || []).filter(member => member.type === 'PropertyDefinition' || member.type === 'FieldDefinition').map(fieldDescriptor)
  });`;
if (!text.includes(oldBlock)) throw new Error('classDescriptor exact block not found');
text = text.replace(oldBlock, newBlock);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasFieldDescriptor: text.includes('fieldDescriptor'), filtersMethods: text.includes("member.type === 'MethodDefinition'") }, null, 2));
