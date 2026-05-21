// B"H
const assert = require("assert");
const fs = require("fs");
const crypto = require("crypto");

const base = "geelooy/apps/tunnel/agent/";
const manifest = JSON.parse(fs.readFileSync(base + "manifest.json", "utf8"));
const targets = [
  "tools/fs/actionBatch.js",
  "tools/fs/actionGroups/runtimeActions.js",
  "tools/fs/actionGroups/readActions.js",
  "tools/fs/searchEdit.js",
  "tools/fs/actionGroups/readActions.js",
  "tools/fs/searchEdit.js",
  "tools/fs/runtimeVirtualEnv.js",
  "tools/fs/jsWriteVerifier.js",
  "tools/fs/nodeCheckMany.js",
  "tools/fs/nodeCheckMany.js",
  "tools/fs/actionGroups/writeActions.js",
  "tools/fs/workflowRunner.js"
];

for (const rel of targets) {
  const buf = fs.readFileSync(base + rel);
  const rec = manifest.files.find((item) => item.path === rel);
  assert(rec, `${rel} missing from manifest`);
  assert.equal(rec.bytes, buf.length, `${rel} byte mismatch`);
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  assert.equal(rec.sha256, hash, `${rel} hash mismatch`);
}

console.log("B'H manifest hashes ok");
