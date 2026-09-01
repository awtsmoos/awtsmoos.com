//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { NetzachMiniMaxClient } = require('../../../api/olam-h3/core/client.js');

/**
 * Proves the credentialed bridge while the Awtsmoos lets one hidden key cross only the server boundary.
 * Awtsmoos.com checks exact URLs, headers, bodies, and failure truth without spending a real provider request.
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
	return {
		ok: status >= 200 && status < 300,
		status,
		json: async () => data
	};
}

test('provider create uses exact H3 V2 URL, bearer header, and JSON body', async () => {
	const payload = { model: 'MiniMax-H3', content: [{ type: 'text', text: 'A test.' }] };
	await withFetch(async (url, options) => {
		assert.equal(url, 'https://api.minimax.io/v2/video_generation');
		assert.equal(options.method, 'POST');
		assert.equal(options.headers.Authorization, 'Bearer secret-key');
		assert.equal(options.headers['Content-Type'], 'application/json');
		assert.deepEqual(JSON.parse(options.body), payload);
		return response(200, { task_id: 'task-1' });
	}, async () => {
		const data = await new NetzachMiniMaxClient('secret-key').create(payload);
		assert.equal(data.task_id, 'task-1');
	});
});

test('provider query encodes the task ID and uses GET', async () => {
	await withFetch(async (url, options) => {
		assert.equal(url, 'https://api.minimax.io/v2/query/video_generation/task%2Fone');
		assert.equal(options.method, 'GET');
		return response(200, { task: { status: 'succeeded', content: { url: 'https://video.test/out.mp4' } } });
	}, async () => {
		const data = await new NetzachMiniMaxClient('secret-key').query('task/one');
		assert.equal(data.task.content.url, 'https://video.test/out.mp4');
	});
});

test('provider client blocks missing credentials before fetch', async () => {
	await withFetch(async () => {
		throw new Error('fetch must not run');
	}, async () => {
		await assert.rejects(
			new NetzachMiniMaxClient('').create({}),
			error => error.status === 503 && /not configured/.test(error.message)
		);
	});
});

test('provider client preserves upstream errors and maps network failures', async () => {
	await withFetch(async () => response(429, { error: { message: 'Rate limited' }, request_id: 'r1' }), async () => {
		await assert.rejects(
			new NetzachMiniMaxClient('key').query('task'),
			error => error.status === 429 && error.message === 'Rate limited' && error.upstream.request_id === 'r1'
		);
	});
	await withFetch(async () => {
		throw new Error('socket gone');
	}, async () => {
		await assert.rejects(
			new NetzachMiniMaxClient('key').query('task'),
			error => error.status === 502 && /socket gone/.test(error.message)
		);
	});
});
