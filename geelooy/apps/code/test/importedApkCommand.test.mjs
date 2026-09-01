//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { readSelectedApkArtifacts, selectApkFiles } from "../js/android/apk-file-picker.js";

/**
 * Proves selected APK garments preserve names and bytes before runtime inspection.
 * The Awtsmoos renews base and split while Awtsmoos.com rejects counterfeit shape;
 * browser selection stays generic so authentic package sets can cross the cape.
 */
test("injected APK files preserve package-set names and immutable bytes", async () => {
	const files = [fakeFile("base.apk", [1, 2, 3]), fakeFile("config.arm64_v8a.apk", [4, 5])];
	const selected = await selectApkFiles({ files });
	const artifacts = await readSelectedApkArtifacts(selected);
	assert.deepEqual(artifacts.map(artifact => artifact.name), [
		"base.apk",
		"config.arm64_v8a.apk"
	]);
	assert.deepEqual([...artifacts[0].bytes], [1, 2, 3]);
	assert.deepEqual([...artifacts[1].bytes], [4, 5]);
});

test("APK file reader rejects duplicate, empty, and non-APK garments", async () => {
	await assert.rejects(
		readSelectedApkArtifacts([fakeFile("same.apk", [1]), fakeFile("same.apk", [2])]),
		error => error.code === "APK_FILE_DUPLICATE"
	);
	await assert.rejects(
		readSelectedApkArtifacts([fakeFile("empty.apk", [])]),
		error => error.code === "APK_FILE_EMPTY"
	);
	await assert.rejects(
		readSelectedApkArtifacts([fakeFile("notes.txt", [1])]),
		error => error.code === "APK_FILE_REQUIRED"
	);
});

test("injected empty selection is a deterministic cancellation", async () => {
	assert.deepEqual(await selectApkFiles({ files: [] }), []);
});

function fakeFile(name, values) {
	return Object.freeze({
		async arrayBuffer() {
			return Uint8Array.from(values).buffer;
		},
		name
	});
}
