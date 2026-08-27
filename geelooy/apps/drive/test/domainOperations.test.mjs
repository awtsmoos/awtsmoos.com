//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves domain operations independently from browser DOM and network.
 * Awtsmoos.com rereads fresh plan testimony, preserves custom nameserver form text,
 * dispatches bounded verbs, and accepts the server's real bare claim-array response.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	claimDomainFromForm,
	loadDomainEntries,
	runDomainAction
} from '../js/domainOperations.js';

test('domain entries pair the server bare claim array with fresh hosting plans', async () => {
	const claims = [
		{ hostname: 'one.example', siteId: 'home' },
		{ hostname: 'two.example', siteId: 'docs' }
	];
	const api = {
		listDomains: async () => claims,
		getDomainHostingPlan: async hostname => ({ hostname, routing: { canActivate: true } })
	};
	const entries = await loadDomainEntries(api);
	assert.equal(entries.length, 2);
	assert.equal(entries[0].claim.hostname, 'one.example');
	assert.equal(entries[0].plan.hostname, 'one.example');
	assert.equal(entries[1].plan.routing.canActivate, true);
});

test('domain entries keep compatibility with a wrapped claim response', async () => {
	const api = {
		listDomains: async () => ({ domains: [{ hostname: 'wrapped.example' }] }),
		getDomainHostingPlan: async hostname => ({ hostname })
	};
	const entries = await loadDomainEntries(api);
	assert.equal(entries.length, 1);
	assert.equal(entries[0].claim.hostname, 'wrapped.example');
});

test('claim form preserves custom nameserver text and clears only hostname after save', async t => {
	const originalFormData = globalThis.FormData;
	globalThis.FormData = FakeFormData;
	t.after(() => {
		globalThis.FormData = originalFormData;
	});
	let received = null;
	const api = {
		claimDomain: async (...args) => {
			received = args;
		}
	};
	const form = {
		values: new Map([
			['siteId', 'docs'],
			['hostname', ' Site.Example '],
			['mode', 'custom-nameservers'],
			['nameservers', 'ns1.provider.example\nns2.provider.example']
		]),
		elements: { hostname: { value: ' Site.Example ' } }
	};
	const hostname = await claimDomainFromForm(api, form);
	assert.equal(hostname, 'Site.Example');
	assert.deepEqual(received, [
		'docs',
		'Site.Example',
		{
			mode: 'custom-nameservers',
			nameservers: 'ns1.provider.example\nns2.provider.example'
		}
	]);
	assert.equal(form.elements.hostname.value, '');
});

test('domain actions dispatch only supported server verbs', async () => {
	const calls = [];
	const api = {
		verifyDomain: async hostname => calls.push(['verify', hostname]),
		activateDomain: async hostname => calls.push(['activate', hostname]),
		deactivateDomain: async hostname => calls.push(['deactivate', hostname]),
		deleteDomain: async hostname => calls.push(['delete', hostname])
	};
	for (const action of ['verify', 'activate', 'deactivate', 'delete']) {
		await runDomainAction(api, action, 'site.example');
	}
	assert.deepEqual(calls.map(call => call[0]), ['verify', 'activate', 'deactivate', 'delete']);
	await assert.rejects(
		runDomainAction(api, 'invented', 'site.example'),
		error => error.code === 'DOMAIN_UI_INVALID'
	);
});

class FakeFormData {
	constructor(form) {
		this.values = form.values;
	}

	get(name) {
		return this.values.get(name) ?? null;
	}
}
