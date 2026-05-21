// B"H
const assert = require("assert");
const { COMMAND_TREE_ACTIONS } = require("../../geelooy/API/tunnel/control/routes/osFs/commandTree.js");
const { actions } = require("../../geelooy/API/tunnel/control/docs/actions.js");

const groups = {
  commandTree: COMMAND_TREE_ACTIONS,
  runtime: ["simulateRuntime", "runtimeWorkflow", "merkavaWorkflowRun"],
  batch: ["actionBatch", "workflowRun", "commandBatch", "aiCommandBatch"],
  search: ["grep", "rg", "bulkSearch", "find"],
  write: ["write", "bulkWrite", "writeIfHash", "bulkWriteIfHashes"]
};

for (const [group, names] of Object.entries(groups)) {
  assert(names.length > 0, `${group} empty`);
  for (const name of names) assert(actions.includes(name), `${group}:${name} missing`);
}

console.log("B'H command families cataloged ok");
