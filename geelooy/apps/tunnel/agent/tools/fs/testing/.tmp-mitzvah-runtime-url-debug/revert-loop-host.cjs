// B"H
/**
 * @file revert-loop-host.cjs
 * @description Chapter 72: restores loop syscalls to child scopes after the
 * root-scope experiment caused recursion. Parser support remains; host safety
 * returns first, then loop semantics can be improved in a smaller vessel.
 */
const fs = require("fs");
const file = "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js";
let src = fs.readFileSync(file, "utf8");
src = src.replace("    40: node => interpretNode(node, rootScope),\r\n    41: node => interpretNode(node, rootScope),\r\n    42: node => interpretNode(node, rootScope),", "    40: node => interpretNode(node, Object.create(rootScope)),\r\n    41: node => interpretNode(node, Object.create(rootScope)),\r\n    42: node => interpretNode(node, Object.create(rootScope)),");
src = src.replace("    40: node => interpretNode(node, rootScope),\n    41: node => interpretNode(node, rootScope),\n    42: node => interpretNode(node, rootScope),", "    40: node => interpretNode(node, Object.create(rootScope)),\n    41: node => interpretNode(node, Object.create(rootScope)),\n    42: node => interpretNode(node, Object.create(rootScope)),");
if (!src.includes("40: node => interpretNode(node, Object.create(rootScope))")) throw new Error("host loop revert did not apply");
fs.writeFileSync(file, src);
console.log(JSON.stringify({ ok: true, file, revertedRootLoopScope: true }, null, 2));
