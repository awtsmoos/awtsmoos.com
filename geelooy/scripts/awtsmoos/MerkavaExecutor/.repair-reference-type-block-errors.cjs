// B"H
const fs = require('fs');
const hostFile = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js';
const lowererFile = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let host = fs.readFileSync(hostFile, 'utf8');
host = host.replace(
`    if (key === 'Promise') return nativePromise;
    if (Object.prototype.hasOwnProperty.call(globalThis, key)) return globalThis[key];
    return undefined;`,
`    if (key === 'undefined') return undefined;
    if (key === 'Promise') return nativePromise;
    if (Object.prototype.hasOwnProperty.call(globalThis, key)) return globalThis[key];
    throw new ReferenceError(String(key) + ' is not defined');`
);
host = host.replace(
`      if (node.op === 'typeof') return typeof interpretNode(node.value, scope, depth + 1);`,
`      if (node.op === 'typeof') {
        try { return typeof interpretNode(node.value, scope, depth + 1); }
        catch (error) { if (error instanceof ReferenceError) return 'undefined'; throw error; }
      }`
);
host = host.replace(
`    if (fn && typeof fn.call === 'function') return fn.call(args);
    return undefined;`,
`    if (fn && typeof fn.call === 'function') return fn.call(args);
    throw new TypeError(String(fn) + ' is not a function');`
);
fs.writeFileSync(hostFile, host);
let lowerer = fs.readFileSync(lowererFile, 'utf8');
if (!lowerer.includes("stmt.type === 'BlockStatement'")) {
  lowerer = lowerer.replace(
    "if (stmt.type === 'EmptyStatement') return null;",
    "if (stmt.type === 'EmptyStatement') return null;\n    if (stmt.type === 'BlockStatement') { target.push({ op: 'block', body: blockSteps(stmt) }); return null; }"
  );
}
fs.writeFileSync(lowererFile, lowerer);
console.log(JSON.stringify({ ok: true, referenceError: host.includes('is not defined'), typeError: host.includes('is not a function'), blockStatement: lowerer.includes("stmt.type === 'BlockStatement'") }, null, 2));
