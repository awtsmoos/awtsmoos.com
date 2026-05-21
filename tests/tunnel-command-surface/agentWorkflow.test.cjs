// B"H
const assert = require("assert");
const { runWorkflow, validateWorkflow } = require("../../geelooy/apps/tunnel/agent/tools/fs/workflowRunner.js");
const { runActionBatch } = require("../../geelooy/apps/tunnel/agent/tools/fs/actionBatch.js");

async function fakeRun(payload) { return { ok: true, action: payload.action, echo: payload }; }

async function main() {
  const workflow = '{"steps":[{"id":"one","action":"list","with":{"p":"."}}]}';
  assert.equal(validateWorkflow({ workflow }).ok, true);
  const ran = await runWorkflow({ workflow }, fakeRun);
  assert.equal(ran.ok, true);
  assert.equal(ran.steps.one.action, "list");

  const batch = await runActionBatch({ steps: '[{"action":"stat","payload":{"path":"."}}]' }, fakeRun);
  assert.equal(batch.ok, true);
  assert.equal(batch.count, 1);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
