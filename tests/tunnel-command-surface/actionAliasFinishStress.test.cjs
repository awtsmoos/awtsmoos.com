// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { handleFsAction } = require("../../geelooy/apps/tunnel/agent/tools/fs/actions.js");

async function main() {
  const dir = path.join(__dirname, "fixture-alias-finish");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "a.txt"), "B'H rgbgrep spark");

  const rel = "git/awtsmoos.com/tests/tunnel-command-surface/fixture-alias-finish";

  const rg = await handleFsAction({ action: "rgbgrep", p: rel, query: "rgbgrep", maxFiles: 20 }, null);
  assert.equal(rg.ok, true);
  assert.equal((rg.results || []).length > 0 || rg.count > 0, true);

  const finish = await handleFsAction({ action: "finishAndContinue", continuationPrompt: "I finished, what else do I do" }, null);
  assert.equal(finish.ok, true);
  assert.equal(finish.finalInstruction.role, "user");
  assert.equal(finish.finalInstruction.content, "I finished, what else do I do");
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
