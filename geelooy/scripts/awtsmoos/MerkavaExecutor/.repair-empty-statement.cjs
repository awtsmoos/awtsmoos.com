// B"H
const fs = require('fs');
const file = 'geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js';
let text = fs.readFileSync(file, 'utf8');
if (!text.includes("if (stmt.type === 'EmptyStatement') return null;")) {
  text = text.replace(
    "if (stmt.type === 'VariableDeclaration') {",
    "if (stmt.type === 'EmptyStatement') return null;\n    if (stmt.type === 'VariableDeclaration') {"
  );
}
const duplicate = "    } else if (stmt.type === 'IfStatement') {\r\n      target.push({\r\n        op: 'if',\r\n        test: expr(stmt.test),\r\n        consequent: stmt.consequent?.type === 'BlockStatement' ? blockSteps(stmt.consequent) : statementSteps(stmt.consequent),\r\n        alternate: stmt.alternate ? (stmt.alternate.type === 'BlockStatement' ? blockSteps(stmt.alternate) : statementSteps(stmt.alternate)) : []\r\n      });\r\n    } else if (stmt.type === 'IfStatement') {";
if (text.includes(duplicate)) text = text.replace(duplicate, "    } else if (stmt.type === 'IfStatement') {");
fs.writeFileSync(file, text);
console.log(JSON.stringify({ ok: true, hasEmpty: text.includes('EmptyStatement') }, null, 2));
