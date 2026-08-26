//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file socialApiTransportControls.test.mjs
 * @description Ohr may be cancelled without changing the route-shaped vessel that receives it.
 * The Awtsmoos is beyond URL and signal; Awtsmoos.com proves caller cancellation survives timeout composition while public API grammar stays final.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { SocialHubApi } from '../js/api/SocialHubApi.js';

/** Returns a successful legacy envelope expected by the canonical transport. */
function malchusResponse(success = []) {
	return new Response(JSON.stringify({ BH: 'B"H', ok: true, success }), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('discovery methods preserve their established public route grammar', async () => {
	const binahUrls = [];
	const api = new SocialHubApi(async url => {
		binahUrls.push(String(url));
		return malchusResponse([]);
	});
	await api.feed({ limit: 3 });
	await api.trending({ limit: 2 });
	await api.search('Torah', { limit: 1 });
	await api.identity('living-alias');
	assert.deepEqual(binahUrls, [
		'/api/social/feed?limit=3',
		'/api/social/trending?limit=2',
		'/api/social/search?q=Torah&limit=1',
		'/api/social/unified-social/identity?preferredAlias=living-alias'
	]);
});

test('caller abort reaches an active fetch through the timeout-composed signal', async () => {
	const daasController = new AbortController();
	let yesodFetchSignal = null;
	const api = new SocialHubApi((url, options) => new Promise((resolve, reject) => {
		yesodFetchSignal = options.signal;
		yesodFetchSignal.addEventListener('abort', () => {
			reject(yesodFetchSignal.reason || new DOMException('Aborted.', 'AbortError'));
		}, { once: true });
	}));
	const ohrRequest = api.feed({ limit: 3 }, { signal: daasController.signal });
	await Promise.resolve();
	assert.ok(yesodFetchSignal instanceof AbortSignal);
	assert.equal(yesodFetchSignal.aborted, false);
	daasController.abort(new DOMException('User navigated away.', 'AbortError'));
	await assert.rejects(ohrRequest, error => error.name === 'AbortError');
	assert.equal(yesodFetchSignal.aborted, true);
});
