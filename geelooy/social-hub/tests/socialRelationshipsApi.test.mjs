// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file socialRelationshipsApi.test.mjs
 * @description The Awtsmoos proves public relationship reads and ownership-guarded mutations use the current route family.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { SocialHubApi } from '../js/api/SocialHubApi.js';

function response(success = []) {
	return new Response(JSON.stringify({ BH: 'B"H', ok: true, success }), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('relationship readers use current routes', async () => {
	const requests = [];
	const api = new SocialHubApi(async (url, options = {}) => {
		requests.push([String(url), options.method || 'GET']);
		return response([]);
	});
	await api.livingProfile('alice');
	await api.following('alice', { limit: 12 });
	await api.followers('alice', { limit: 12 });
	assert.deepEqual(requests, [
		['/api/social/profiles/alice/living-card', 'GET'],
		['/api/social/follows/alice?limit=12', 'GET'],
		['/api/social/followers/alias/alice?limit=12', 'GET']
	]);
});

test('follow and unfollow use guarded mutation verbs on the acting alias route', async () => {
	const requests = [];
	const api = new SocialHubApi(async (url, options = {}) => {
		requests.push([String(url), options.method, JSON.parse(options.body)]);
		return response({ ok: true });
	});
	await api.follow('viewer', { type: 'alias', id: 'friend' });
	await api.unfollow('viewer', { type: 'alias', id: 'friend' });
	assert.deepEqual(requests, [
		['/api/social/follows/viewer', 'POST', { type: 'alias', id: 'friend' }],
		['/api/social/follows/viewer', 'DELETE', { type: 'alias', id: 'friend' }]
	]);
});
