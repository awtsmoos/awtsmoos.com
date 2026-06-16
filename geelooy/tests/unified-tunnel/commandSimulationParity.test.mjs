// B"H
import assert from "assert";
import { BrowserCommandAdapter } from "../../apps/code/js/tunnel/BrowserCommandAdapter.js";
import { BrowserStorageFsAdapter } from "../../shared/virtual-os/fs/adapters/BrowserStorageFsAdapter.js";

const store = new Map();
global.Blob = class Blob { constructor(parts) { this.parts = parts; } get size() { return this.parts.join("").length; } };
const storage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
const fsAdapter = new BrowserStorageFsAdapter({ storage, storeKey: "command-parity" });
await fsAdapter.run({ action: "write", path: "README.md", content: "BHY\nline2\nline3\n" });
await fsAdapter.run({ action: "write", path: "src/app.js", content: "console.log('BHY')\n" });

const codeAdapter = new BrowserCommandAdapter({ fs: { call: payload => fsAdapter.run(payload) } });
const browserStoragePwd = await fsAdapter.run({ action: "commandRun", command: "pwd", cwd: "/" });
const codePwd = await codeAdapter.run({ command: "pwd", cwd: "/" });
assertCommandShape(browserStoragePwd);
assertCommandShape(codePwd);
assert.strictEqual(browserStoragePwd.stdout, "/");
assert.strictEqual(codePwd.stdout, "/");

const browserStorageLs = await fsAdapter.run({ action: "commandRun", command: "ls" });
const codeLs = await codeAdapter.run({ command: "ls ." });
assertCommandShape(browserStorageLs);
assertCommandShape(codeLs);
assert(browserStorageLs.stdout.includes("README.md"));
assert(codeLs.stdout.includes("README.md"));

const codeCat = await codeAdapter.run({ command: "cat README.md" });
assertCommandShape(codeCat);
assert.strictEqual(codeCat.stdout, "BHY\nline2\nline3\n");

const codeHead = await codeAdapter.run({ command: "head README.md 2" });
assert.strictEqual(codeHead.stdout, "BHY\nline2");
const codeTail = await codeAdapter.run({ command: "tail README.md 1" });
assert.strictEqual(codeTail.stdout, "line3");

const browserBad = await fsAdapter.run({ action: "commandRun", command: "node app.js" });
const codeBad = await codeAdapter.run({ command: "node app.js" });
assertCommandShape(browserBad);
assertCommandShape(codeBad);
assert.strictEqual(browserBad.ok, false);
assert.strictEqual(codeBad.ok, false);
assert.strictEqual(browserBad.simulated, true);
assert.strictEqual(codeBad.simulated, true);

function assertCommandShape(result) {
  assert.strictEqual(result.action, "commandRun");
  assert.strictEqual(typeof result.ok, "boolean");
  assert.strictEqual(typeof result.stdout, "string");
  assert.strictEqual(typeof result.stderr, "string");
  assert.strictEqual(typeof result.exitCode, "number");
  assert.strictEqual(result.simulated, true);
}

console.log("BHY command simulation parity tests passed");
