// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildActions } = require("../actions.js");
const { attachActionGuidance } = require(path.join(process.cwd(), "geelooy/api/tunnel/control/core/actionGuidance.js"));
const { buildManifest } = require(path.join(process.cwd(), "geelooy/apps/tunnel/agent/rebuild-manifest.cjs"));

/**
 * B"H
 * Chapter 390: The edge cases came with lanterns.
 * MiniMax warned where the quiet bugs hide; this suite verifies the highest
 * value edges directly against source handlers.
 */
const root = process.cwd();
const tmp = path.join("AI_THOUGHTS", "runtime-stress", ".tmp-consolidated-edges");
const config = { root, allowWrite: true, allowSecrets: false, tools: { fsList: true, fsTree: true, fsRead: true, fsWrite: true, fsBulk: true, chrome: true } };
function actions(payload) { return buildActions(config, payload, null); }
async function run(payload) { return await actions(payload)[payload.action](); }
function seedExactTree() {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  fs.writeFileSync(path.join(tmp, "only.txt"), "one", "utf8");
}

async function exactTreePage() {
  seedExactTree();
  const result = await run({ action: "tree", p: tmp, maxDepth: 1, pageSize: 2 });
  assert.equal(result.totalRows, 2);
  assert.equal(result.partial, false);
  assert.equal(result.nextRequest, null);
  return result;
}

async function unicodeRoundTrip() {
  const content = "B'H unicode שלום 🌌 \"quotes\"\\slashes\n";
  const target = path.join(tmp, "unicode.txt");
  const files = JSON.stringify({ [target]: content });
  const wrote = await run({ action: "write", mode: "bulk", files });
  assert.equal(wrote.ok, true, JSON.stringify(wrote));
  assert.equal(fs.readFileSync(target, "utf8"), content);
  return wrote;
}

async function pathTraversalRejected() {
  const files = JSON.stringify({ ["../awtsmoos-should-not-write.txt"]: "bad" });
  const result = await run({ action: "write", mode: "bulk", files });
  assert.equal(result.ok, false);
  assert.equal(result.errorCount, 1);
  return result;
}

function guidanceIsolation() {
  const a = attachActionGuidance({ ok: false, action: "bulkWrite" }, { action: "bulkWrite" });
  const b = attachActionGuidance({ ok: true, action: "tree" }, { action: "tree" });
  assert.equal(typeof a.aiGuidance.prompt, "string");
  assert.equal(typeof b.aiGuidance.prompt, "string");
  assert.equal(a.aiGuidance.prompts, undefined);
  assert.equal(b.aiGuidance.prompts, undefined);
  return { first: a.aiGuidance.prompt, second: b.aiGuidance.prompt };
}

function manifestConsistency() {
  const manifest = buildManifest();
  assert.ok(manifest.files.includes("tools/fs/pagedTree.js"));
  assert.ok(manifest.files.includes("tools/fs/chromeRuntime.js"));
  assert.ok(manifest.files.includes("tools/fs/testing/consolidated-edge-cases.test.cjs"));
  assert.equal(/\\/.test(manifest.text), false);
  return { files: manifest.files.length };
}

(async () => {
  const results = {
    exactTreePage: await exactTreePage(),
    unicodeRoundTrip: await unicodeRoundTrip(),
    pathTraversalRejected: await pathTraversalRejected(),
    guidanceIsolation: guidanceIsolation(),
    manifestConsistency: manifestConsistency()
  };
  console.log(JSON.stringify({ ok: true, summary: Object.fromEntries(Object.entries(results).map(([k, v]) => [k, { ok: v.ok !== false, partial: v.partial, files: v.files, errorCount: v.errorCount }] )) }, null, 2));
  process.exit(0);
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
