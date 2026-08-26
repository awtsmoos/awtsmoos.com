//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ApiFoundationContract
 * @description
 * The Awtsmoos lets paths, queries, bodies, envelopes, and cancellation differ without losing one underlying truth;
 * Awtsmoos.com proves the Domem and Yesod foundations preserve behavior while transport power remains data-shaped and smooth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { queryString, encodedCoordinate } from './ApiRouteCovenant.js';
import { ApiTransport } from './ApiTransport.js';
import { SocialApiError } from './SocialApiError.js';

/**
 * @class MalchusTestGateway
 * @extends YesodApiGateway
 * @description A bounded test vessel revealing inherited URL and mutation grammar without borrowing a production domain root.
 */
class MalchusTestGateway extends YesodApiGateway {
	static shoreshPath = '/api/test';
}

/**
 * Creates one recording transport whose resolved value remains visible.
 * @returns {{ calls: Array, request: Function }} Test transport and captured request ledger.
 */
function createRecordingGatewayTransport() {
	const calls = [];
	return {
		calls,
		request(url, options) {
			calls.push([url, options]);
			return Promise.resolve({ url, options });
		}
	};
}

/**
 * Creates a response-shaped object without coupling tests to browser Response.
 * @param {object} payload JSON envelope returned by the fake service.
 * @param {{ status?: number, ok?: boolean }} options HTTP response metadata.
 * @returns {object} Response-shaped fixture.
 */
function createResponse(payload, options = {}) {
	return {
		status: options.status ?? 200,
		ok: options.ok ?? true,
		json: async () => payload
	};
}

test('query covenant preserves order, omission, deliberate empties, and safe coordinates', () => {
	assert.equal(queryString({ q: 'Torah light', page: 2, empty: '', absent: null }), '?q=Torah+light&page=2');
	assert.equal(queryString({ aliasId: 'moshe', q: '' }, { includeEmpty: true }), '?aliasId=moshe&q=');
	assert.equal(encodedCoordinate('a/b c'), 'a%2Fb%20c');
});

test('Yesod gateway preserves request grammar and lets reads carry transport controls', async () => {
	const yesodRecorder = createRecordingGatewayTransport();
	const malchusGateway = new MalchusTestGateway(yesodRecorder);
	await malchusGateway.read('items/a', { q: 'one' });
	await malchusGateway.read('items/b', { q: 'two' }, {}, { timeoutMs: 4321, headers: { 'x-proof': 'light' } });
	await malchusGateway.write('items', { title: 'B"H' }, { keepalive: true });
	await malchusGateway.remove('items/a');
	assert.deepEqual(yesodRecorder.calls, [
		['/api/test/items/a?q=one', {}],
		['/api/test/items/b?q=two', { timeoutMs: 4321, headers: { 'x-proof': 'light' } }],
		['/api/test/items', { keepalive: true, method: 'POST', body: { title: 'B"H' } }],
		['/api/test/items/a', { method: 'DELETE' }]
	]);
});

test('transport preserves legacy and modern envelope data', async () => {
	const legacyTransport = new ApiTransport(async () => createResponse({ ok: true, success: { id: 'legacy' } }));
	const modernTransport = new ApiTransport(async () => createResponse({ data: { id: 'modern' }, meta: { page: 1 } }));
	assert.deepEqual(await legacyTransport.request('/legacy'), { id: 'legacy' });
	assert.deepEqual(await modernTransport.request('/modern'), { id: 'modern' });
});

test('transport gives JSON explicit headers and leaves multipart boundaries native', async () => {
	const fetchLedger = [];
	const yesodFetcher = async (url, options) => {
		fetchLedger.push([url, options]);
		return createResponse({ success: true });
	};
	const yesodTransport = new ApiTransport(yesodFetcher);
	await yesodTransport.request('/json', { method: 'POST', body: { a: 1 } });
	const malchusForm = new FormData();
	malchusForm.append('file', 'light');
	await yesodTransport.request('/form', { method: 'POST', formData: malchusForm });
	assert.equal(fetchLedger[0][1].headers['content-type'], 'application/json');
	assert.equal(fetchLedger[0][1].body, '{"a":1}');
	assert.equal(fetchLedger[1][1].headers, undefined);
	assert.equal(fetchLedger[1][1].body, malchusForm);
});

test('transport turns server and network failures into SocialApiError evidence', async () => {
	const serverTransport = new ApiTransport(async () => createResponse({
		error: { code: 'DENIED', message: 'No.', requestId: 'req-1' }
	}, { status: 403, ok: false }));
	await assert.rejects(serverTransport.request('/denied'), error => {
		assert.ok(error instanceof SocialApiError);
		assert.equal(error.code, 'DENIED');
		assert.equal(error.status, 403);
		assert.equal(error.requestId, 'req-1');
		return true;
	});
	const networkTransport = new ApiTransport(async () => {
		throw new Error('offline');
	});
	await assert.rejects(networkTransport.request('/offline'), error => error instanceof SocialApiError && error.code === 'NETWORK_ERROR');
});
