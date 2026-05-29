// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"  const defineClass = (desc, superClass = null) => ({ __kind: 'class', prototype: {}, ...desc, superClass });",
"  const defineClass = (desc, superClass = null, closure = {}) => ({ __kind: 'class', prototype: {}, ...desc, superClass, closure });"
);
text = text.replace(
"      if (node.op === 'class') return defineClass(node.descriptor, interpretNode(node.descriptor.superClass, scope, depth + 1));",
"      if (node.op === 'class') return defineClass(node.descriptor, interpretNode(node.descriptor.superClass, scope, depth + 1), scope);"
);
text = text.replace(
"    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, { this: instance });",
"    for (const field of klass.fields || []) instance[field.name] = interpretNode(field.value, Object.assign(Object.create(klass.closure || null), { this: instance }));"
);
text = text.replace(
"      const scope = { this: instance, arguments: args, __class: ctor.owner };",
"      const scope = Object.assign(Object.create(ctor.owner.closure || null), { this: instance, arguments: args, __class: ctor.owner });"
);
text = text.replace(
"    const scope = { this: receiver, super: superReceiver, arguments: args, __class: found.owner };",
"    const scope = Object.assign(Object.create(found.owner.closure || null), { this: receiver, super: superReceiver, arguments: args, __class: found.owner });"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, defineClassClosure: text.includes('superClass, closure'), classOpScope: text.includes('node.op === \'class\') return defineClass') }, null, 2));
