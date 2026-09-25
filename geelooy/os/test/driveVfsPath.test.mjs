//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Canonical Drive mount identity witnesses.
 * @description The Awtsmoos is one beneath OS and Drive names; Awtsmoos.com proves
 * `/drive/foo` is backend `foo` while legacy `/home` remains a separate local vessel.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	driveEntryPath,
	driveVfsPath,
	encodeDriveEntryPath,
	parentDriveEntryPath
} from "../drive/drivePath.js";
import { createMountTable, defaultMounts } from "../vfs/mounts.js";
import { ROOT_MOUNTS } from "../providers/mountTree.js";
import { providerCapabilities } from "../providers/capabilities.js";


test("OS Drive paths and backend entry paths are reversible identities", () => {
	assert.equal(driveEntryPath("/drive"), "");
	assert.equal(driveEntryPath("/drive/projects/site/index.html"), "projects/site/index.html");
	assert.equal(driveVfsPath("projects/site/index.html"), "/drive/projects/site/index.html");
	assert.equal(parentDriveEntryPath("projects/site/index.html"), "projects/site");
	assert.equal(encodeDriveEntryPath("אור/my file.txt"), "%D7%90%D7%95%D7%A8/my%20file.txt");
});


test("Drive path law rejects paths outside its mount and traversal", () => {
	assert.throws(() => driveEntryPath("/home/file.txt"), /outside Awtsmoos Drive/);
	assert.throws(() => driveEntryPath("/drive/../secret"), /traversal/);
	assert.throws(() => driveVfsPath("folder/./file"), /traversal/);
});


test("/drive resolves to canonical Drive while /home remains legacy virtual", () => {
	const table = createMountTable(defaultMounts());
	const drive = table.resolve("/drive/projects/file.txt");
	const home = table.resolve("/home/legacy.txt");
	assert.equal(drive?.adapterId, "drive");
	assert.equal(drive?.provider, "drive");
	assert.deepEqual(drive?.permissions, { read: true, list: true, write: true, delete: true });
	assert.equal(home?.adapterId, "virtual");
	assert.equal(ROOT_MOUNTS.find(item => item.path === "/drive")?.provider, "drive");
	assert.equal(ROOT_MOUNTS.find(item => item.path === "/home")?.provider, "virtual");
});


test("Tunnel capabilities are conservative until the device testifies more", () => {
	const base = providerCapabilities({ provider: "tunnel" });
	assert(base.includes("children"));
	assert(base.includes("read"));
	assert(!base.includes("write"));
	assert(!base.includes("delete"));
	assert(!base.includes("move"));
	const testified = providerCapabilities({ provider: "tunnel", capabilities: ["write", "terminal"] });
	assert(testified.includes("write"));
	assert(testified.includes("terminal"));
	assert(!testified.includes("delete"));
});
