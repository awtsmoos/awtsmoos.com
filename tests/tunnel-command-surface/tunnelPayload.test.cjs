// B"H
const assert = require("assert");
const { buildFsPayload, actionRequiredScope } = require("../../geelooy/API/tunnel/control/core/tunnelPayload.js");

function query(params) { return { paramKinds: { GET: params, POST: {} } }; }

const commandTree = buildFsPayload(query({
  action: "commandTreeDryRun",
  steps: '[{"action":"list","payload":{"p":"."}}]'
}));
assert.equal(commandTree.kind, "fs");
assert.equal(commandTree.steps.length, 1);
assert.equal(actionRequiredScope("commandTreeDryRun"), "tunnel.write");

const command = buildFsPayload(query({ action: "commandRun", command: "echo hi" }));
assert.equal(command.kind, "command");

console.log("B'H tunnel payload command routing ok");
