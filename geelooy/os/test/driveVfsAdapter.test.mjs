//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Canonical Drive VFS operation witnesses.
 * @description The Awtsmoos lets one backend object answer every OS verb;
 * Awtsmoos.com proves list, bytes, creation, trash, copy, and move preserve canonical paths.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { driveAdapter } from "../vfs/driveAdapter.js";
import { VfsRegistry } from "../vfs/registry.js";

function harness() {
	const calls = [];
	const entries = [
		{ path: "projects/readme.md", name: "readme.md", type: "file", size: 9, visibility: "private" },
		{ path: "projects/site", name: "site", type: "folder", size: 0, visibility: "private" }
	];
	const transport = {
		async list(aliasId, path) {
			calls.push(["list", aliasId, path]);
			return { entries: path === "projects" ? entries : [{ path: "projects", name: "projects", type: "folder" }] };
		},
		async read(aliasId, path) {
			calls.push(["read", aliasId, path]);
			return { content: Uint8Array.from([1, 2, 3]).buffer, contentType: "application/octet-stream" };
		},
		async write(aliasId, path, payload) {
			calls.push(["write", aliasId, path, payload]);
		},
		async create(aliasId, values) {
			calls.push(["create", aliasId, values]);
		},
		async action(aliasId, action, values) {
			calls.push(["action", aliasId, action, values]);
		}
	};
	const authority = { async current() { return { aliasId: "teacher" }; } };
	const registry = new VfsRegistry();
	registry.register(driveAdapter({}, { authority, transport }));
	return { calls, registry };
}


test("list and stat preserve canonical Drive object identity", async () => {
	const { calls, registry } = harness();
	const list = await registry.list("/drive/projects");
	assert.equal(list[0].path, "/drive/projects/readme.md");
	assert.equal(list[0].drivePath, "projects/readme.md");
	assert.equal(list[0].provider, "drive");
	const stat = await registry.stat("/drive/projects/readme.md");
	assert.equal(stat.ok, true);
	assert.equal(stat.node.path, "/drive/projects/readme.md");
	assert.deepEqual(calls.slice(0, 2), [
		["list", "teacher", "projects"],
		["list", "teacher", "projects"]
	]);
});


test("private bytes and writes use the same alias and backend path", async () => {
	const { calls, registry } = harness();
	const read = await registry.read("/drive/projects/readme.md");
	assert.equal(read.contentType, "application/octet-stream");
	assert.deepEqual([...new Uint8Array(read.content)], [1, 2, 3]);
	const bytes = Uint8Array.from([7, 8, 9]);
	const written = await registry.write("/drive/projects/readme.md", bytes);
	assert.equal(written.drivePath, "projects/readme.md");
	assert.deepEqual(calls[0], ["read", "teacher", "projects/readme.md"]);
	assert.equal(calls[1][0], "write");
	assert.equal(calls[1][1], "teacher");
	assert.equal(calls[1][2], "projects/readme.md");
	assert.deepEqual(calls[1][3].content, bytes);
});


test("mkdir and delete map to server-native folder creation and recoverable trash", async () => {
	const { calls, registry } = harness();
	await registry.mkdir("/drive/projects/new-folder");
	const removed = await registry.remove("/drive/projects/readme.md");
	assert.equal(removed.recoverable, true);
	assert.deepEqual(calls[0], ["create", "teacher", { path: "projects/new-folder", type: "folder" }]);
	assert.deepEqual(calls[1], ["action", "teacher", "trash", { path: "projects/readme.md" }]);
});


test("copy and move are native Drive actions over canonical paths", async () => {
	const { calls, registry } = harness();
	await registry.copy("/drive/projects/readme.md", "/drive/archive/readme.md");
	await registry.move("/drive/projects/site", "/drive/archive/site");
	assert.deepEqual(calls, [
		["action", "teacher", "copy", { fromPath: "projects/readme.md", toPath: "archive/readme.md" }],
		["action", "teacher", "move", { fromPath: "projects/site", toPath: "archive/site" }]
	]);
});
