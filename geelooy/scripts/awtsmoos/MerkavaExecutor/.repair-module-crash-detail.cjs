// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"    if (!run.ok) throw new Error(`VM module failed: ${key}`);",
`    if (!run.ok) {
      const cause = run.crash || { message: run.error || 'unknown bytecode crash', trace: run.trace || [] };
      const error = new Error(\`VM module failed: \${key}: \${cause.message}\`);
      error.code = 'MERKAVA_VM_MODULE_FAILED';
      error.moduleKey = key;
      error.cause = cause;
      error.trace = cause.trace || [];
      error.bytecode = { status: run.status, ip: cause.ip, bytecodeLength: cause.bytecodeLength, stackSummary: cause.stackSummary || [] };
      throw error;
    }`
);
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, moduleCause: text.includes('MERKAVA_VM_MODULE_FAILED') }, null, 2));
