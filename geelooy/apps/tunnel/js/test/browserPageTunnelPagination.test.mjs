// B"H
import assert from "assert";

const store = new Map();
global.localStorage = { getItem(key) { return store.get(key) || null; }, setItem(key, value) { store.set(key, String(value)); } };
global.location = { protocol: "https:", host: "example.com" };
global.Blob = class Blob { constructor(parts) { this.parts = parts; } get size() { return this.parts.join("").length; } };
global.document = { getElementById() { return { addEventListener() {}, textContent: "" }; } };

const { runBrowserPageAction } = await import("../browserPageTunnel.js");
await runBrowserPageAction({ action: "write", path: "big.txt", content: "abcdefghijklmnopqrstuvwxyz" });
let got = await runBrowserPageAction({ action: "read", path: "big.txt", maxChars: 5, offsetChars: 0 });
assert.strictEqual(got.content, "abcde");
assert.strictEqual(got.totalChars, 26);
assert.strictEqual(got.nextOffsetChars, 5);

got = await runBrowserPageAction({ action: "read", path: "big.txt", maxChars: 5, offsetChars: 20 });
assert.strictEqual(got.content, "uvwxy");
assert.strictEqual(got.nextOffsetChars, 25);

got = await runBrowserPageAction({ action: "read", path: "big.txt", maxChars: 5, offsetChars: 25 });
assert.strictEqual(got.content, "z");
assert.strictEqual(got.nextOffsetChars, null);

got = await runBrowserPageAction({ action: "read", path: "missing.txt", maxChars: 5 });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.error, "file_not_found");

console.log("BHY BrowserPageTunnel pagination tests passed");
