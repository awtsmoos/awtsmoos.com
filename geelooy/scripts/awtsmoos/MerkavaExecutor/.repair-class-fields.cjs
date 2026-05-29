// B"H
const fs = require('fs');
const lowerer = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
const host = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let l = fs.readFileSync(lowerer, 'utf8');
l = l.replace(
`  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).map(methodDescriptor)
  });`,
`  const fieldDescriptor = field => ({
    name: propName(field.key),
    value: field.value ? expr(field.value) : { const: undefined }
  });

  const classDescriptor = node => ({
    name: node.id.name,
    superClass: node.superClass ? { get: node.superClass.name } : null,
    methods: (node.body?.body || []).filter(member => member.type === 'MethodDefinition').map(methodDescriptor),
    fields: (node.body?.body || []).filter(member => member.type === 'PropertyDefinition' || member.type === 'FieldDefinition').map(fieldDescriptor)
  });`
);
fs.writeFileSync(lowerer, l);
let h = fs.readFileSync(host, 'utf8');
h = h.replace(
`    const ctor = findMethod(klass, 'constructor');
    if (ctor) {`,
`    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, { this: instance });
    const ctor = findMethod(klass, 'constructor');
    if (ctor) {`
);
fs.writeFileSync(host, h);
console.log(JSON.stringify({ ok: true, lowererFields: l.includes('fieldDescriptor'), hostFields: h.includes('klass.fields') }, null, 2));
