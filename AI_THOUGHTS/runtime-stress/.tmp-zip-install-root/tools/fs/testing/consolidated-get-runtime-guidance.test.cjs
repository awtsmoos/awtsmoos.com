// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildActions } = require("../actions.js");
const { attachActionGuidance } = require(path.join(process.cwd(), "geelooy/api/tunnel/control/core/actionGuidance.js"));
const { buildManifest } = require(path.join(process.cwd(), "geelooy/apps/tunnel/agent/rebuild-manifest.cjs"));

/**
 * B"H
 * Chapter 388: The consolidated gates were weighed outside the live cache.
 * These tests invoke source modules directly so an old running tunnel cannot
 * pretend the new code has failed or passed.
 */
const root = process.cwd();
const tmp = path.join("AI_THOUGHTS", "runtime-stress", ".tmp-consolidated-source");
const config = { root, allowWrite: true, allowSecrets: false, tools: { fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true, chrome: true } };

function actions(payload) { return buildActions(config, payload, null); }
async function run(payload) {
  const map = actions(payload);
  const fn = map[payload.action];
  assert.equal(typeof fn, "function", "missing action " + payload.action);
  return await fn();
}

async function seed() {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(tmp, "a", "b"), { recursive: true });
  fs.writeFileSync(path.join(tmp, "one.txt"), "B'H one needle\n", "utf8");
  fs.writeFileSync(path.join(tmp, "two.txt"), "B'H two needle\n", "utf8");
  fs.writeFileSync(path.join(tmp, "a", "b", "three.txt"), "B'H three needle\n", "utf8");
}

async function testConsolidatedReadBulk() {
  const result = await run({ action: "read", mode: "bulk", p: tmp, paths: "one.txt\ntwo.txt", maxFiles: 1 });
  assert.equal(result.ok, true);
  assert.equal(result.returnedCount, 1);
  assert.equal(result.partial, true);
  assert.ok(result.nextPagePayload);
  return result;
}

async function testConsolidatedSearch() {
  const result = await run({ action: "search", mode: "bulkSearch", p: tmp, query: "needle", maxFiles: 1, pageSize: 2 });
  assert.equal(result.ok, true);
  assert.ok(result.hasNextScan || result.returnedResults > 0);
  if (result.hasNextScan) assert.ok(result.nextScanRequest);
  return result;
}

async function testTreePagination() {
  const result = await run({ action: "tree", p: tmp, maxDepth: 5, pageSize: 2 });
  assert.equal(result.ok, true);
  assert.equal(result.partial, true);
  assert.ok(result.nextRequest);
  return result;
}

async function testWriteBulkMode() {
  const files = JSON.stringify({ [path.join(tmp, "write-a.txt")]: "A", [path.join(tmp, "write-b.txt")]: "B" });
  const result = await run({ action: "write", mode: "bulk", files });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.equal(result.okCount, 2);
  return result;
}

async function testNodeDomRuntime() {
  const html = `<body><input id="name"><button id="go">Go</button><div id="out"></div><script>go.onclick=()=>out.textContent='Hi '+name.value</script></body>`;
  const result = await run({ action: "runtime", engine: "node-dom", html, browserActions: JSON.stringify([{ action: "fill", selector: "#name", value: "Awts" }, { action: "click", selector: "#go" }, { action: "assertText", selector: "#out", expected: "Hi Awts" }]), returnValues: JSON.stringify(["out.textContent"]) });
  assert.equal(result.ok, true, JSON.stringify(result.errors || result));
  assert.equal(result.engine, "node-dom");
  return result;
}

async function testAutoRuntime() {
  if (process.env.SKIP_CHROME_AUTO === "1") return { ok: true, engine: "skipped", skipped: true };
  const html = `<body><div id="out">AUTO</div></body>`;
  const result = await run({ action: "runtime", engine: "auto", html, returnValues: JSON.stringify(["document.body.textContent.trim()"]), timeoutMs: 8000 });
  assert.equal(result.ok, true, JSON.stringify(result));
  assert.ok(["chrome", "node-dom", "merkava"].includes(result.engine));
  return result;
}

function testGuidanceSinglePrompt() {
  const plain = attachActionGuidance({ ok: true, action: "tree" }, { action: "tree" });
  assert.equal(typeof plain.aiGuidance.prompt, "string");
  assert.equal(plain.aiGuidance.prompts, undefined);
  const debug = attachActionGuidance({ ok: true, action: "tree" }, { action: "tree", guidanceDebug: "true" });
  assert.ok(Array.isArray(debug.aiGuidance.prompts));
  return plain.aiGuidance;
}

function testManifestCoverage() {
  const manifest = buildManifest();
  for (const needed of ["tools/fs/pagedTree.js", "tools/fs/chromeRuntime.js", "tools/fs/nodeDomRuntime/index.js", "tools/fs/actionGroups/runtimeActions.js"]) assert.ok(manifest.files.includes(needed), "manifest missing " + needed);
  assert.equal(/\\/.test(manifest.text), false);
  return { files: manifest.files.length };
}

(async () => {
  await seed();
  const results = {
    readBulk: await testConsolidatedReadBulk(),
    search: await testConsolidatedSearch(),
    tree: await testTreePagination(),
    writeBulk: await testWriteBulkMode(),
    nodeDom: await testNodeDomRuntime(),
    autoRuntime: await testAutoRuntime(),
    guidance: testGuidanceSinglePrompt(),
    manifest: testManifestCoverage()
  };
  console.log(JSON.stringify({ ok: true, summary: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { ok: v.ok !== false, engine: v.engine, partial: v.partial, files: v.files, skipped: v.skipped }] )) }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});




