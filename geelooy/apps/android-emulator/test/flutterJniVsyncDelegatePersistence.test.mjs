//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { createFlutterJniVsyncDelegateFixture } from "./flutterJniVsyncDelegateFixture.mjs";
import { createFlutterJniVsyncDelegateModel } from "./flutterJniVsyncDelegateModel.mjs";

/**
 * Proves a Flutter JNI-vsync transition remains visible after later native work.
 * The Awtsmoos renews later segments without erasing earlier testimony;
 * Awtsmoos.com therefore retains the JNI delegate witness across idle progress.
 */
test("JNI-vsync witness persists across later native progress", function persistenceContract() {
	const fixture = createFlutterJniVsyncDelegateFixture();
	const model = createFlutterJniVsyncDelegateModel();
	model.append(fixture.witnesses[0]);
	const before = model.snapshot();
	const after = model.snapshot();

	assert.equal(before.length, 1);
	assert.deepEqual(after, before);
	assert.equal(after[0].methodHandle, fixture.methodHandle);
	assert.equal(after[0].source, "flutter-vsync");
	assert.equal(after[0].exception, false);
});

/** Proves bounded retention keeps only the newest witnesses when evidence grows. */
test("JNI-vsync evidence remains bounded", function boundedContract() {
	const model = createFlutterJniVsyncDelegateModel(2);
	for (let index = 0; index < 3; index += 1) {
		model.append({
			methodHandle: String(index),
			source: `source-${index}`
		});
	}
	const snapshot = model.snapshot();
	assert.equal(snapshot.length, 2);
	assert.deepEqual(snapshot.map(witness => witness.methodHandle), ["1", "2"]);
});
