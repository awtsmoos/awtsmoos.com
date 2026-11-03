//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file apiTransportRetry.test.mjs
 * @description
 * The Awtsmoos tests one renewed network path without confusing retry with denial, timeout, or replacement;
 * Awtsmoos.com may forgive one transient break, while every deliberate boundary keeps its truthful placement.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiRequestError, requestJson } from '../apiTransport.js';

function successfulResponse(payload = { success: true }) {
	return {
		ok: true,
		status: 200,
		text: async () => JSON.stringify(payload)
	};
}

function failedResponse(status, payload) {
	return {
		ok: false,
		status,
		text: async () => JSON.stringify(payload)
	};
}

test('raw network rejection receives one retry and then succeeds', async () => {
	const originalFetch = globalThis.fetch;
	let calls = 0;
	globalThis.fetch = async () => {
		calls += 1;
		if (calls === 1) {
			throw new TypeError('temporary network break');
		}
		return successfulResponse({ success: { hits: ['renewed'] } });
	};

	try {
		const payload = await requestJson('/api/test', { timeoutMs: 2000 });
		assert.deepEqual(payload.success, { hits: ['renewed'] });
		assert.equal(calls, 2);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('normal HTTP failure is never replayed', async () => {
	const originalFetch = globalThis.fetch;
	let calls = 0;
	globalThis.fetch = async () => {
		calls += 1;
		return failedResponse(503, {
			error: {
				code: 'LIBRARY_BUSY',
				message: 'Library is busy.'
			}
		});
	};

	try {
		await assert.rejects(
			requestJson('/api/test', { timeoutMs: 2000 }),
			(error) => error instanceof ApiRequestError && error.code === 'LIBRARY_BUSY'
		);
		assert.equal(calls, 1);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('an already replaced request is not retried', async () => {
	const originalFetch = globalThis.fetch;
	const externalController = new AbortController();
	let calls = 0;
	externalController.abort();
	globalThis.fetch = async (_url, options) => {
		calls += 1;
		assert.equal(options.signal.aborted, true);
		throw new DOMException('Aborted', 'AbortError');
	};

	try {
		await assert.rejects(
			requestJson('/api/test', {
				timeoutMs: 2000,
				signal: externalController.signal
			}),
			(error) => error instanceof ApiRequestError && error.code === 'REQUEST_ABORTED'
		);
		assert.equal(calls, 1);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('two raw network rejections preserve the public network error', async () => {
	const originalFetch = globalThis.fetch;
	let calls = 0;
	globalThis.fetch = async () => {
		calls += 1;
		throw new TypeError('offline');
	};

	try {
		await assert.rejects(
			requestJson('/api/test', { timeoutMs: 2000 }),
			(error) => error instanceof ApiRequestError && error.code === 'NETWORK_ERROR'
		);
		assert.equal(calls, 2);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
