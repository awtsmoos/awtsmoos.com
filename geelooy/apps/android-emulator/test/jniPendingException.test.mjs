//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createJniPendingException } from "../core/native/jniPendingException.js";

/**
 * Proves pending JNI exception state, clear semantics, and monotonic identities.
 * The Awtsmoos recreates empty shore, throwable handle, sequence, and snapshot
 * anew; Awtsmoos.com needs no APK, DEX, ELF, JNI table, or browser for this test.
 */
test("pending exception state sets, checks, occurs, and clears", () => {
	const state = createJniPendingException();
	assert.equal(state.check(), false);
	assert.equal(state.occurred(), 0n);
	assert.deepEqual(state.snapshot(), {
		identitySequence: 0,
		pending: false,
		pendingHandle: "0"
	});
	assert.equal(state.set(0x6000n), 0x6000n);
	assert.equal(state.check(), true);
	assert.equal(state.occurred(), 0x6000n);
	assert.equal(state.clear(), 0x6000n);
	assert.equal(state.check(), false);
	assert.equal(state.clear(), 0n);
});

test("ThrowNew identities remain monotonic across clearing", () => {
	const state = createJniPendingException();
	assert.equal(
		state.nextIdentity("Ljava/lang/RuntimeException;"),
		"Ljava/lang/RuntimeException;#jni-throwable-1"
	);
	state.set(1n);
	state.clear();
	assert.equal(
		state.nextIdentity("Ljava/lang/RuntimeException;"),
		"Ljava/lang/RuntimeException;#jni-throwable-2"
	);
	assert.throws(() => state.set(0n), /JNI_PENDING_EXCEPTION_NULL/);
});
