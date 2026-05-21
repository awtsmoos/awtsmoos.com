// B"H
const assert = require("assert");
const { runActionBatch, evaluateCondition } = require("../../geelooy/apps/tunnel/agent/tools/fs/actionBatch.js");

async function fakeRun(payload) {
  if (payload.action === "echo") return { ok: true, value: payload.value };
  if (payload.action === "fail") return { ok: false, error: "planned" };
  return { ok: true, action: payload.action, payload };
}

async function main() {
  assert.equal(await evaluateCondition({ left: "$vars.flag", eq: "yes" }, { vars: { flag: "yes" } }, fakeRun), true);
  assert.equal(await evaluateCondition({ left: "$vars.flag", eq: "no" }, { vars: { flag: "yes" } }, fakeRun), false);

  const got = await runActionBatch({
    vars: { list: ["a", "b"], flag: "yes" },
    steps: [
      { action: "echo", payload: { value: "start" }, saveAs: "first" },
      { if: { left: "$vars.flag", eq: "yes" }, then: [{ action: "echo", payload: { value: "conditional" }, saveAs: "cond" }] },
      { if: { left: "$vars.flag", eq: "no" }, then: [{ action: "echo", payload: { value: "bad" }, saveAs: "bad" }] },
      { forEach: { in: "$vars.list", as: "letter", do: [{ action: "echo", payload: { value: "$vars.letter" } }] } },
      { parallel: [{ action: "echo", payload: { value: "p1" } }, { action: "echo", payload: { value: "p2" } }] },
      { assert: { path: "named.cond.value", eq: "conditional" } }
    ]
  }, fakeRun);
  assert.equal(got.ok, true);
  assert.equal(got.named.cond.value, "conditional");
  assert.equal(got.named.bad, undefined);
  assert.equal(got.results.length >= 7, true);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
