// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildRuntimeVirtualEnv } = require("../../geelooy/apps/tunnel/agent/tools/fs/runtimeVirtualEnv.js");

const dir = path.join(__dirname, "fixture-runtime");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "child.js"), "window.child = 7;");
fs.writeFileSync(path.join(dir, "index.html"), '<script src="child.js"></script><script src="app.js"></script>');
fs.writeFileSync(path.join(dir, "app.js"), "let answer = 42; window.answer = answer;");

const good = buildRuntimeVirtualEnv({ p: "fixture-runtime/index.html" }, { root: __dirname });
assert.equal(good.ok, true);
assert(good.files["fixture-runtime/app.js"]);
assert(good.files["fixture-runtime/child.js"]);

fs.writeFileSync(path.join(dir, "bad.js"), "function nope( {");
const bad = buildRuntimeVirtualEnv({ p: "fixture-runtime/bad.js" }, { root: __dirname });
assert.equal(bad.ok, false);
assert.equal(bad.diagnostics[0].kind, "syntax");

fs.writeFileSync(path.join(dir, "dup.js"), "let x = 1; let x = 2;");
const dup = buildRuntimeVirtualEnv({ p: "fixture-runtime/dup.js" }, { root: __dirname });
assert.equal(dup.ok, false);

console.log("B'H runtime virtual env ok");
