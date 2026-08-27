// B"H
import assert from "assert";
import { createAwtsmoosOSProvider, join, normalizePath, stripJsonSuffix } from "../awtsmoos-os.js";

const calls = [];
let loginOk = true;
const fetchImpl = async (url, options = {}) => {
  const parsed = new URL(url, "https://awtsmoos.test");
  calls.push({ url: parsed, options });
  if (parsed.pathname === "/api/social/aliases/details") {
    return response(true, [{ aliasId: "fallback", displayName: "Fallback" }]);
  }
  if (parsed.pathname.includes("/fileSystem/moveEntry")) {
    return response(true, { moved: true, body: JSON.parse(options.body) });
  }
  assert.strictEqual(parsed.pathname, "/api/tunnel/control/fs/awtsmoos-os");
  const action = parsed.searchParams.get("action");
  const path = parsed.searchParams.get("path");
  if (path === "fail") return response(false, { ok: false, error: "forced_failure" }, 500);
  if (action === "list" && path === ".") return response(true, { ok: true, detailedItems: [{ name: "alias.awtsmoosJSON", path: "alias.awtsmoosJSON", type: "directory", isDirectory: true }] });
  if (action === "list") return response(true, { ok: true, detailedItems: [{ name: "file.txt", path: `${path}/file.txt`, type: "file" }] });
  if (action === "read") return response(true, { ok: true, content: "BHY content" });
  if (action === "write") return response(true, { ok: true, wrote: path, content64: parsed.searchParams.get("content64") });
  if (action === "makeFolder") return response(true, { ok: true, folder: path });
  if (action === "delete") return response(true, { ok: true, deleted: path });
  if (action === "writeIfHash") return response(true, { ok: true, path, expectedSha256: parsed.searchParams.get("expectedSha256"), content64: parsed.searchParams.get("content64") });
  return response(true, { ok: true, action, path, query: Object.fromEntries(parsed.searchParams.entries()) });
};

function response(ok, data, status = ok ? 200 : 500) {
  return { ok, status, async json() { return data; } };
}

const provider = createAwtsmoosOSProvider({ fetchImpl, ensureSession: async () => ({ ok: loginOk }), vesselName: "awtsmoos-os" });

assert.strictEqual(stripJsonSuffix("x.awtsmoosJSON"), "x");
assert.strictEqual(normalizePath("/alias/folder.awtsmoosJSON/file.txt"), "alias/folder/file.txt");
assert.strictEqual(join("alias", "file.awtsmoosJSON"), "alias/file");

let got = await provider.api("read", { path: "/alias/file.txt" });
assert.strictEqual(got.content, "BHY content");
assert.strictEqual(calls.at(-1).url.searchParams.get("path"), "alias/file.txt");

got = await provider.read({ path: "/alias/file.txt" });
assert.strictEqual(got, "BHY content");

got = await provider.write({ path: "/alias/file.txt" }, "hello");
assert.strictEqual(got.wrote, "alias/file.txt");
assert(calls.at(-1).url.searchParams.get("content64"));

const rootItems = await provider.list({ id: "root", workspaceId: "root", path: "/" });
assert.strictEqual(rootItems[0].name, "alias");
assert.strictEqual(rootItems[0].kind, "directory");
assert.strictEqual(rootItems[0].type, "awtsmoos-os");

const children = await provider.list({ id: "root", workspaceId: "root", path: "/alias" });
assert.strictEqual(children[0].name, "file.txt");
assert.strictEqual(children[0].path, "alias/file.txt");

await provider.create({ path: "/alias" }, "new.folder", "directory");
assert.strictEqual(calls.at(-1).url.searchParams.get("action"), "makeFolder");
assert.strictEqual(calls.at(-1).url.searchParams.get("path"), "alias/new.folder");

await provider.create({ path: "/alias" }, "new.txt", "file");
assert.strictEqual(calls.at(-1).url.searchParams.get("action"), "write");
assert.strictEqual(calls.at(-1).url.searchParams.get("path"), "alias/new.txt");

await provider.delete({ path: "/alias/new.txt" });
assert.strictEqual(calls.at(-1).url.searchParams.get("action"), "delete");

const wh = await provider.writeIfHash({ path: "/alias/file.txt" }, "next", "abc123");
assert.strictEqual(wh.expectedSha256, "abc123");
assert(wh.content64);

const ast = await provider.astOutline({ path: "/alias/file.js" });
assert.strictEqual(ast.action, "astOutline");
const semantic = await provider.semanticSearch({ path: "/alias" }, "query", { limit: 3 });
assert.strictEqual(semantic.query.query, "query");
const graph = await provider.dependencyGraph({ path: "/alias" }, { depth: 2 });
assert.strictEqual(graph.query.depth, "2");
const connected = await provider.connectedFiles({ path: "/alias/file.js" }, { limit: 4 });
assert.strictEqual(connected.action, "connectedFiles");
const replaced = await provider.replaceRange({ path: "/alias/file.js" }, { start: 1, end: 2, replacement: "x" });
assert.strictEqual(replaced.action, "replaceRange");
const patched = await provider.applyPatch({ path: "/alias/file.js" }, { patch: "---" });
assert.strictEqual(patched.action, "applyPatch");

const moved = await provider.move({ path: "/alias/old.txt" }, "/alias/new.txt");
assert.strictEqual(moved.moved, true);
assert.deepStrictEqual(moved.body, { oldPath: "old.txt", newPath: "new.txt" });
await assert.rejects(() => provider.move({ path: "/alias/old.txt" }, "/other/new.txt"), /Moving between aliases/);
await assert.rejects(() => provider.api("read", { path: "fail" }), /forced_failure/);

loginOk = false;
await assert.rejects(() => provider.api("list", { path: "." }), /Awtsmoos login required/);

console.log("BHY AwtsmoosOSProvider hosted adapter tests passed", calls.length);
