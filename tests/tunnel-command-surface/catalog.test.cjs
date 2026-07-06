// B"H
const assert = require("assert");
const { actions } = require("../../geelooy/API/tunnel/control/docs/actions.js");

const required = [
  "commandTreeRun",
  "commandTreeDryRun",
  "simulateRuntime",
  "merkavaWorkflowRun",
  "toolStressMatrix",
  "bulk",
  "chatgptSeasonSaveAndContinue"
];

for (const name of required) {
  assert(actions.includes(name), `${name} missing from tunnel action catalog`);
}

assert.equal(new Set(actions).size, actions.length, "action catalog has duplicates");
console.log(`B'H catalog ok: ${actions.length} actions`);
