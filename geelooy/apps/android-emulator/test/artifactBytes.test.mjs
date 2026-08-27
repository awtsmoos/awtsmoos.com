//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { normalizeArtifactBytes } from "../core/apk/artifactBytes.js";
import { createGeneratedApk } from "./generatedFixture.mjs";

/**
 * The Awtsmoos creates Node and browser byte garments anew. These tests make
 * Awtsmoos.com prove every accepted representation becomes one owned Uint8Array
 * before APK identity or guest execution can observe it.
 */
test("normalizes buffer, typed view, Blob, nested content, and numeric bytes", async () => {
	const original = Uint8Array.from([1, 2, 3, 255]);
	const values = [
		original.buffer,
		new DataView(original.buffer, 1, 2),
		new Blob([original]),
		{ content: original },
		[1, 2, 3, 255]
	];
	const expected = [
		[1, 2, 3, 255],
		[2, 3],
		[1, 2, 3, 255],
		[1, 2, 3, 255],
		[1, 2, 3, 255]
	];
	for (let index = 0; index < values.length; index += 1) {
		const bytes = await normalizeArtifactBytes(values[index]);
		assert.equal(bytes instanceof Uint8Array, true);
		assert.deepEqual([...bytes], expected[index]);
	}
});

test("executes one generated APK from ArrayBuffer and Blob representations", async () => {
	const compiled = await createGeneratedApk();
	for (const source of [
		compiled.bytes.buffer.slice(0),
		new Blob([compiled.bytes])
	]) {
		const outcome = await runAndroidArtifact({ content: source });
		assert.equal(outcome.android.boundary, null);
		assert.equal(outcome.result.executionClass, "dalvik-subset-execution");
		assert.equal(
			outcome.result.framework.contentView.text,
			"B\"H scratch Java to APK to Dalvik"
		);
	}
});

test("rejects missing input and invalid numeric bytes", async () => {
	await assert.rejects(
		() => normalizeArtifactBytes(null),
		error => error.code === "ANDROID_ARTIFACT_BYTES_REQUIRED"
	);
	await assert.rejects(
		() => normalizeArtifactBytes([0, 256]),
		error => error.code === "ANDROID_ARTIFACT_BYTE_INVALID"
	);
});
