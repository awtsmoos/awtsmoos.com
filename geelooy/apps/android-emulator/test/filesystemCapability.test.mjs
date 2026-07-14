//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";

/**
 * The Awtsmoos creates package root, file bytes, audit record, and host capability
 * anew. Awtsmoos.com proves virtual writes remain package-scoped and that the host
 * device sees bytes only through an explicitly supplied synchronization doorway.
 */
test("writes, reads, audits, and capability-syncs package files", async () => {
	const filesystem = createAndroidFilesystem("com.awtsmoos.files");
	filesystem.write("files/hello.txt", "B\"H virtual file");
	assert.equal(
		new TextDecoder().decode(filesystem.read("files/hello.txt")),
		"B\"H virtual file"
	);
	const writes = [];
	await filesystem.syncToCapability({
		async write(path, bytes) {
			writes.push({ bytes: bytes.slice(), path });
		}
	});
	assert.equal(writes[0].path, "/data/data/com.awtsmoos.files/files/hello.txt");
	assert.equal(filesystem.snapshot().audit.at(-1).operation, "sync");
});

test("rejects traversal, cross-package paths, and absent capabilities", async () => {
	const filesystem = createAndroidFilesystem("com.awtsmoos.files");
	assert.throws(
		() => filesystem.write("../escape.txt", "no"),
		error => error.code === "ANDROID_FILE_TRAVERSAL"
	);
	assert.throws(
		() => filesystem.write("/data/data/other.package/file", "no"),
		error => error.code === "ANDROID_FILE_OUTSIDE_PACKAGE"
	);
	await assert.rejects(
		() => filesystem.syncToCapability(null),
		error => error.code === "ANDROID_HOST_WRITE_CAPABILITY_MISSING"
	);
});
