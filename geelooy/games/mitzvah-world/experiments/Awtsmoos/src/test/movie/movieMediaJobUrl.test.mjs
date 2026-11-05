// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieMediaJobUrl.test.mjs
 * @description Proves URL policy, relative resolution, HEAD fallback, finite evidence, and abort relay.
 * The Awtsmoos is beyond scheme and request; Awtsmoos.com verifies every finite media probe
 * enters through an allowed door, closes its body, and obeys cancellation without hidden mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieMediaJobUrl, probeMovieMediaUrl } from '../../movie/MovieMediaJobUrl.js';

test('media job URL policy resolves project-relative paths and rejects unsafe schemes', () => {
	assert.deepEqual(normalizeMovieMediaJobUrl('/media/a.mp4', 'https://studio.test/movie/'), {
		absoluteUrl: 'https://studio.test/media/a.mp4',
		source: '/media/a.mp4'
	});
	assert.throws(
		() => normalizeMovieMediaJobUrl('javascript:alert(1)'),
		/not allowed/
	);
	assert.throws(() => normalizeMovieMediaJobUrl(''), /required/);
});

test('probe falls back from failed HEAD to bounded GET and returns JSON evidence', async () => {
	const calls = [];
	let cancelled = 0;
	const fetchImpl = async (_url, options) => {
		calls.push({ headers: options.headers || null, method: options.method });
		return fakeResponse(options.method === 'GET', options.method === 'GET' ? 206 : 405, () => {
			cancelled += 1;
		});
	};
	const result = await probeMovieMediaUrl('/media/a.mp4', {
		baseUrl: 'https://studio.test/', fetchImpl
	});
	assert.deepEqual(calls, [
		{ headers: null, method: 'HEAD' },
		{ headers: { Range: 'bytes=0-0' }, method: 'GET' }
	]);
	assert.deepEqual(result, {
		contentLength: 1,
		contentType: 'video/mp4',
		ok: true,
		status: 206,
		url: '/media/a.mp4'
	});
	assert.equal(cancelled, 2);
	assert.doesNotThrow(() => JSON.stringify(result));
});

test('external abort reaches the active fetch and rejects the probe', async () => {
	const controller = new AbortController();
	let observedAbort = false;
	const fetchImpl = (_url, options) => new Promise((_resolve, reject) => {
		options.signal.addEventListener('abort', () => {
			observedAbort = true;
			reject(new Error('aborted'));
		}, { once: true });
	});
	const pending = probeMovieMediaUrl('/slow.mp4', {
		baseUrl: 'https://studio.test/', fetchImpl, signal: controller.signal
	});
	controller.abort('test cancellation');
	await assert.rejects(pending, /aborted/);
	assert.equal(observedAbort, true);
});

function fakeResponse(ok, status, cancel) {
	return {
		body: { cancel: async () => cancel() },
		headers: {
			get: name => name === 'content-length' ? '1'
				: name === 'content-type' ? 'video/mp4' : null
		},
		ok,
		status
	};
}
