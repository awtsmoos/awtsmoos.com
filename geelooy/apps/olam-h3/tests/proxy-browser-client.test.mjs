//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { MinimaxProxyClient } from '../scripts/api/MinimaxProxyClient.js';

/**
 * Proves the browser speaks only to Awtsmoos.com while the Awtsmoos keeps MiniMax credentials beyond browser reach.
 * Every same-origin route and error field is checked so UI truth remains stable when networks or providers refuse a request.
 */
async function withFetch(handler, action) {
	const previous = global.fetch;
	global.fetch = handler;
	try {
		await action();
	} finally {
		global.fetch = previous;
	}
}

function response(status, data) {
	return { ok: status < 400, status, json: async () => data };
}

test('browser proxy status uses the same-origin status route', async () => {
	await withFetch(async (url, options) => {
		assert.equal(url, '/api/olam-h3/status');
		assert.equal(options.headers['Content-Type'], 'application/json');
		return response(200, { ok: true, configured: false });
	}, async () => {
		assert.equal((await new MinimaxProxyClient().status()).configured, false);
	});
});

test('browser proxy create sends one generation envelope', async () => {
	const generation = { model: 'MiniMax-H3', prompt: 'Move.' };
	await withFetch(async (url, options) => {
		assert.equal(url, '/api/olam-h3/create');
		assert.equal(options.method, 'POST');
		assert.deepEqual(JSON.parse(options.body), { generation });
		return response(200, { ok: true, taskId: 't1' });
	}, async () => {
		assert.equal((await new MinimaxProxyClient().create(generation)).taskId, 't1');
	});
});

test('browser proxy task sends the task ID envelope', async () => {
	await withFetch(async (url, options) => {
		assert.equal(url, '/api/olam-h3/task');
		assert.deepEqual(JSON.parse(options.body), { taskId: 't1' });
		return response(200, { ok: true, status: 'running' });
	}, async () => {
		assert.equal((await new MinimaxProxyClient().task('t1')).status, 'running');
	});
});

test('browser proxy preserves actionable server error metadata', async () => {
	await withFetch(async () => response(422, {
		ok: false,
		error: 'Bad media',
		status: 422,
		type: 'invalid_params',
		requestId: 'req-9'
	}), async () => {
		await assert.rejects(new MinimaxProxyClient().create({}), error => {
			return error.status === 422 && error.type === 'invalid_params'
				&& error.requestId === 'req-9' && error.message === 'Bad media';
		});
	});
});
