// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "../../..");
const generator = path.join(root, "scripts/generate-tunnel-openapi-live.cjs");
const run = spawnSync(process.execPath, [generator], { cwd: root, encoding: "utf8" });
assert.strictEqual(run.status, 0, run.stdout + run.stderr);
const result = JSON.parse(run.stdout);
assert.strictEqual(result.ok, true);
assert.strictEqual(result.hasCommandTreeParams, true);
assert.strictEqual(result.hasCommandPagingParams, true);
const yaml = fs.readFileSync(path.join(root, "geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml"), "utf8");
for (const action of ["commandTreeRun", "commandTreeDryRun", "commandTreeReplay", "commandOutputPage", "commandStart", "commandStatus", "commandJobOutputPage", "domDomRenderLab", "ephemeralPage", "previewFile", "write", "bulkWrite", "writeIfHash"]) assert(yaml.includes(`              - ${action}`), action);
for (const param of ["tree", "tree64", "vars", "vars64", "budgetPerutas", "treeId", "ttlSeconds", "optional", "continueOnError", "outputId", "jobId", "stream", "offsetChars", "maxInlineChars", "pageChars", "asyncCommand", "background"]) assert(yaml.includes(`name: ${param}`), param);
console.log("BHY OpenAPI commandTree/command paging params tests passed");
