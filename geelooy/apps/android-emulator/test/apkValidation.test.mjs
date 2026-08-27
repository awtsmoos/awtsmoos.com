//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates archive directory, CRC witness, manifest, and DEX identity
 * anew. Awtsmoos.com proves corrupt payloads and traversal cannot enter package
 * state while valid scratch artifacts remain fully reconstructable.
 */
test("validates generated APK archive, AXML, DEX, and package identity", async () => {
	const compiled = await createGeneratedApk();
	const archive = openApkArchive(compiled.bytes);
	for (const entry of archive.entries) {
		assert.equal((await archive.read(entry.name)).length, entry.size);
	}
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.archive.entryCount, 2);
	assert.equal(identity.manifest.packageName, "com.awtsmoos.generated");
	assert.equal(identity.manifest.launcherActivity, "com.awtsmoos.generated.MainActivity");
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	assert.equal(identity.dexFiles[0].summary.codeMethodCount, 2);
});

test("rejects a payload whose bytes no longer match the central CRC", async () => {
	const compiled = await createGeneratedApk();
	const archive = openApkArchive(compiled.bytes);
	const entry = archive.metadata("classes.dex");
	const corrupted = compiled.bytes.slice();
	const view = new DataView(corrupted.buffer);
	const nameLength = view.getUint16(entry.localOffset + 26, true);
	const extraLength = view.getUint16(entry.localOffset + 28, true);
	const dataOffset = entry.localOffset + 30 + nameLength + extraLength;
	corrupted[dataOffset + 40] ^= 0xff;
	await assert.rejects(
		() => openApkArchive(corrupted).read("classes.dex"),
		error => error.code === "APK_ENTRY_CRC_MISMATCH"
	);
});

test("rejects archive path traversal before any entry is opened", async () => {
	const compiled = await createGeneratedApk();
	const bytes = compiled.bytes.slice();
	const archive = openApkArchive(bytes);
	const centralNameOffset = archive.eocd.centralOffset + 46;
	bytes.set(new TextEncoder().encode("../evil-path-file"), centralNameOffset);
	assert.throws(
		() => openApkArchive(bytes),
		error => error.code === "APK_ENTRY_PATH_TRAVERSAL"
	);
});
