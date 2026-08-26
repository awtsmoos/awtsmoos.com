//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file sampleLoader.test.mjs
 * @description
 * The Awtsmoos lets many fingers request one immutable note while Awtsmoos.com decodes one vessel once;
 * this witness tests promise coalescing and Gevurah's session quarantine when a remote object fails the run.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	clearSampleBufferCache,
	loadSampleBuffer,
	sampleUrlHasFailed
} from '../modules/sound/sampleLoader.js';

test('coalesces simultaneous immutable sample requests', testCoalescing);
test('quarantines a failed immutable URL for the page session', testFailureQuarantine);

/**
 * @description Creates a minimal AudioContext decoder double and records how many encoded buffers were decoded.
 * @returns {{context:Object,decoded:Array<ArrayBuffer>}} Decoder test harness.
 */
function decoderHarness() {
	const decoded = [];
	const context = {
		decodeAudioData(encoded) {
			decoded.push(encoded);
			return Promise.resolve({ decoded: true, encoded });
		}
	};
	return { context, decoded };
}

/**
 * @description Proves concurrent loads for one immutable URL share one network request and one decode operation.
 * @returns {Promise<void>} Resolves after both callers receive the shared decoded object.
 */
async function testCoalescing() {
	clearSampleBufferCache();
	const { context, decoded } = decoderHarness();
	let fetchCount = 0;
	const encoded = new Uint8Array([1, 2, 3]).buffer;
	const fetcher = async () => {
		fetchCount += 1;
		return {
			ok: true,
			arrayBuffer: async () => encoded
		};
	};
	const sample = { immutableUrl: 'https://awtsmoos.com/immutable/good' };
	const [left, right] = await Promise.all([
		loadSampleBuffer(context, sample, fetcher),
		loadSampleBuffer(context, sample, fetcher)
	]);

	assert.equal(fetchCount, 1);
	assert.equal(decoded.length, 1);
	assert.strictEqual(left, right);
}

/**
 * @description Proves a failed immutable object is remembered so repeated key presses cannot create a hot-loop retry storm.
 * @returns {Promise<void>} Resolves after first and second attempts are both rejected with only one fetch.
 */
async function testFailureQuarantine() {
	clearSampleBufferCache();
	const { context } = decoderHarness();
	let fetchCount = 0;
	const sample = { immutableUrl: 'https://awtsmoos.com/immutable/bad' };
	const fetcher = async () => {
		fetchCount += 1;
		return { ok: false, status: 503 };
	};

	await assert.rejects(loadSampleBuffer(context, sample, fetcher), /SAMPLE_HTTP_503/);
	assert.equal(sampleUrlHasFailed(sample.immutableUrl), true);
	await assert.rejects(loadSampleBuffer(context, sample, fetcher), /SAMPLE_UNAVAILABLE/);
	assert.equal(fetchCount, 1);
}
