// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildAgentZip, isSafeManifestPath } = require("../../../../geelooy/api/tunnel/install/tools/zipBundle.js");
const { readZip } = require("./zipTestReader.cjs");

/**
 * B"H
 * The native installer ZIP route must keep producing ZIP bytes even when an
 * old manifest contains stale local metadata entries.
 */
const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "geelooy/apps/tunnel/agent/manifest.txt");
const original = fs.readFileSync(manifestPath, "utf8");

try {
  fs.writeFileSync(manifestPath, `${original.trimEnd()}\n.DS_Store\n__MACOSX/file\nnode_modules/x.js\n.git/config\nmissing-agent-file.js\n\n`, "utf8");

  assert.equal(isSafeManifestPath(".DS_Store"), false);
  assert.equal(isSafeManifestPath("__MACOSX/file"), false);
  assert.equal(isSafeManifestPath("node_modules/x.js"), false);
  assert.equal(isSafeManifestPath(".git/config"), false);
  assert.equal(isSafeManifestPath("main.js"), true);

  const zip = buildAgentZip(repoRoot);
  assert.ok(Buffer.isBuffer(zip), "expected Buffer ZIP");
  assert.equal(zip.slice(0, 4).toString("hex"), "504b0304");

  const entries = readZip(zip);
  assert.ok(entries.has("main.js"), "entry file missing from ZIP");
  assert.equal(entries.has(".DS_Store"), false);
  assert.equal(entries.has("__MACOSX/file"), false);
  assert.equal(entries.has("node_modules/x.js"), false);
  assert.equal(entries.has(".git/config"), false);
  assert.equal(entries.has("missing-agent-file.js"), false);

  console.log(JSON.stringify({ ok: true, entries: entries.size }, null, 2));
} finally {
  fs.writeFileSync(manifestPath, original, "utf8");
}
