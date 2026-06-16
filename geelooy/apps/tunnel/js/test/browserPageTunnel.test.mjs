// B"H
import assert from "assert";

const store = new Map();
global.localStorage = { getItem(key) { return store.get(key) || null; }, setItem(key, value) { store.set(key, String(value)); } };
global.location = { protocol: "https:", host: "example.com" };
global.Blob = class Blob { constructor(parts) { this.parts = parts; } get size() { return this.parts.join("").length; } };
global.document = { getElementById() { return { addEventListener() {}, textContent: "" }; } };

const { registrationPacket, runBrowserPageAction, BrowserPageTunnel } = await import("../browserPageTunnel.js");

const packet = registrationPacket("awt-browser-test");
assert.strictEqual(packet.protocolVersion, "awtsmoos-tunnel-v2");
assert.strictEqual(packet.vesselType, "browser-tab");
assert.strictEqual(packet.allowCommands, false);
assert.strictEqual(packet.capabilities.commandRun, "simulated");

let got = await runBrowserPageAction({ action: "list" });
assert.strictEqual(got.ok, true);
assert(got.items.includes("README.md"));

got = await runBrowserPageAction({ action: "write", path: "src/app.js", content: "console.log('BHY')" });
assert.strictEqual(got.ok, true);
assert.strictEqual(got.path, "src/app.js");

got = await runBrowserPageAction({ action: "read", path: "src/app.js" });
assert.strictEqual(got.content, "console.log('BHY')");

got = await runBrowserPageAction({ action: "bulk", paths: "README.md,src/app.js" });
assert.strictEqual(got.count, 2);
assert.strictEqual(got.files["src/app.js"].ok, true);

got = await runBrowserPageAction({ action: "commandRun", command: "ls" });
assert.strictEqual(got.ok, true);
assert(got.stdout.includes("src/app.js"));

got = await runBrowserPageAction({ action: "commandRun", command: "node index.js" });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.simulated, true);
assert(got.stderr.includes("native tunnel"));

assert.strictEqual(typeof BrowserPageTunnel.init, "function");
console.log("BHY BrowserPageTunnel tests passed");
