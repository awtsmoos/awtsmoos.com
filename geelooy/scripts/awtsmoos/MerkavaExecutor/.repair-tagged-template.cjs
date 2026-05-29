// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
const needle = "if (node.type === 'TemplateLiteral') return templateLiteral(node);";
const insert = "if (node.type === 'TemplateLiteral') return templateLiteral(node);\n    if (node.type === 'TaggedTemplateExpression') return templateLiteral(node.quasi);";
if (!text.includes("node.type === 'TaggedTemplateExpression'")) {
  if (!text.includes(needle)) throw new Error('TemplateLiteral branch not found');
  text = text.replace(needle, insert);
}
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasTagged: text.includes('TaggedTemplateExpression') }, null, 2));
