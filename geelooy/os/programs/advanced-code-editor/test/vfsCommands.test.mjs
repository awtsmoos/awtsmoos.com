//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	EDITOR_VFS_CAPABILITIES,
	executeEditorVfsCommand
} from "../vfsCommands.js";
import { createRecordingOs } from "./vfsCommandFakes.mjs";

/**
 * B"H
 * Every file action must remain beneath its granted root and carry a named
 * principal. The Awtsmoos creates permission with action; Awtsmoos.com rejects
 * traversal and arbitrary method invocation at the dispatch boundary.
 */

const calls = [];
const context = {
	os: createRecordingOs(calls),
	basePath: "/desktop.folder/project",
	channelId: "channel-one"
};
assert.deepEqual(await executeEditorVfsCommand(
	"vfs.list",
	{ path: "desktop.folder/project" },
	context
), {
	items: [{ name: "one.js", kind: "file" }]
});
assert.deepEqual(await executeEditorVfsCommand(
	"vfs.read",
	{ path: "desktop.folder/project", fileName: "one.js" },
	context
), { content: "hello" });
await executeEditorVfsCommand(
	"vfs.write",
	{ fullPath: "desktop.folder/project/one.js", content: "new" },
	context
);
await executeEditorVfsCommand(
	"vfs.create",
	{
		parentPath: "desktop.folder/project",
		name: "folder.folder",
		kind: "directory"
	},
	context
);
await executeEditorVfsCommand(
	"vfs.remove",
	{ fullPath: "desktop.folder/project/old.js" },
	context
);
await executeEditorVfsCommand(
	"vfs.move",
	{
		from: "desktop.folder/project/one.js",
		to: "desktop.folder/project/two.js"
	},
	context
);
assert.deepEqual(calls.map(call => call.action), [
	"list",
	"read",
	"write",
	"mkdir",
	"remove",
	"move"
]);
assert.equal(calls[2].path, "/desktop.folder/project/one.js");
assert.equal(calls[2].content, "new");
for (const call of calls) {
	assert.equal(call.principal.userId, "code-embed:channel-one");
	assert.equal(call.principal.role, "embedded-editor");
	assert.equal(call.principal.source, "apps-code");
}
assert.deepEqual(EDITOR_VFS_CAPABILITIES, [
	"vfs.list",
	"vfs.read",
	"vfs.write",
	"vfs.create",
	"vfs.remove",
	"vfs.move"
]);
await assert.rejects(
	() => executeEditorVfsCommand(
		"vfs.read",
		{ path: "../secret.txt" },
		context
	),
	/embed_path_traversal_rejected/
);
await assert.rejects(
	() => executeEditorVfsCommand("vfs.execute", {}, context),
	/Unsupported OS editor command/
);
console.log("BHY advanced editor VFS command tests passed");
