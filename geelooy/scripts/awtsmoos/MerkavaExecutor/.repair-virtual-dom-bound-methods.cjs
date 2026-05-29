// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"    return obj[prop];\n  };",
"    const value = obj[prop];\n    if (typeof value === 'function' && obj && (obj.ownerDocument || obj.documentElement || obj.body || obj.tagName)) return value.bind(obj);\n    return value;\n  };"
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, boundDomMethods: text.includes('value.bind(obj)') }, null, 2));
