// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const run = spawnSync(process.execPath, ["apps/merkava-native-browser/build-seed.mjs"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, NODE_NO_WARNINGS: "1" }
});
assert.equal(run.status, 0, run.stderr || run.stdout);

const dist = path.join(root, "apps/merkava-native-browser/dist");
const app = fs.readFileSync(path.join(dist, "sample.merkava"));
const shell = fs.readFileSync(path.join(dist, "browser-shell.merkava"));
const embedded = fs.readFileSync(path.join(dist, "embedded_executor.merkava"));
const cSource = fs.readFileSync(path.join(dist, "native-browser-seed.c"), "utf8");
const header = fs.readFileSync(path.join(root, "apps/merkava-native-browser/native/merkava-runtime-report.h"), "utf8");
const report = JSON.parse(fs.readFileSync(path.join(dist, "merkava-runtime-report.json"), "utf8"));
const renderModel = JSON.parse(fs.readFileSync(path.join(dist, "diagnostic-render-model.json"), "utf8"));
const exe = fs.readFileSync(path.join(dist, "merkavaapp.exe"));

assert.equal(app.slice(0, 4).toString("binary"), "MD2\0");
assert.equal(shell.slice(0, 4).toString("binary"), "MD2\0");
assert.equal(embedded.slice(0, 4).toString("binary"), "MD2\0");
assert.ok(cSource.includes("awts_webgl_draw_arrays"));
assert.ok(cSource.includes("awts_load_url"));
assert.equal((header.match(/AWTS_NATIVE_RENDER_STREAM/g) || []).length, 1);
assert.equal(report.nativePlan.architecture, "C host VM obeys embedded MerkavaExecutor bytecode; browser intelligence belongs to bytecode");
assert.equal(renderModel.scripts[0].analysis, "executed by MerkavaExecutor render stream, not native C regex");
assert.ok(renderModel.renderStream.commandCount > 0);
assert.equal(exe.slice(0, 2).toString("ascii"), "MZ");
console.log(JSON.stringify({ ok: true, appBytes: app.length, shellBytes: shell.length, embeddedBytes: embedded.length, exeBytes: exe.length }, null, 2));
