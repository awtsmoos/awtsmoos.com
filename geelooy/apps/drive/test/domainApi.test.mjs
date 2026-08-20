//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves Drive domain intent crosses the browser transport without
 * inventing DNS testimony or verification secrets. Awtsmoos.com keeps routes,
 * form nameservers, and mutation verbs explicit through a mocked same-origin fetch.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { connectState } from '../js/state.js';
import {
	activateDomain,
	claimDomain,
	deactivateDomain,
	deleteDomain,
	getDomainHostingPlan,
	listDomains,
	verifyDomain
} from '../js/domainApi.js';

test('domain client uses alias-scoped routes and preserves form nameserver text', async t => {
	connectState({ aliasId: 'alpha', credential: '', credentialType: 'session' });
	const calls = [];
	const originalFetch = globalThis.fetch;
	globalThis.fetch = async (url, options = {}) => {
		calls.push({ url, options });
		return jsonResponse({ ok: true });
	};
	t.after(() => {
		globalThis.fetch = originalFetch;
	});

	await listDomains();
	await getDomainHostingPlan('Site.Example');
	await claimDomain('home', 'Site.Example', {
		mode: 'custom-nameservers',
		nameservers: 'ns1.provider.example\nns2.provider.example'
	});
	await verifyDomain('Site.Example');
	await activateDomain('Site.Example');
	await deactivateDomain('Site.Example');
	await deleteDomain('Site.Example');

	assert.equal(calls[0].url, '/api/social/drive/alpha/domains');
	assert.equal(calls[1].url, '/api/social/drive/alpha/domains/Site.Example/hosting-plan');
	assert.equal(calls[2].url, '/api/social/drive/alpha/sites/home/domains/Site.Example');
	assert.equal(calls[2].options.method, 'PUT');
	const body = new URLSearchParams(calls[2].options.body);
	assert.equal(body.get('mode'), 'custom-nameservers');
	assert.equal(body.get('nameservers'), 'ns1.provider.example\nns2.provider.example');
	assert.equal(body.has('verificationToken'), false);
	assert.equal(calls[3].url, '/api/social/drive/alpha/domains/Site.Example/verify');
	assert.equal(calls[4].url, '/api/social/drive/alpha/domains/Site.Example/activate');
	assert.equal(calls[5].url, '/api/social/drive/alpha/domains/Site.Example/deactivate');
	assert.equal(calls[6].url, '/api/social/drive/alpha/domains/Site.Example');
	assert.equal(calls[6].options.method, 'DELETE');
});

function jsonResponse(payload) {
	return new Response(JSON.stringify(payload), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}
