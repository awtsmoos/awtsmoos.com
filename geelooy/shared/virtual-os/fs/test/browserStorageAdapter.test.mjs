// B"H
import assert from "assert";
import { BrowserStorageFsAdapter } from "../adapters/BrowserStorageFsAdapter.js";

const store = new Map();
const storage = { getItem(key) { return store.get(key) || null; }, setItem(key, value) { store.set(key, String(value)); } };
global.Blob = class Blob { constructor(parts) { this.parts = parts; } get size() { return this.parts.join("").length; } };

const adapter = new BrowserStorageFsAdapter({ storage, storeKey: "test-store" });
assert.strictEqual(adapter.capabilities().fsWrite, true);

let got = await adapter.run({ action: "list", path: "." });
assert.strictEqual(got.ok, true);
assert(got.items.some(item => item.name === "README.md"));

got = await adapter.run({ action: "write", path: "src/app.js", content: "console.log('BHY')" });
assert.strictEqual(got.ok, true);
assert.strictEqual(got.path, "src/app.js");

got = await adapter.run({ action: "read", path: "src/app.js", maxChars: 7, offsetChars: 0 });
assert.strictEqual(got.content, "console");
assert.strictEqual(got.nextOffsetChars, 7);

got = await adapter.run({ action: "list", path: "src" });
assert.strictEqual(got.items[0].name, "app.js");

got = await adapter.run({ action: "tree", path: "." });
assert(got.treeText.includes("src/app.js"));

got = await adapter.run({ action: "bulk", paths: "README.md,src/app.js" });
assert.strictEqual(got.count, 2);
assert.strictEqual(got.files["src/app.js"].ok, true);

got = await adapter.run({ action: "commandRun", command: "ls" });
assert.strictEqual(got.ok, true);
assert(got.stdout.includes("app.js"));

got = await adapter.run({ action: "commandRun", command: "node index.js" });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.simulated, true);

got = await adapter.run({ action: "delete", path: "src" });
assert.strictEqual(got.count, 1);
assert.strictEqual((await adapter.run({ action: "read", path: "src/app.js" })).ok, false);

console.log("BHY BrowserStorageFsAdapter tests passed");
