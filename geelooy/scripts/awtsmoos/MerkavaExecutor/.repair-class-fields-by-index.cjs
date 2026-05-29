// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const start = text.indexOf('  const classDescriptor = node => ({');
if (start < 0) throw new Error('classDescriptor start not found');
const endMarker = '  const propName = node =>';
const end = text.indexOf(endMarker, start);
if (end < 0) throw new Error('classDescriptor end marker not found');
const replacement = `  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).filter(member => member.type === 'MethodDefinition').map(methodDescriptor),
    fields: (node.body?.body || []).filter(member => member.type === 'PropertyDefinition' || member.type === 'FieldDefinition').map(fieldDescriptor)
  });

`;
text = text.slice(0, start) + replacement + text.slice(end);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasFieldDescriptor: text.includes('fieldDescriptor'), filtersMethods: text.includes("member.type === 'MethodDefinition'") }, null, 2));
