//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves DNS witnesses update only their own claim state and never awaken routing or TLS;
 * Awtsmoos.com also proves verification leaves the global registry sealed to one-way challenge proof.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDomainChallenge } = require('../domainChallenge.js');
const {
	verifyDomainDelegation,
	verifyDomainOwnership
} = require('../domainVerificationService.js');
const {
	createClaim,
	createDomainHarness,
	readRegistry
} = require('./domainTestHarness.js');

test('TXT ownership verifies from one-time secret while durable registry stays hash-only', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-verify-');
	const created = await createClaim($i);
	const value = created.ownershipInstruction.value;
	const verified = await verifyDomainOwnership({
		aliasId: 'alpha', siteId: 'main', hostname: 'example.org', $i,
		resolveTxt: async () => [[value]]
	});
	const stored = readRegistry($i).claims['example.org'];
	assert.equal(verified.ownershipStatus, 'ownership-verified');
	assert.equal(verified.routingStatus, 'route-inactive');
	assert.equal(verified.tlsStatus, 'not-started');
	assert.match(stored.challengeHash, /^[a-f0-9]{64}$/);
	assert.equal(stored.challengeToken, undefined);
	assert.equal(JSON.stringify(stored).includes(value.split('=')[1]), false);
});

test('wrong TXT keeps ownership pending and never activates later stages', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-wrong-');
	await createClaim($i);
	const result = await verifyDomainOwnership({
		aliasId: 'alpha', siteId: 'main', hostname: 'example.org', $i,
		resolveTxt: async () => [[`awtsmoos-verification=${createDomainChallenge()}`]]
	});
	assert.equal(result.ownershipStatus, 'ownership-pending');
	assert.equal(result.routingStatus, 'route-inactive');
	assert.equal(result.tlsStatus, 'not-started');
});

test('custom nameserver delegation is independent from ownership and routing', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-ns-');
	await createClaim($i, {
		hostname: 'delegated.org',
		dnsMode: 'custom-nameservers',
		nameservers: ['ns1.example.net', 'ns2.example.net']
	});
	const result = await verifyDomainDelegation({
		aliasId: 'alpha', siteId: 'main', hostname: 'delegated.org', $i,
		resolveNs: async () => ['ns2.example.net', 'ns1.example.net']
	});
	assert.equal(result.delegationStatus, 'delegation-valid');
	assert.equal(result.ownershipStatus, 'ownership-pending');
	assert.equal(result.routingStatus, 'route-inactive');
});

test('external DNS claims reject delegation verification', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-no-ns-');
	await createClaim($i);
	await assert.rejects(
		() => verifyDomainDelegation({
			aliasId: 'alpha', siteId: 'main', hostname: 'example.org', $i
		}),
		error => error.code === 'DOMAIN_DELEGATION_NOT_REQUIRED'
	);
});
