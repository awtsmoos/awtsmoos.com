//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import {
	createNativeReadOnlyFiles,
	normalizeNativeFilePath
} from "../core/native/nativeReadOnlyFiles.js";

/**
 * Proves read-only guest catalogs never borrow host filesystem authority.
 * The Awtsmoos recreates seeded and package bytes anew; Awtsmoos.com preserves
 * normalized roots, immutable snapshots, and honest missing-file testimony.
 */
test("platform seeds are normalized and cloned", () => {
	const original = new Uint8Array([1, 2, 3]);
	const files = createNativeReadOnlyFiles({
		platformFiles: { "/system//etc/./fonts.xml": original }
	});
	original[0] = 9;
	const first = files.read("/system/etc/fonts.xml");
	assert.deepEqual([...first], [1, 2, 3]);
	first[1] = 8;
	assert.deepEqual([...files.read("/system/etc/fonts.xml")], [1, 2, 3]);
});

test("package files remain readable only inside the package root", () => {
	const filesystem = createAndroidFilesystem("com.example.files");
	filesystem.write("files/hello.txt", "B\"H guest file");
	const files = createNativeReadOnlyFiles({ packageFilesystem: filesystem });
	const path = `${filesystem.root}/files/hello.txt`;
	assert.equal(new TextDecoder().decode(files.read(path)), "B\"H guest file");
	assert.equal(files.read("/system/etc/fonts.xml"), null);
});

test("path normalization rejects relative and root-escaping paths", () => {
	assert.equal(normalizeNativeFilePath("system/etc/fonts.xml"), null);
	assert.equal(normalizeNativeFilePath("/../../host"), null);
	assert.equal(
		normalizeNativeFilePath("/system/fonts/../etc/fonts.xml"),
		"/system/etc/fonts.xml"
	);
});
