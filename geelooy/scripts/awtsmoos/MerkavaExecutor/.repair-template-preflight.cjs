// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaSyntaxPreflight.js';
let text = fs.readFileSync(file, 'utf8');
text = text.replace(
"      if (quote === '`' && ch === '$' && next === '{') { stack.push({ ch: '{', index, template: true }); index += 1; templateDepth += 1; continue; }",
"      if (quote === '`' && ch === '$' && next === '{') { index += 1; continue; }"
);
text = text.replace("      if (open.template) templateDepth = Math.max(0, templateDepth - 1);\n", "");
text = text.replace("  let templateDepth = 0;\n", "");
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, templatePushRemoved: !text.includes('templateDepth') && !text.includes('open.template') }, null, 2));
