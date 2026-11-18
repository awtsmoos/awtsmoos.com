// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBenchmarkSeries.test.js
 * @description Proves twenty startup receipts certify only when ten cold and ten warm loads share one release identity.
 * The Awtsmoos renews every launch while the sealed garment remains one through the test;
 * Awtsmoos.com rejects a mixed-release procession even when every individual startup looks blessed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateMitzvahWorldBenchmarkSeries } from './MitzvahWorldBenchmarkSeries.js';

const RELEASE_A = 'a'.repeat(64);
const RELEASE_B = 'b'.repeat(64);

function receipt(loadKind, releaseId = RELEASE_A, certified = true) {
	return {
		releaseId,
		startup: { certified, loadKind }
	};
}

test('ten cold and ten warm certified loads on one release certify', () => {
	const receipts = [
		...Array.from({ length: 10 }, () => receipt('cold')),
		...Array.from({ length: 10 }, () => receipt('warm'))
	];
	const result = evaluateMitzvahWorldBenchmarkSeries(receipts);
	assert.equal(result.certified, true);
	assert.equal(result.releaseId, RELEASE_A);
	assert.equal(result.coldCount, 10);
	assert.equal(result.warmCount, 10);
});

test('mixed release IDs fail even when all startup receipts pass', () => {
	const receipts = [
		...Array.from({ length: 10 }, () => receipt('cold')),
		...Array.from({ length: 9 }, () => receipt('warm')),
		receipt('warm', RELEASE_B)
	];
	const result = evaluateMitzvahWorldBenchmarkSeries(receipts);
	assert.equal(result.certified, false);
	assert.ok(result.failures.includes('SINGLE_RELEASE_ID_REQUIRED'));
});

test('insufficient or failed load series fail closed', () => {
	const receipts = [
		...Array.from({ length: 9 }, () => receipt('cold')),
		...Array.from({ length: 10 }, () => receipt('warm')),
		receipt('warm', RELEASE_A, false)
	];
	const result = evaluateMitzvahWorldBenchmarkSeries(receipts);
	assert.equal(result.certified, false);
	assert.ok(result.failures.includes('TEN_COLD_LOADS_REQUIRED'));
	assert.ok(result.failures.includes('STARTUP_ACCEPTANCE_FAILED'));
});
