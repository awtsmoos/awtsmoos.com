// B"H
import assert from "assert";
import { HostedAwtsmoosFsAdapter } from "../adapters/HostedAwtsmoosFsAdapter.js";

const calls = [];
const fetchImpl = async (url, options) => {
  calls.push({ url, options });
  const parsed = new URL(url);
  if (parsed.searchParams.get("path") === "bad") return { ok: false, status: 500, async json() { return { ok: false, error: "bad_path" }; } };
  return { ok: true, status: 200, async json() { return { ok: true, action: parsed.searchParams.get("action"), path: parsed.searchParams.get("path"), content64: parsed.searchParams.get("content64") }; } };
};

let sessionCount = 0;
const adapter = new HostedAwtsmoosFsAdapter({ fetchImpl, origin: "https://example.com/", vesselName: "awtsmoos-os", ensureSession: async () => ({ ok: ++sessionCount }) });
assert.strictEqual(adapter.capabilities().fsRead, true);

let url = new URL(adapter.buildUrl({ action: "cat", path: "/project/file.txt", content: "BHY" }));
assert.strictEqual(url.origin, "https://example.com");
assert.strictEqual(url.pathname, "/api/tunnel/control/fs/awtsmoos-os");
assert.strictEqual(url.searchParams.get("action"), "read");
assert.strictEqual(url.searchParams.get("path"), "project/file.txt");
assert(url.searchParams.get("content64"));

action: {
  const got = await adapter.run({ action: "write", path: "project/file.txt", content: "abc" });
  assert.strictEqual(got.ok, true);
  assert.strictEqual(got.action, "write");
  assert.strictEqual(got.path, "project/file.txt");
  assert.strictEqual(calls.at(-1).options.credentials, "include");
}

const bad = await adapter.run({ action: "read", path: "bad" });
assert.strictEqual(bad.ok, false);
assert.strictEqual(bad.error, "bad_path");
assert.strictEqual(sessionCount, 2);

const blocked = new HostedAwtsmoosFsAdapter({ fetchImpl, ensureSession: async () => ({ ok: false }) });
const blockedResult = await blocked.run({ action: "list", path: "." });
assert.strictEqual(blockedResult.ok, false);
assert(blockedResult.error.includes("login"));

console.log("BHY HostedAwtsmoosFsAdapter tests passed");
