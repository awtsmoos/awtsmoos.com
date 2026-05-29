// B"H
const fs = require('fs');
const lowerer = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
const host = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let l = fs.readFileSync(lowerer, 'utf8');
l = l.replace(
  "const paramName = p => p?.type === 'RestElement' ? { rest: p.argument.name } : p?.name;",
  "const paramName = p => p?.type === 'RestElement' ? { rest: p.argument.name } : p?.type === 'AssignmentPattern' ? { name: p.left.name, default: expr(p.right) } : p?.name;"
);
fs.writeFileSync(lowerer, l);
let h = fs.readFileSync(host, 'utf8');
h = h.replace(
  "this.params.forEach(param => { if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex); else scope[param] = args[argIndex++]; });",
  "this.params.forEach(param => { if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex); else if (param && typeof param === 'object' && param.name) { const value = args[argIndex++]; scope[param.name] = value === undefined ? interpretNode(param.default, scope) : value; } else scope[param] = args[argIndex++]; });"
);
fs.writeFileSync(host, h);
console.log(JSON.stringify({ ok: true, lowerer: l.includes('AssignmentPattern'), host: h.includes('param.name') }, null, 2));
