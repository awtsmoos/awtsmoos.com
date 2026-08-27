//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves one hostname can belong to one alias/site covenant at a time. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const {
	deleteDomainClaim,
	getDomainClaim,
	putDomainClaim
} = require('../domainClaimService.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

function claim(aliasId, hostname, $i, extra = {}) {
	return putDomainClaim({
		aliasId,
		siteId: extra.siteId || 'home',
		hostname,
		input: extra.input || { mode: 'external-dns' },
		tokenFactory: () => TOKEN,
		now: extra.now || 100,
		$i
	});
}

test('claim is normalized, canonical, idempotent, and secret-safe', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-claim-');
	const first = await claim('alpha', 'Example.COM.', $i);
	const second = await claim('alpha', 'example.com', $i, { now: 200 });
	assert.equal(first.hostname, 'example.com');
	assert.equal(first.canonicalSiteUrl, '/sites/alpha/home/');
	assert.equal(first.verification.value, `awtsmoos-verification=${TOKEN}`);
	assert.equal(second.verification.value, first.verification.value);
	assert.equal('verificationToken' in first, false);
});

test('global reservation prevents cross-alias takeover and releases on delete', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-global-');
	await claim('alpha', 'shared.example', $i);
	await assert.rejects(
		claim('beta', 'shared.example', $i),
		error => error.code === 'DOMAIN_ALREADY_CLAIMED' && error.statusCode === 409
	);
	await deleteDomainClaim('alpha', 'shared.example', $i);
	const beta = await claim('beta', 'shared.example', $i);
	assert.equal(beta.canonicalSiteUrl, '/sites/beta/home/');
});

test('missing site fails and rolls back the global hostname reservation', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-rollback-');
	await assert.rejects(
		claim('alpha', 'rollback.example', $i, { siteId: 'missing' }),
		error => error.code === 'SITE_NOT_FOUND'
	);
	const beta = await claim('beta', 'rollback.example', $i);
	assert.equal(beta.hostname, 'rollback.example');
	assert.deepEqual(await getDomainClaim('beta', 'rollback.example', $i), beta);
});
