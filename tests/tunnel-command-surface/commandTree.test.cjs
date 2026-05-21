// B"H
const assert = require("assert");
const { commandTreePayload, commandTreeHandlers } = require("../../geelooy/API/tunnel/control/routes/osFs/commandTree.js");

async function main() {
  const payload = commandTreePayload({
    action: "commandTreeDryRun",
    workflow: JSON.stringify({ steps: [{ action: "payloadEcho", payload: { text: "hi" } }] })
  });
  assert.equal(payload.dryRun, true);
  assert.equal(payload.steps.length, 1);

  let called = false;
  const handlers = commandTreeHandlers(async (nextPayload, dispatch) => {
    called = true;
    assert.equal(nextPayload.action, "commandTreeRun");
    assert.equal(typeof dispatch, "function");
    return { ok: true, action: nextPayload.action };
  }, () => ({ ok: true }), { action: "commandTreeRun", steps: [] });

  const result = await handlers.commandTreeRun();
  assert.equal(called, true);
  assert.equal(result.ok, true);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
