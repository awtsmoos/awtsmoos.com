//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves DNS names become normalized hosting vessels, never shortcuts. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeDriveState } = require('../stateShape.js');
const { normalizeHostname } = require('../domainHostnamePolicy.js');
const { normalizeDomainRecord } = require('../domainPolicy.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

test('hostnames normalize case, trailing dot, port, and reject unsafe identities', () => {
	assert.equal(normalizeHostname('Example.COM.:443'), 'example.com');
	for (const value of ['https://example.com', '127.0.0.1', 'awtsmoos.com', 'x.awtsmoos.com']) {
		assert.throws(() => normalizeHostname(value));
	}
});

test('custom nameservers normalize and unavailable Awtsmoos DNS fails truthfully', () => {
	const record = normalizeDomainRecord('Example.com', {
		siteId: 'HOME',
		mode: 'custom-nameservers',
		nameservers: ['NS1.Example.net.', 'ns2.example.net'],
		verificationToken: TOKEN
	}, {}, 100);
	assert.equal(record.siteId, 'home');
	assert.deepEqual(record.nameservers, ['ns1.example.net', 'ns2.example.net']);
	assert.equal(record.delegationState, 'pending');
	assert.throws(() => normalizeDomainRecord('example.com', {
		mode: 'awtsmoos-nameservers',
		verificationToken: TOKEN
	}), error => error.code === 'AWTSMOOS_NAMESERVERS_UNAVAILABLE');
});

test('changing DNS mode resets delegation evidence without resetting ownership', () => {
	const external = normalizeDomainRecord('example.com', { mode: 'external-dns', verificationToken: TOKEN }, {}, 100);
	external.ownershipState = 'verified';
	external.verifiedAt = 101;
	const custom = normalizeDomainRecord('example.com', {
		mode: 'custom-nameservers',
		nameservers: ['ns1.example.net', 'ns2.example.net']
	}, external, 200);
	assert.equal(custom.ownershipState, 'verified');
	assert.equal(custom.delegationState, 'pending');
	assert.equal(custom.delegationVerifiedAt, null);
});

test('legacy Drive state upgrades to version 6 with domain and project registries', () => {
	const state = normalizeDriveState({
		version: 4,
		entries: { 'index.html': { visibility: 'public' } },
		sites: { home: { id: 'home', rootPath: '' } }
	});
	assert.equal(state.version, 6);
	assert.deepEqual(state.domains, {});
	assert.deepEqual(state.projects, {});
	assert.ok(state.entries['index.html']);
	assert.ok(state.sites.home);
});
