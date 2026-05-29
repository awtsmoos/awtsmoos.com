// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
`  const newInstance = (klass, args = []) => {
    const instance = { __kind: 'instance', __class: klass, fields: {} };
    const ctor = findMethod(klass, 'constructor');
    if (ctor) interpretNode(ctor.body, { this: instance, arguments: args, __class: ctor.owner });
    return instance;
  };`,
`  const newInstance = (klass, args = []) => {
    const instance = { __kind: 'instance', __class: klass, fields: {} };
    const ctor = findMethod(klass, 'constructor');
    if (ctor) {
      const scope = { this: instance, arguments: args, __class: ctor.owner };
      (ctor.params || []).forEach((name, index) => { scope[name] = args[index]; });
      interpretNode(ctor.body, scope);
    }
    return instance;
  };`
);
text = text.replace(
`  const getProp = (obj, prop) => obj == null ? undefined : obj[prop];`,
`  const getProp = (obj, prop) => {
    if (obj == null) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, prop)) return obj[prop];
    if (obj.__kind === 'instance') {
      const found = findMethod(obj.__class, prop);
      if (found) return (...args) => callMethod(obj, prop, ...args);
    }
    return obj[prop];
  };`
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasCtorParams: text.includes('ctor.params'), hasInstanceGetProp: text.includes("obj.__kind === 'instance'") }, null, 2));
