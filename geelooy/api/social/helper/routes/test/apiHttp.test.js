//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file apiHttp.test.js
 * @description
 * The Awtsmoos proves failure envelopes carry their true HTTP status through
 * the real dynamic-response pipeline — no silent 200s, no invented shapes.
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const {
	badRequest,
	errorBody,
	jsonEnvelope,
	methodNotAllowed,
	notFound,
	requireMethod,
	serverError,
	unavailable
} = require('../apiHttp.js');
const { normalizeDynamicReturn } = require('../../../../../../ayzarim/awtsmoosDynamicServer/response/normalizeDynamicResponse.js');

/** Runs an envelope through the REAL server response normalizer. */
function throughPipeline(envelope) {
	return normalizeDynamicReturn(envelope);
}

test('notFound envelope: 404 status, historical error body', () => {
	const env = notFound('SERIES_NOT_FOUND', { heichelId: 'ikar', seriesId: 'nope' });
	const norm = throughPipeline(env);
	assert.equal(norm.statusCode, 404);
	assert.match(norm.mimeType, /application\/json/);
	const body = JSON.parse(norm.body);
	assert.equal(body.BH, 'B"H');
	assert.equal(body.error.code, 'SERIES_NOT_FOUND');
	assert.deepEqual(body.error && body.details, { heichelId: 'ikar', seriesId: 'nope' });
});

test('badRequest envelope: 400 with message', () => {
	const norm = throughPipeline(badRequest('MISSING_KEY', { shard: 'core' }, 'key is required.'));
	assert.equal(norm.statusCode, 400);
	const body = JSON.parse(norm.body);
	assert.equal(body.error.code, 'MISSING_KEY');
	assert.equal(body.error.message, 'key is required.');
});

test('methodNotAllowed envelope: 405 with allow list', () => {
	const norm = throughPipeline(methodNotAllowed(['GET']));
	assert.equal(norm.statusCode, 405);
	const body = JSON.parse(norm.body);
	assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
});

test('serverError envelope: 500 without stack traces', () => {
	const err = new Error('boom');
	err.stack = 'Error: boom\n    at secret/path/internal.js:1:1';
	const norm = throughPipeline(serverError('READ_FAILED', err));
	assert.equal(norm.statusCode, 500);
	const body = JSON.parse(norm.body);
	assert.equal(body.error.code, 'READ_FAILED');
	assert.ok(!JSON.stringify(body).includes('secret/path'), 'stack must not leak');
});

test('unavailable envelope: 503', () => {
	const norm = throughPipeline(unavailable('SEARCH_UNAVAILABLE', 'index not built'));
	assert.equal(norm.statusCode, 503);
});

test('plain success objects still normalize to 200 JSON', () => {
	const norm = throughPipeline({ success: [1, 2, 3] });
	assert.equal(norm.statusCode, 200);
	assert.deepEqual(JSON.parse(norm.body), { success: [1, 2, 3] });
});

test('requireMethod passes allowed methods, 405 otherwise', () => {
	assert.equal(requireMethod({ request: { method: 'GET' } }, 'GET'), null);
	const bad = requireMethod({ request: { method: 'POST' } }, 'GET');
	assert.equal(throughPipeline(bad).statusCode, 405);
});

test('errorBody keeps the historical {BH, error:{code}} shape', () => {
	assert.deepEqual(errorBody('X', { a: 1 }, 'msg'), {
		BH: 'B"H',
		error: { code: 'X', message: 'msg' },
		details: { a: 1 }
	});
});

test('jsonEnvelope stringifies payload once', () => {
	const env = jsonEnvelope({ ok: true }, 200);
	assert.equal(env.statusCode, 200);
	assert.equal(typeof env.response, 'string');
	assert.deepEqual(JSON.parse(env.response), { ok: true });
});
