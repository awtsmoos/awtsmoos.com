// B"H
/**
 * @file add-for-in-lowering.cjs
 * @description Chapter 72: rewrites the full lowerer file after changing the
 * second duplicated ForOf branch into a ForIn branch. The lowered runtime uses
 * Object.keys so the existing forOf VM host path does the walking.
 */
const fs = require("fs");
const file = "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaAstLowerer.js";
let src = fs.readFileSync(file, "utf8");
if (!src.includes("stmt.type === 'ForInStatement'")) {
  const marker = "    } else if (stmt.type === 'ForOfStatement') {";
  const first = src.indexOf(marker);
  const second = src.indexOf(marker, first + marker.length);
  if (first < 0 || second < 0) throw new Error("could not find duplicated ForOf branch");
  const next = src.indexOf("    } else if (stmt.type === 'WhileStatement')", second);
  if (next < 0) throw new Error("could not find WhileStatement after second ForOf branch");
  const forInBlock = `    } else if (stmt.type === 'ForInStatement') {
      const left = stmt.left?.type === 'VariableDeclaration'
        ? stmt.left.declarations?.[0]?.id?.name
        : stmt.left?.name;
      target.push({
        op: 'forOf',
        left: left || \`__forIn\${target.length}\`,
        right: { op: 'callMethod', object: { get: 'Object' }, method: 'keys', args: [expr(stmt.right)] },
        body: stmt.body?.type === 'BlockStatement' ? blockSteps(stmt.body) : statementSteps(stmt.body)
      });
`;
  src = src.slice(0, second) + forInBlock + src.slice(next);
  fs.writeFileSync(file, src);
}
console.log(JSON.stringify({ ok: true, file, hasForIn: src.includes("stmt.type === 'ForInStatement'") }, null, 2));
