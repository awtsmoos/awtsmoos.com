// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { buildActions } = require("../actions.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-write-actions-"));
const config = { root, allowWrite: true, allowSecrets: true, tools: { fsWrite: true, fsBulk: true, fsRead: true } };
function sha(text) { return crypto.createHash("sha256").update(text).digest("hex"); }

(async () => {
  const one = await buildActions(config, { action: "write", path: "a.txt", content: "alpha" }, null).write();
  assert.strictEqual(one.ok, true);
  assert.strictEqual(fs.readFileSync(path.join(root, "a.txt"), "utf8"), "alpha");
  const bulk = await buildActions(config, { action: "bulkWrite", writes: [{ path: "b.txt", content: "bravo" }, { path: "c.txt", content: "charlie" }] }, null).bulkWrite();
  assert.strictEqual(bulk.ok, true);
  assert.strictEqual(bulk.okCount, 2);
  const hash = await buildActions(config, { action: "writeIfHash", path: "a.txt", content: "alpha2", expectedSha256: sha("alpha") }, null).writeIfHash();
  assert.strictEqual(hash.ok, true);
  assert.strictEqual(fs.readFileSync(path.join(root, "a.txt"), "utf8"), "alpha2");
  console.log("BHY write/bulkWrite/writeIfHash tests passed");
})().catch(error => { console.error(error); process.exit(1); });
