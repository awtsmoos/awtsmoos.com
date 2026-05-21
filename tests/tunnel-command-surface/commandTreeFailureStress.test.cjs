// B"H
const assert = require("assert");
const { runActionBatch } = require("../../geelooy/apps/tunnel/agent/tools/fs/actionBatch.js");

let flaky = 0;
async function fakeRun(payload) {
  if (payload.action === "flaky") return ++flaky < 2 ? { ok: false, error: "again" } : { ok: true, value: "recovered" };
  if (payload.action === "thrower") throw new Error("thrown-plan");
  if (payload.action === "echo") return { ok: true, value: payload.value };
  return { ok: true, action: payload.action };
}

async function main() {
  const got = await runActionBatch({
    stopOnError: false,
    steps: [
      { action: "flaky", retries: 2, saveAs: "flaky" },
      { action: "thrower", onError: [{ action: "echo", payload: { value: "handled" }, saveAs: "handled" }] }
    ],
    finally: [{ action: "echo", payload: { value: "final" }, saveAs: "final" }]
  }, fakeRun);

  assert.equal(got.named.flaky.value, "recovered");
  assert.equal(got.named.handled.value, "handled");
  assert.equal(got.named.final.value, "final");
  assert.equal(got.results.some(item => item.ok === false), true);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
