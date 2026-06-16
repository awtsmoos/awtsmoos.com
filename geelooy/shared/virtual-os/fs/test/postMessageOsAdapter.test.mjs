// B"H
import assert from "assert";
import { PostMessageOsFsAdapter } from "../adapters/PostMessageOsFsAdapter.js";

const calls = [];
const adapter = new PostMessageOsFsAdapter({
  request: async (type, payload) => {
    calls.push({ type, payload });
    if (type === "requestFolderList") return { items: [{ name: "app.js", kind: "file", size: 12 }, { name: "folder.folder", kind: "directory" }] };
    if (type === "requestFileContent") return { content: "BHY content" };
    if (type === "requestFileWrite") return { success: true };
    if (type === "requestItemCreate") return { success: true };
    if (type === "requestItemDelete") return { success: true };
    return { error: "unknown" };
  }
});

assert.strictEqual(adapter.capabilities().fsWrite, true);
let got = await adapter.run({ action: "list", path: "desktop.folder" });
assert.strictEqual(got.ok, true);
assert.strictEqual(got.count, 2);
assert.strictEqual(got.items[0].name, "app.js");
assert.strictEqual(got.items[1].kind, "directory");

got = await adapter.run({ action: "read", path: "desktop.folder/app.js" });
assert.strictEqual(got.content, "BHY content");
assert.deepStrictEqual(calls.at(-1).payload, { path: "desktop.folder", fileName: "app.js" });

got = await adapter.run({ action: "write", path: "desktop.folder/app.js", content: "new" });
assert.strictEqual(got.ok, true);
assert.strictEqual(calls.at(-1).payload.fullPath, "desktop.folder/app.js");

got = await adapter.run({ action: "makeFolder", path: "desktop.folder/new.folder" });
assert.strictEqual(got.ok, true);
assert.strictEqual(calls.at(-1).payload.kind, "directory");

got = await adapter.run({ action: "delete", path: "desktop.folder/app.js" });
assert.strictEqual(got.ok, true);
assert.strictEqual(calls.at(-1).type, "requestItemDelete");

const broken = new PostMessageOsFsAdapter({ request: async () => ({ error: "broken" }) });
got = await broken.run({ action: "read", path: "x.txt" });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.error, "broken");

console.log("BHY PostMessageOsFsAdapter tests passed");
