//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves one canonical site may claim a global hostname without turning the registry into a secret vault;
 * Awtsmoos.com tests the raw JSON so redaction is durable truth rather than an API illusion.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	createDomainClaim,
	deleteDomainClaim,
	getDomainClaim,
	listDomainClaims
} = require('../domainClaimService.js');
const {
	createClaim,
	createDomainHarness,
	mapSite,
	readRegistry
} = require('./domainTestHarness.js');

test('new claim returns one-time TXT secret but persists only its hash', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-secret-');
	const created = await createClaim($i);
	const token = created.ownershipInstruction.value.split('=')[1];
	const registry = readRegistry($i);
	const stored = registry.claims['example.org'];
	assert.match(stored.challengeHash, /^[a-f0-9]{64}$/);
	assert.equal(stored.challengeToken, undefined);
	assert.equal(JSON.stringify(registry).includes(token), false);
	assert.equal(created.challengeHash, undefined);
	assert.equal(created.challengeToken, undefined);
});

test('list, get, and same-site replay never reveal the old TXT secret', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-replay-');
	await createClaim($i);
	const replay = await createClaim($i);
	const listed = await listDomainClaims({ aliasId: 'alpha', siteId: 'main', $i });
	const fetched = await getDomainClaim({
		aliasId: 'alpha', siteId: 'main', hostname: 'example.org', $i
	});
	assert.equal(replay.ownershipInstruction, undefined);
	assert.equal(listed[0].ownershipInstruction, undefined);
	assert.equal(fetched.ownershipInstruction, undefined);
	assert.equal(fetched.ownershipRecord.value, undefined);
});

test('global hostname conflict cannot be taken by another canonical site', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-conflict-');
	await mapSite($i, 'beta', 'main', 'public');
	await createClaim($i);
	await assert.rejects(
		() => createClaim($i, {}, 'beta', 'main'),
		error => error.code === 'DOMAIN_ALREADY_CLAIMED' && error.statusCode === 409
	);
});

test('claim requires a durable explicit canonical site and delete preserves it', async t => {
	const { $i } = await createDomainHarness(t, 'awtsmoos-domain-site-');
	await assert.rejects(
		() => createDomainClaim({
			aliasId: 'alpha', siteId: 'missing', input: { hostname: 'missing.org' }, $i
		}),
		error => error.code === 'DOMAIN_SITE_NOT_PUBLISHED'
	);
	await createClaim($i);
	const result = await deleteDomainClaim({
		aliasId: 'alpha', siteId: 'main', hostname: 'example.org', $i
	});
	assert.deepEqual(result, { deleted: true, hostname: 'example.org' });
});
