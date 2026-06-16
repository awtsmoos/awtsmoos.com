// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { findFiles } = require("../findFiles.js");
const { bulkSearch } = require("../pagedSearch.js");
const { pagedTree } = require("../pagedTree.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-scale-"));
fs.mkdirSync(path.join(root, "a", "b"), { recursive: true });
for (let i = 0; i < 8; i++) fs.writeFileSync(path.join(root, "a", "b", `file-${i}.txt`), `hello ${i}\nneedle ${i}\n`, "utf8");
const config = { root, allowSecrets: true, tools: { fsRead: true, fsTree: true, fsList: true } };

(async () => {
  const files = await findFiles(config, { path: ".", query: "file", pageSize: 3, maxEntries: 1000000 });
  assert.strictEqual(files.returnedResults, 3);
  assert(files.nextRequest.cursor >= 3);
  const search = await bulkSearch(config, { path: ".", query: "needle", pageSize: 3, maxFiles: 1000000, maxResults: 1000000, maxFileBytes: 0 });
  assert.strictEqual(search.returnedResults, 3);
  assert(search.nextRequest, "search gives continuation request");
  const tree = await pagedTree(config, { path: ".", pageSize: 4, depth: 99, maxFiles: 1000000 });
  assert.strictEqual(tree.returnedRows, 4);
  assert(tree.nextRequest, "tree gives continuation request");
  console.log("BHY million scale paging tests passed");
})().catch(error => { console.error(error); process.exit(1); });
