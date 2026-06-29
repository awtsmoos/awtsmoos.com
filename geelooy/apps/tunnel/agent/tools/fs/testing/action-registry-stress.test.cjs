// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "apps/tunnel/agent/main.js"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate geelooy public root from " + start);
}

const repoRoot = findPublicRoot(__dirname);
const fsRoot = path.join(__dirname, ".tmp-action-registry-stress");

function requireFromRepo(rel) {
  return require(path.join(repoRoot, rel));
}

function config() {
  return {
    root: fsRoot,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true }
  };
}

async function resetFixture() {
  await fsp.rm(fsRoot, { recursive: true, force: true });
  await fsp.mkdir(path.join(fsRoot, "nested"), { recursive: true });
  await fsp.writeFile(path.join(fsRoot, "a.txt"), "B'H alpha\nneedle one", "utf8");
  await fsp.writeFile(path.join(fsRoot, "nested", "b.txt"), "B'H beta\nneedle two", "utf8");
}

async function assertCommandTreeRunsRealChildren() {
  const { buildWorkflowActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/workflowActions.js");
  const payload = {
    action: "commandTreeRun",
    steps: [
      { id: "one", action: "echo", payload: { value: "actual" }, saveAs: "one" },
      { assert: { path: "named.one.value", eq: "actual" } }
    ]
  };
  const calls = [];
  const fakeBuildActions = (_config, nextPayload) => ({
    echo: async () => {
      calls.push(nextPayload);
      return { ok: true, action: "echo", value: nextPayload.value };
    }
  });
  const actions = buildWorkflowActions({ config: config(), payload, ws: null }, fakeBuildActions);
  const result = await actions.commandTreeRun();
  assert.equal(result.ok, true);
  assert.equal(result.count, 2);
  assert.equal(result.results[0].result.dryRun, undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].value, "actual");
}

async function assertCommandTreeRejectsEmptyPlans() {
  const { buildWorkflowActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/workflowActions.js");
  const actions = buildWorkflowActions({ config: config(), payload: { action: "commandTreeRun", goal: "do something vague" }, ws: null }, () => ({}));
  const result = await actions.commandTreeRun();
  assert.equal(result.ok, false);
  assert.equal(result.error, "missing_steps");
}

async function assertGrepScansFixtureWithoutPagedShortcut() {
  const { grep } = requireFromRepo("apps/tunnel/agent/tools/fs/searchEdit.js");
  const result = await grep(config(), { action: "grep", p: ".", query: "needle", page: 1, pageSize: 50, maxFiles: 10 });
  assert.equal(result.ok, true);
  assert.equal(result.returnedResults, 2);
  assert.equal(result.partial, false);
  if (Object.prototype.hasOwnProperty.call(result, "totalResults")) assert.equal(result.totalResults, 2);
}

async function assertLegacyReplaceAliasRemovedFromRegistry() {
  const { buildWriteActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/writeActions.js");
  const actions = buildWriteActions({ config: config(), payload: { action: "legacyReplaceAlias" } });
  assert.equal(actions.legacyReplaceAlias, undefined);
  assert.equal(typeof actions.applyPatch, "function");
  assert.equal(typeof actions.replaceRange, "function");
}

(async () => {
  await resetFixture();
  await assertCommandTreeRunsRealChildren();
  await assertCommandTreeRejectsEmptyPlans();
  await assertGrepScansFixtureWithoutPagedShortcut();
  await assertLegacyReplaceAliasRemovedFromRegistry();
  console.log(JSON.stringify({ ok: true, tests: 4 }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
