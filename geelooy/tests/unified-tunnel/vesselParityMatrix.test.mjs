// B"H
import assert from "assert";
import { BrowserStorageFsAdapter } from "../../shared/virtual-os/fs/adapters/BrowserStorageFsAdapter.js";
import { BrowserCommandAdapter } from "../../apps/code/js/tunnel/BrowserCommandAdapter.js";
import { assertCommandContract } from "../../shared/virtual-os/command/CommandContract.js";
import { processFromCommandResult } from "../../shared/virtual-os/process/ProcessRecord.js";

const store = new Map();
global.Blob = class Blob { constructor(parts) { this.parts = parts; } get size() { return this.parts.join('').length; } };
const storage = { getItem: key => store.get(key) || null, setItem: (key, value) => store.set(key, String(value)) };
const browserStorage = new BrowserStorageFsAdapter({ storage, storeKey: "vessel-parity" });
await browserStorage.run({ action: "write", path: "README.md", content: "BHY\n" });
const browserTab = new BrowserCommandAdapter({ fs: { call: payload => browserStorage.run(payload) } });

const vessels = [
  { name: "browser-storage", run: payload => browserStorage.run(payload), supportsFs: true, supportsCommand: true },
  { name: "browser-tab", run: payload => browserTab.run({ command: payload.command, cwd: payload.cwd }), supportsFs: false, supportsCommand: true }
];

for (const vessel of vessels) {
  if (vessel.supportsCommand) {
    const got = await vessel.run({ action: "commandRun", command: "pwd", cwd: "/" });
    assertCommandContract(got);
    assert.strictEqual(got.ok, true);
    assert.strictEqual(got.simulated, true);
    const proc = processFromCommandResult(got);
    assert.strictEqual(proc.status, "completed");
  }
}

const fsList = await browserStorage.run({ action: "list", path: "." });
assert.strictEqual(fsList.ok, true);
assert(fsList.detailedItems.some(x => x.name === "README.md"));
const fsRead = await browserStorage.run({ action: "read", path: "README.md" });
assert.strictEqual(fsRead.content, "BHY\n");
const badStorage = await browserStorage.run({ action: "commandRun", command: "node app.js" });
const badTab = await browserTab.run({ command: "node app.js" });
assertCommandContract(badStorage);
assertCommandContract(badTab);
assert.strictEqual(badStorage.ok, false);
assert.strictEqual(badTab.ok, false);
console.log("BHY vessel parity matrix tests passed", vessels.map(x => x.name).join(','));
