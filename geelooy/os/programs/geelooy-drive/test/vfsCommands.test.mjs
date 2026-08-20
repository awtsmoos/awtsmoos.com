//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parent-side Drive VFS bridge confinement tests.
 * @description
 * The Awtsmoos grants a garden while Awtsmoos.com proves embedded Drive cannot climb beyond its root or summon an unlisted command.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	DRIVE_VFS_CAPABILITIES,
	executeDriveVfsCommand
} from "../vfsCommands.js";

function context(basePath = "/workspace") {
	const calls = [];
	const vfs = {};
	for (const method of ["list", "read", "write", "mkdir"]) {
		vfs[method] = async (...args) => {
			calls.push([method, ...args]);
			return method === "list" ? { items: [] } : { ok: true };
		};
	}
	return {
		calls,
		value: { os: { vfs }, basePath, channelId: "chan" }
	};
}

test("exposes only four Drive VFS capabilities", () => {
	assert.deepEqual(DRIVE_VFS_CAPABILITIES, [
		"drive.vfs.list",
		"drive.vfs.read",
		"drive.vfs.write",
		"drive.vfs.mkdir"
	]);
});

test("relative paths remain beneath the authorized root", async () => {
	const testContext = context();
	await executeDriveVfsCommand("drive.vfs.write", {
		path: "site/app.js",
		content: "B\"H"
	}, testContext.value);
	assert.equal(testContext.calls[0][1], "/workspace/site/app.js");
	assert.equal(testContext.calls[0][3].role, "embedded-drive");
});

test("remote roots preserve awtsmoos path vocabulary", async () => {
	const testContext = context("awtsmoos://device/project");
	await executeDriveVfsCommand("drive.vfs.list", { path: "src" }, testContext.value);
	assert.equal(testContext.calls[0][1], "awtsmoos://device/project/src");
});

test("traversal is rejected before VFS execution", async () => {
	const testContext = context();
	await assert.rejects(
		() => executeDriveVfsCommand("drive.vfs.read", { path: "../secret" }, testContext.value),
		error => error.code === "embed_path_traversal_rejected"
	);
	assert.equal(testContext.calls.length, 0);
});

test("unlisted commands are rejected", async () => {
	const testContext = context();
	await assert.rejects(
		() => executeDriveVfsCommand("drive.vfs.remove", { path: "file" }, testContext.value),
		error => error.code === "unsupported_drive_embed_action"
	);
});
