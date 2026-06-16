// B"H
import assert from "assert";
import { availableVirtualFsActions, isReadAction, isWriteAction, normalizeVirtualFsAction } from "../actions.js";
import { basename, dirname, joinVirtualPath, normalizeVirtualPath } from "../path.js";
import { commandResult, failResult, listItem, listResult, readResult } from "../result.js";
import { capabilitiesForVirtualFs } from "../capabilities.js";

assert.strictEqual(normalizeVirtualFsAction("ls"), "list");
assert.strictEqual(normalizeVirtualFsAction("mkdir"), "makeFolder");
assert.strictEqual(normalizeVirtualFsAction("run_terminal_command"), "commandRun");
assert(isReadAction("read"));
assert(isWriteAction("write"));
assert(availableVirtualFsActions().includes("bulk"));

assert.strictEqual(normalizeVirtualPath("/a//b/c.txt"), "a/b/c.txt");
assert.strictEqual(joinVirtualPath("a", "b", "c.txt"), "a/b/c.txt");
assert.strictEqual(basename("a/b/c.txt"), "c.txt");
assert.strictEqual(dirname("a/b/c.txt"), "a/b");
assert.throws(() => normalizeVirtualPath("a/../secret"), /virtual_path_escape_blocked/);
assert.throws(() => normalizeVirtualPath("a/%252e%252e/secret"), /virtual_path_escape_blocked/);
assert.throws(() => normalizeVirtualPath("C:/secret"), /virtual_path_scheme_blocked/);

const item = listItem({ name: "file.txt", path: "a/file.txt" });
assert.strictEqual(item.kind, "file");
assert.strictEqual(item.isDirectory, false);
const listed = listResult("list", "a", [item]);
assert.strictEqual(listed.count, 1);
const read = readResult("read", "a/file.txt", "abcdef", { offsetChars: 2, maxChars: 2 });
assert.strictEqual(read.content, "cd");
assert.strictEqual(read.nextOffsetChars, 4);
const cmd = commandResult({ command: "bad", exitCode: 1, stderr: "no", simulated: true });
assert.strictEqual(cmd.ok, false);
const fail = failResult("read", new Error("boom"));
assert.strictEqual(fail.ok, false);
assert.strictEqual(capabilitiesForVirtualFs("nativeTunnel").nativeShell, true);

console.log("BHY shared virtual fs action/path/result tests passed");
