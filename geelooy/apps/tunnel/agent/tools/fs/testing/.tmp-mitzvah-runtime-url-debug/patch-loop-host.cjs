// B"H
/**
 * @file patch-loop-host.cjs
 * @description Chapter 72: rewrites the host file so interpreted loop syscalls
 * run in the living root scope, not a throwaway child scope. The Awtsmoos needs
 * forOf/forIn/while/switch to mutate the same globals that the VM has already
 * revealed between bytecode instructions.
 */
const fs = require("fs");
const file = "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/DefaultMerkavaHost.js";
let src = fs.readFileSync(file, "utf8");
src = src.replace("    40: node => interpretNode(node, Object.create(rootScope)),\r\n    41: node => interpretNode(node, Object.create(rootScope)),\r\n    42: node => interpretNode(node, Object.create(rootScope)),", "    40: node => interpretNode(node, rootScope),\r\n    41: node => interpretNode(node, rootScope),\r\n    42: node => interpretNode(node, rootScope),");
src = src.replace("    40: node => interpretNode(node, Object.create(rootScope)),\n    41: node => interpretNode(node, Object.create(rootScope)),\n    42: node => interpretNode(node, Object.create(rootScope)),", "    40: node => interpretNode(node, rootScope),\n    41: node => interpretNode(node, rootScope),\n    42: node => interpretNode(node, rootScope),");
if (!src.includes("40: node => interpretNode(node, rootScope)")) throw new Error("host loop patch did not apply");
fs.writeFileSync(file, src);
console.log(JSON.stringify({ ok: true, file, hostLoopsUseRootScope: true }, null, 2));
