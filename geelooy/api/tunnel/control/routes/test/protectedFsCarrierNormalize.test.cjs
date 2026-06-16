// B"H
const assert = require("assert");
const { normalizeCarriers } = require("../protectedFs.js");

const $i = { paramKinds: { GET: {
  params: JSON.stringify({ budgetPerutas: 7, vars: { file: "x.js" }, async: true, jobId: "job_1", stream: "stdout" }),
  tree: JSON.stringify({ steps: [{ id: "a", action: "configGet" }] }),
  maxInlineChars: "1234"
} } };
const got = normalizeCarriers({ action: "commandTreeRun", params: {}, actionsJson: JSON.stringify({ steps: [{ id: "b", action: "configGet" }] }) }, $i);
assert.strictEqual(got.budgetPerutas, 7);
assert.strictEqual(got.vars.file, "x.js");
assert.strictEqual(got.async, true);
assert.strictEqual(got.jobId, "job_1");
assert.strictEqual(got.stream, "stdout");
assert.strictEqual(got.maxInlineChars, "1234");
assert.strictEqual(got.tree.steps[0].id, "a");
console.log("BHY protectedFs carrier normalize tests passed");
