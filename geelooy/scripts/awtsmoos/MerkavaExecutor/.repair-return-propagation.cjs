// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
if (!text.includes('const RETURN = Symbol')) {
  text = text.replace("const trace = [];", "const trace = [];\n  const RETURN = Symbol('merkavaReturn');\n  const isReturn = value => value && value.__signal === RETURN;\n  const makeReturn = value => ({ __signal: RETURN, value });");
}
text = text.replace(
`  const evalBlock = (body = [], scope = {}) => {
    let value;
    for (const step of body) {
      if (step?.op === 'return') return interpretNode(step.value, scope);
      value = interpretNode(step, scope);
    }
    return value;
  };`,
`  const evalBlock = (body = [], scope = {}) => {
    let value;
    for (const step of body) {
      if (step?.op === 'return') return makeReturn(interpretNode(step.value, scope));
      value = interpretNode(step, scope);
      if (isReturn(value)) return value;
    }
    return value;
  };`
);
text = text.replace(
"      if (node.op === 'block') return evalBlock(node.body || [], scope);",
"      if (node.op === 'block') return evalBlock(node.body || [], scope);"
);
text = text.replace(
"      return evalBlock(this.body, scope);",
"      const value = evalBlock(this.body, scope);\n      return isReturn(value) ? value.value : value;"
);
text = text.replace(
"    return interpretNode(found.body, scope);",
"    const value = interpretNode(found.body, scope);\n    return isReturn(value) ? value.value : value;"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasReturnSignal: text.includes('merkavaReturn') }, null, 2));
