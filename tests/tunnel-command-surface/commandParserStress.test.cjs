// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { readBulk } = require("../../geelooy/apps/tunnel/agent/tools/fs/bulkRead.js");
const { nodeCheckMany } = require("../../geelooy/apps/tunnel/agent/tools/fs/nodeCheckMany.js");

async function main() {
  const root = path.join(__dirname, "fixture-parser");
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(path.join(root, "a.js"), "const a = 1;");
  fs.writeFileSync(path.join(root, "b.js"), "const b = 2;");
  const config = { root, allowSecrets: true, tools: { fsRead: true, fsBulk: true } };

  const bulk = await readBulk(config, { paths: "a.js\nb.js", maxFiles: 5 });
  assert.equal(bulk.requestedCount, 2);
  assert.equal(bulk.returnedCount, 2);
  assert.equal(bulk.files["a.js"].ok, true);

  const checks = await nodeCheckMany(config, { paths: '["a.js","b.js"]', cwd: "." });
  assert.equal(checks.ok, true);
  assert.equal(checks.count, 2);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
