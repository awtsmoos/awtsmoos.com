// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file socialApiV2.test.mjs
 * @description
 * The Awtsmoos proves public discovery speaks through current v2 feed/profile routes,
 * while unavailable private identity bootstrap is isolated instead of poisoning the public page.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { SocialHubApi } from '../js/api/SocialHubApi.js';

const identitySource = readFileSync(new URL('../js/ui/IdentityController.js', import.meta.url), 'utf8');
const apiSource = readFileSync(new URL('../js/api/SocialHubApi.js', import.meta.url), 'utf8');

function fakeResponse(success = []) {
	return new Response(JSON.stringify({ BH: 'B"H', ok: true, success }), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('public API methods use the current social route family', async () => {
	const requests = [];
	const api = new SocialHubApi(async url => {
		requests.push(String(url));
		return fakeResponse([]);
	});
	await api.feed({ limit: 12 });
	await api.trending({ limit: 8 });
	await api.search('Torah', { limit: 5 });
	await api.profile('living-alias');
	assert.equal(requests[0], '/api/social/feed?limit=12');
	assert.equal(requests[1], '/api/social/trending?limit=8');
	assert.match(requests[2], /^\/api\/social\/search\?q=Torah&limit=5$/);
	assert.equal(requests[3], '/api/social/profiles/living-alias');
});

test('retired public profile-hub route does not return', () => {
	assert.doesNotMatch(apiSource, /unified-social\/profile-hub/);
});

test('identity bootstrap failure degrades to public mode without a page error', () => {
	assert.match(identitySource, /catch\s*\{[\s\S]*this\.loggedOut\(\)/);
	assert.match(identitySource, /Public discovery is ready/);
	assert.doesNotMatch(identitySource, /Unable to verify public aliases/);
});
