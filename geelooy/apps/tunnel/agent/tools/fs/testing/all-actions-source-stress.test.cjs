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
const fsRoot = path.join(__dirname, ".tmp-all-actions-source-stress");
const { buildActions } = require(path.join(repoRoot, "apps/tunnel/agent/tools/fs/actions.js"));
const { handleCommand, ACTIONS: COMMAND_ACTIONS } = require(path.join(repoRoot, "apps/tunnel/agent/tools/command/index.js"));

function config() {
  return { root: fsRoot, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } };
}

async function resetFixture() {
  await fsp.rm(fsRoot, { recursive: true, force: true });
  await fsp.mkdir(path.join(fsRoot, "src"), { recursive: true });
  await fsp.writeFile(path.join(fsRoot, "src", "app.js"), "// B'H\nexport function flame(x){ return x + 1; }\nconsole.log(flame(1));\n", "utf8");
  await fsp.writeFile(path.join(fsRoot, "src", "note.txt"), "B'H needle alef\nB'H needle beis\n", "utf8");
  await fsp.writeFile(path.join(fsRoot, "index.html"), "<body><main id='app'>B'H runtime</main><script>console.log('BH runtime')</script></body>", "utf8");
}

async function runFs(action, payload = {}) {
  const cfg = config();
  const full = { action, ...payload };
  const actions = buildActions(cfg, full, null);
  assert.equal(typeof actions[action], "function", `missing action ${action}`);
  return await actions[action]();
}

async function assertRegistryClassified() {
  const actions = buildActions(config(), { action: "list" }, null);
  const names = Object.keys(actions).sort();
  assert.ok(names.length > 120, "expected broad action surface");
  for (const name of names) assert.equal(typeof actions[name], "function", name);
  for (const name of ["bulk", "read", "read64", "astOutline", "simulateRuntime", "commandTreeRun", "toolStressMatrix", "writeIfHash"]) assert.ok(names.includes(name), name);
  for (const alias of ["command", "commandRun", "runCommand", "shell", "nodeScript", "nodeScriptRun"]) assert.equal(typeof COMMAND_ACTIONS[alias], "function", alias);
  return names.length;
}

async function assertReadFamily() {
  assert.equal((await runFs("list", { path: "." })).ok, true);
  assert.ok((await runFs("tree", { path: ".", depth: 2 })).treeText.includes("src"));
  assert.ok((await runFs("read", { path: "src/note.txt", maxChars: 8 })).truncated);
  assert.ok((await runFs("readBytes", { path: "src/note.txt", maxBytes: 6 })).content.includes("B"));
  assert.ok((await runFs("read64", { path: "src/note.txt", maxBytes: 6 })).content64);
  assert.ok((await runFs("md", { path: "src/app.js" })).content.includes("flame"));
  assert.equal((await runFs("readLines", { path: "src/note.txt", startLine: 1, endLine: 1 })).returnedLines, 1);
  assert.equal((await runFs("readManyLines", { ranges: [{ path: "src/note.txt", startLine: 2, endLine: 2 }] })).count, 1);
  assert.equal((await runFs("bulk", { paths: ["src/app.js", "src/note.txt"], maxFiles: 5 })).returnedCount, 2);
}

async function assertSearchAndAstFamily() {
  assert.ok((await runFs("grep", { path: ".", query: "needle", maxResults: 5 })).returnedResults >= 2);
  assert.ok((await runFs("findFiles", { path: ".", query: "note" })).returnedResults >= 1);
  assert.ok((await runFs("selectString", { path: ".", query: "needle" })).count >= 2);
  assert.equal((await runFs("fileHashes", { paths: ["src/app.js"] })).ok, true);
  assert.equal((await runFs("astOutline", { path: "src/app.js" })).ok, true);
  assert.equal((await runFs("symbolOutline", { path: "src/app.js" })).ok, true);
  assert.equal((await runFs("connectedFiles", { path: "src/app.js", mode: "outline" })).ok, true);
}

async function assertWriteFamily() {
  assert.equal((await runFs("write", { path: "src/write.txt", content: "first" })).ok, true);
  assert.equal((await runFs("bulkWrite", { writes: [{ path: "src/a.txt", content: "a" }, { path: "src/b.txt", content: "b" }] })).ok, true);
  const hash = (await runFs("fileHashes", { paths: ["src/write.txt"] })).results["src/write.txt"].sha256;
  assert.equal((await runFs("writeIfHash", { path: "src/write.txt", expectedSha256: hash, content: "second" })).ok, true);
  const hashA = (await runFs("fileHashes", { paths: ["src/a.txt"] })).results["src/a.txt"].sha256;
  assert.equal((await runFs("bulkWriteIfHashes", { writes: [{ path: "src/a.txt", expectedSha256: hashA, content: "aa" }] })).ok, true);
  assert.equal((await runFs("replaceRange", { path: "src/write.txt", startLine: 1, endLine: 1, content: "third" })).changed, true);
  assert.equal((await runFs("applyPatch", { path: "src/write.txt", edits: [{ find: "third", replace: "fourth" }] })).changed, true);
}

async function assertWorkflowRuntimeCommandFamily() {
  const batch = await runFs("commandTreeRun", { steps: [{ action: "read", payload: { path: "src/note.txt" }, saveAs: "note" }, { assert: { path: "named.note.ok", eq: true } }] });
  assert.equal(batch.ok, true);
  assert.equal((await runFs("commandTreeDryRun", { steps: [{ action: "list", payload: { path: "." } }] })).ok, true);
  const sim = await runFs("simulateRuntime", { runtime: "browser", entry: "index.html" });
  assert.equal(sim.ok, true);
  assert.equal(sim.score, 100);
  const cmd = await handleCommand({ action: "command", command: "node -e \"process.stdout.write('BH-command-alias')\"", cwd: repoRoot, timeoutMs: 20000 });
  assert.equal(cmd.ok, true);
  assert.ok(cmd.stdout?.includes("BH-command-alias") || cmd.status === "running" || !!cmd.waitPayload || !!cmd.outputRef);
}

(async () => {
  await resetFixture();
  const registered = await assertRegistryClassified();
  await assertReadFamily();
  await assertSearchAndAstFamily();
  await assertWriteFamily();
  await assertWorkflowRuntimeCommandFamily();
  console.log(JSON.stringify({ ok: true, registeredActions: registered, families: 5, fixture: fsRoot }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
