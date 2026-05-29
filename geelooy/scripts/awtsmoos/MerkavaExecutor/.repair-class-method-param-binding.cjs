// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
const binder = `  const bindParams = (scope, params = [], args = []) => {
    let argIndex = 0;
    for (const param of params || []) {
      if (param && typeof param === 'object' && param.rest) scope[param.rest] = args.slice(argIndex);
      else if (param && typeof param === 'object' && param.name) {
        const value = args[argIndex++];
        scope[param.name] = value === undefined ? interpretNode(param.default, scope) : value;
      } else scope[param] = args[argIndex++];
    }
  };
`;
if (!text.includes('const bindParams =')) text = text.replace('  const read = (name, scope = {}) => {', binder + '  const read = (name, scope = {}) => {');
text = text.replace("      (ctor.params || []).forEach((name, index) => { scope[name] = args[index]; });", "      bindParams(scope, ctor.params || [], args);");
text = text.replace("    (found.params || []).forEach((name, index) => { scope[name] = args[index]; });", "    bindParams(scope, found.params || [], args);");
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, bindParams: text.includes('const bindParams ='), ctorBound: text.includes('bindParams(scope, ctor.params'), methodBound: text.includes('bindParams(scope, found.params') }, null, 2));
