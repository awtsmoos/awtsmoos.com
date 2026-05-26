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
const app = fs.readFileSync(path.join(dist, "sample.md2"));
const shell = fs.readFileSync(path.join(dist, "browser-shell.md2"));
const cSource = fs.readFileSync(path.join(dist, "native-browser-seed.c"), "utf8");
const exe = fs.readFileSync(path.join(dist, "merkavaapp.exe"));

assert.equal(app.slice(0, 4).toString("binary"), "MD2\0");
assert.equal(shell.slice(0, 4).toString("binary"), "MD2\0");
assert.ok(cSource.includes("awts_webgl_draw_arrays"));
assert.ok(cSource.includes("awts_load_url"));
assert.equal(exe.slice(0, 2).toString("ascii"), "MZ");
console.log(JSON.stringify({ ok: true, appBytes: app.length, shellBytes: shell.length, exeBytes: exe.length }, null, 2));
