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
const appRoot = path.dirname(repoRoot);
const fixtureRoot = path.join(__dirname, ".tmp-runtime-actions-real");

function requireFromRepo(rel) {
  return require(path.join(repoRoot, rel));
}

function config(root = appRoot) {
  return {
    root,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true }
  };
}

async function resetFixture() {
  await fsp.rm(fixtureRoot, { recursive: true, force: true });
  await fsp.mkdir(fixtureRoot, { recursive: true });
  await fsp.writeFile(path.join(fixtureRoot, "index.html"), `<body><main id="app">B\"H path runtime</main><script src="./app.js"></script></body>`, "utf8");
  await fsp.writeFile(path.join(fixtureRoot, "app.js"), `console.log("BH path runtime JS")`, "utf8");
}

async function assertInlineSimulateRuntimeAction() {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const payload = {
    action: "simulateRuntime",
    runtime: "browser",
    entry: "index.html",
    html: `<body><h1 id="x">B\"H action runtime</h1><script>console.log("BH inline runtime JS")</script></body>`
  };
  const result = await buildRuntimeActions({ payload, config: config(appRoot) }).simulateRuntime();
  assert.equal(result.ok, true);
  assert.equal(result.engine, "merkava");
  assert.equal(result.errors.length, 0);
  assert.equal(result.score, 100);
  assert.equal(result.virtualEnv.source, "inline");
  assert.ok(JSON.stringify(result.console).includes("BH inline runtime JS"));
}

async function assertPathSimulateRuntimeAction() {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const payload = { action: "simulateRuntime", runtime: "browser", entry: "index.html" };
  const result = await buildRuntimeActions({ payload, config: config(fixtureRoot) }).simulateRuntime();
  assert.equal(result.ok, true);
  assert.equal(result.score, 100);
  assert.equal(result.virtualEnv.source, "path");
  assert.equal(result.virtualEnv.entry, "index.html");
  assert.ok(result.virtualEnv.files["app.js"].includes("BH path runtime JS"));
}

async function assertPreflightCatchesBadRuntimeScript() {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const payload = {
    action: "simulateRuntime",
    runtime: "browser",
    entry: "bad.html",
    html: `<body><script>function () {</script></body>`
  };
  const result = await buildRuntimeActions({ payload, config: config(appRoot) }).simulateRuntime();
  assert.equal(result.ok, false);
  assert.equal(result.error, "runtime_preflight_failed");
  assert.ok(result.diagnostics.some(x => x.kind === "syntax"));
}

async function assertRuntimeWorkflowActionExistsAndRuns() {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  const payload = {
    action: "runtimeWorkflow",
    runtime: "browser",
    entry: "index.html",
    html: `<body><p id="y">B\"H workflow runtime</p></body>`
  };
  const actions = buildRuntimeActions({ payload, config: config(appRoot) });
  assert.equal(typeof actions.runtimeWorkflow, "function");
  assert.equal(typeof actions.merkavaWorkflowRun, "function");
  assert.equal(typeof actions.aiWorkflowRun, "function");
  assert.equal(typeof actions.testRuntimeOnce, "function");
  const result = await actions.testRuntimeOnce();
  assert.equal(result.ok, true);
  assert.equal(result.score, 100);
}

(async () => {
  await resetFixture();
  await assertInlineSimulateRuntimeAction();
  await assertPathSimulateRuntimeAction();
  await assertPreflightCatchesBadRuntimeScript();
  await assertRuntimeWorkflowActionExistsAndRuns();
  console.log(JSON.stringify({ ok: true, runtimeActionTests: 4 }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
