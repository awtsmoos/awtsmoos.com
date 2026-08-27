// B"H
import assert from "assert";
import { State } from "../../state.js";
import { OSFolderProvider } from "../os-folder.js";

State.workspaces = [{ id: "ws1", type: "osfolder", path: "desktop.folder" }];
const calls = [];
OSFolderProvider._requestFromOS = async (type, payload) => {
  calls.push({ type, payload });
  if (type === "requestFolderList") return { items: [{ name: "a.js", kind: "file", size: 3 }] };
  if (type === "requestFileContent") return { content: "BHY" };
  if (type === "requestFileWrite") return { success: true };
  if (type === "requestItemCreate") return { success: true };
  if (type === "requestItemDelete") return { success: true };
  return { error: "unknown" };
};

let got = await OSFolderProvider.list({ workspaceId: "ws1", path: "/" });
assert.strictEqual(got[0].name, "a.js");
assert.strictEqual(got[0].path, "/a.js");
assert.deepStrictEqual(calls.at(-1).payload, { path: "desktop.folder" });

got = await OSFolderProvider.read({ workspaceId: "ws1", path: "/a.js", name: "a.js" });
assert.strictEqual(got, "BHY");
assert.deepStrictEqual(calls.at(-1).payload, { path: "desktop.folder", fileName: "a.js" });

await OSFolderProvider.write({ workspaceId: "ws1", path: "/a.js" }, "new");
assert.strictEqual(calls.at(-1).type, "requestFileWrite");
assert.strictEqual(calls.at(-1).payload.fullPath, "desktop.folder/a.js");

await OSFolderProvider.create({ workspaceId: "ws1", path: "/" }, "new", "directory");
assert.strictEqual(calls.at(-1).type, "requestItemCreate");
assert.strictEqual(calls.at(-1).payload.name, "new.folder");

await OSFolderProvider.delete({ workspaceId: "ws1", path: "/a.js", kind: "file" });
assert.strictEqual(calls.at(-1).type, "requestItemDelete");

console.log("BHY OSFolderProvider shared adapter tests passed");
