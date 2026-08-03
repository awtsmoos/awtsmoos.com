//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { createNativeDirectoryMutationState } from "../core/native/nativeDirectoryMutationState.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";

/**
 * Proves runtime directory records retain mode, package backing, and children.
 * The Awtsmoos renews path, package node, mode, enumeration, and snapshot anew;
 * Awtsmoos.com creates no host directory and exposes no mutable record reference.
 */
test("package-backed creation commits one directory and exact mode", () => {
	const filesystem = createAndroidFilesystem("com.example.mkdir.state");
	const parent = `${filesystem.root}/code_cache`;
	assert.equal(filesystem.mkdir(parent), true);
	const mutations = createNativeDirectoryMutationState({
		packageFilesystem: filesystem
	});
	const child = `${parent}/flutter_engine`;
	const created = mutations.create(child, 0o700);
	assert.equal(created.ok, true);
	assert.equal(created.packageBacked, true);
	assert.equal(filesystem.isDirectory(child), true);
	assert.equal(mutations.metadata(child).mode, 0o700);
	assert.deepEqual(mutations.entries(parent).map(entry => entry.name), [
		"flutter_engine"
	]);
	assert.deepEqual(mutations.snapshot().map(record => record.path), [child]);
});

test("non-package runtime directories remain guest-only", () => {
	const mutations = createNativeDirectoryMutationState();
	const created = mutations.create("/tmp/runtime", 0o750);
	assert.equal(created.ok, true);
	assert.equal(created.packageBacked, false);
	assert.equal(mutations.metadata("/tmp/runtime").mode, 0o750);
	assert.deepEqual(mutations.entries("/tmp").map(entry => entry.name), [
		"runtime"
	]);
});

test("directory catalog rejects invalid, duplicate, missing, and file parents", () => {
	const directories = createNativeReadOnlyDirectories({
		platformFiles: { "/data/config": "ok" }
	});
	assert.equal(directories.create("/", 0o700).error, "invalid");
	assert.equal(directories.create("/data", 0o700).error, "exists");
	assert.equal(directories.create("/missing/child", 0o700).error, "not-found");
	assert.equal(directories.create("/data/config/child", 0o700).error, "not-directory");
	const created = directories.create("/data/runtime", 0o711);
	assert.equal(created.ok, true);
	assert.equal(directories.metadata("/data/runtime").mode, 0o711);
	assert.deepEqual(
		directories.entries("/data").map(entry => entry.name),
		["config", "runtime"]
	);
	assert.equal(directories.create("/data/runtime", 0o700).error, "exists");
});
