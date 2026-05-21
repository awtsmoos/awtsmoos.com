// B"H
const assert = require("assert");
const { runActionBatch } = require("../../geelooy/apps/tunnel/agent/tools/fs/actionBatch.js");

async function fakeRun(payload) { return { ok: true, action: payload.action }; }

async function main() {
  const prompt = "I finished, what else do I do?";
  const result = await runActionBatch({
    continuationPrompt: prompt,
    steps: [{ action: "stat", payload: { path: "." } }]
  }, fakeRun);

  assert.equal(result.ok, true);
  assert.equal(result.count, 1);
  assert.equal(result.finalInstruction.role, "user");
  assert.equal(result.finalInstruction.content, prompt);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
