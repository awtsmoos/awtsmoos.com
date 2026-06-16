// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { ensureGitignoreHygiene, mergeManagedBlock, TEMP_PATTERNS } = require("../gitIgnoreHygiene.js");

function root() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "awt-git-hygiene-"));
}

(async () => {
  const noGit = root();
  let got = await ensureGitignoreHygiene({ root: noGit, gitHygiene: { autoUpdateGitignore: true, ignoreAwtsmoosTemp: true } }, "test");
  assert.strictEqual(got.skipped, true);
  assert.strictEqual(fs.existsSync(path.join(noGit, ".gitignore")), false);

  const repo = root();
  fs.mkdirSync(path.join(repo, ".git"));
  fs.mkdirSync(path.join(repo, ".Awtsmoos", "actions", "results"), { recursive: true });
  fs.writeFileSync(path.join(repo, ".gitignore"), "node_modules/\n", "utf8");
  got = await ensureGitignoreHygiene({ root: repo, gitHygiene: { autoUpdateGitignore: true, ignoreAwtsmoosTemp: true, ignoreAiThoughts: false } }, "test");
  const text = fs.readFileSync(path.join(repo, ".gitignore"), "utf8");
  assert.strictEqual(got.changed, true);
  assert(text.includes(".awtsmoos/"));
  assert(text.includes(".Awtsmoos/"));
  assert(text.includes(".Awtsmoos/actions/results/"));
  assert(text.includes("*.awtsmoos.log"));
  assert(!text.includes("AI_THOUGHTS/"));

  const repoAi = root();
  fs.mkdirSync(path.join(repoAi, ".git"));
  got = await ensureGitignoreHygiene({ root: repoAi, gitHygiene: { autoUpdateGitignore: true, ignoreAwtsmoosTemp: true, ignoreAiThoughts: true } }, "test");
  const aiText = fs.readFileSync(path.join(repoAi, ".gitignore"), "utf8");
  assert(aiText.includes(".awtsmoos/actions/"));
  assert(aiText.includes(".Awtsmoos/actions/"));
  assert(aiText.includes("AI_THOUGHTS/"));

  const merged = mergeManagedBlock("dist/\n", "# B\"H Awtsmoos tunnel generated artifacts", TEMP_PATTERNS);
  assert(merged.includes("dist/"));
  assert(merged.includes(".awtsmoos/"));
  assert(merged.includes(".Awtsmoos/"));
  console.log("BHY git ignore hygiene tests passed");
})().catch(error => { console.error(error); process.exit(1); });
