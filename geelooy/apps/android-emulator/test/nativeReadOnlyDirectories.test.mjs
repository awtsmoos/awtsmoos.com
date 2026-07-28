//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidFilesystem } from "../core/android/filesystem.js";
import { createNativeReadOnlyDirectories } from "../core/native/nativeReadOnlyDirectories.js";

test("absent authentic system directory stays absent", () => {
	const directories = createNativeReadOnlyDirectories();
	assert.equal(directories.entries("/system/etc"), null);
	assert.deepEqual(directories.snapshot().platformDirectories, []);
});

test("seeded files imply sorted immediate platform directories", () => {
	const directories = createNativeReadOnlyDirectories({
		platformFiles: {
			"/system/etc/z.xml": "z",
			"/system/etc/a.xml": "a",
			"/system/fonts/Roboto.ttf": "font"
		}
	});
	assert.deepEqual(directories.entries("/system").map(selectEntry), [
		{ name: "etc", type: "directory" },
		{ name: "fonts", type: "directory" }
	]);
	assert.deepEqual(directories.entries("/system/etc").map(selectEntry), [
		{ name: "a.xml", type: "file" },
		{ name: "z.xml", type: "file" }
	]);
});

test("package guard yields to explicit platform directories", () => {
	const filesystem = createAndroidFilesystem("com.example.platform");
	const directories = createNativeReadOnlyDirectories({
		packageFilesystem: filesystem,
		platformFiles: { "/system/etc/fonts.xml": "fonts" }
	});
	assert.deepEqual(directories.entries("/system/etc").map(selectEntry), [
		{ name: "fonts.xml", type: "file" }
	]);
	assert.equal(directories.entries("/vendor/etc"), null);
});

test("package directories expose truthful immediate child types", () => {
	const filesystem = createAndroidFilesystem("com.example.directory");
	const cache = `${filesystem.root}/cache`;
	filesystem.mkdir(cache);
	filesystem.write(`${filesystem.root}/note.txt`, new Uint8Array([1]));
	const directories = createNativeReadOnlyDirectories({ packageFilesystem: filesystem });
	assert.deepEqual(directories.entries(filesystem.root).map(selectEntry), [
		{ name: "cache", type: "directory" },
		{ name: "note.txt", type: "file" }
	]);
});

function selectEntry(entry) {
	return { name: entry.name, type: entry.type };
}
