// B"H
import assert from "assert";

global.location = { origin: "https://awtsmoos.test" };
global.localStorage = { getItem() { return null; }, setItem() {} };

const { buildFsUrl } = await import("../tunnel.js");

let url = new URL(buildFsUrl("awt-test", { action: "read", path: "src/app.js", maxChars: 120, content: "hello" }));
assert.strictEqual(url.origin, "https://awtsmoos.test");
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awt-test");
assert.strictEqual(url.searchParams.get("action"), "read");
assert.strictEqual(url.searchParams.get("p"), "src/app.js");
assert.strictEqual(url.searchParams.get("maxChars"), "120");
assert(url.searchParams.get("content64"));

url = new URL(buildFsUrl("awt-test", { action: "aiAgentMessage", provider: "deepseek", model: "deepseek-chat", message: "BHY", saveToAccount: true }));
assert.strictEqual(url.searchParams.get("action"), "aiAgentMessage");
assert(url.searchParams.get("text64"), "AI payload should be packed into text64");
assert.strictEqual(url.searchParams.get("message64"), null);
assert.strictEqual(url.searchParams.get("apiKey64"), null);

url = new URL(buildFsUrl("awtsmoos-virtual-os", { action: "list", path: "." }));
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awtsmoos-virtual-os");
console.log("BHY buildFsUrl tests passed");
