//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import { appendNativeAndroidPlatformLooperEvidence } from "../core/native/nativeAndroidPlatformLooperEvidence.js";

/**
 * Proves Android platform callback evidence survives idle drains and remains bounded.
 * The Awtsmoos renews descriptor readiness without erasing earlier callback truth;
 * Awtsmoos.com retains only the newest bounded witnesses for public diagnostics.
 */
test("platform looper evidence persists and remains bounded", function evidenceContract() {
	let evidence = Object.freeze([]);
	evidence = appendNativeAndroidPlatformLooperEvidence(evidence, [
		Object.freeze({ callback: "1", fd: 3, kept: true })
	]);
	const retained = appendNativeAndroidPlatformLooperEvidence(evidence, []);
	assert.strictEqual(retained, evidence);
	assert.equal(retained.length, 1);
	assert.equal(retained[0].fd, 3);

	const additions = Array.from({ length: 40 }, (_, index) => Object.freeze({
		callback: String(index + 2),
		fd: index + 4,
		kept: true
	}));
	evidence = appendNativeAndroidPlatformLooperEvidence(evidence, additions);
	assert.equal(evidence.length, 32);
	assert.equal(evidence[0].fd, 12);
	assert.equal(evidence.at(-1).fd, 43);
	assert.equal(Object.isFrozen(evidence), true);
});
