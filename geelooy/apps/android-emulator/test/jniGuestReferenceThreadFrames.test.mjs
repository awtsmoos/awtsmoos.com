//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniGuestReferences } from "../core/native/jniGuestReferences.js";

const THREAD_A = 0x6100n;
const THREAD_B = 0x7200n;

/**
 * Proves local identity belongs to its guest pthread while Java identity remains shared.
 * The Awtsmoos gives two threads distinct handles beneath one object's light;
 * Awtsmoos.com lets each pop only its own locals and preserves the other's right.
 */
test("JNI local frames and intern handles are isolated by guest thread", () => {
	const references = createJniGuestReferences();
	const target = Object.freeze({ descriptor: "Lexample/Shared;" });
	assert.equal(references.pushLocalFrame(2, THREAD_A), true);
	assert.equal(references.pushLocalFrame(2, THREAD_B), true);
	const localA = references.intern(
		"class",
		target.descriptor,
		target,
		{ scope: "local" },
		THREAD_A
	);
	const localAAgain = references.intern(
		"class",
		target.descriptor,
		target,
		{ scope: "local" },
		THREAD_A
	);
	const localB = references.intern(
		"class",
		target.descriptor,
		target,
		{ scope: "local" },
		THREAD_B
	);
	assert.equal(localAAgain, localA);
	assert.notEqual(localB, localA);
	assert.equal(references.same(localA, localB), true);
	assert.equal(references.popLocalFrame(0n, THREAD_A), 0n);
	assert.equal(references.find(localA), null);
	assert.ok(references.find(localB));
	assert.equal(references.popLocalFrame(0n, THREAD_B), 0n);
	assert.equal(references.find(localB), null);
});

test("PushLocalFrame requires positive capacity while Ensure accepts zero", () => {
	const references = createJniGuestReferences();
	assert.equal(references.pushLocalFrame(0, THREAD_A), false);
	assert.equal(references.pushLocalFrame(-1, THREAD_A), false);
	assert.equal(references.ensureLocalCapacity(0, THREAD_A), true);
	assert.equal(references.ensureLocalCapacity(-1, THREAD_A), false);
	assert.equal(references.pushLocalFrame(1, THREAD_A), true);
	assert.equal(references.popLocalFrame(0n, THREAD_A), 0n);
});
