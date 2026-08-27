//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves custom Host resolution remains dark until every witness agrees. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { putDomainClaim, verifyDomainClaim } = require('../domainClaimService.js');
const { resolveDomainHost } = require('../domainHostResolver.js');
const { mutateDriveState } = require('../stateRepository.js');
const { upsertSiteMapping } = require('../siteMappingService.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

async function claimedDomain($i, options = {}) {
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'home',
		input: { primary: true, enabled: options.enabled !== false },
		$i
	});
	await putDomainClaim({
		aliasId: 'alpha',
		siteId: 'home',
		hostname: 'host.example',
		input: options.input || { mode: 'external-dns' },
		tokenFactory: () => TOKEN,
		now: 100,
		$i
	});
}

async function verifyOwnership($i) {
	return verifyDomainClaim({
		aliasId: 'alpha',
		hostname: 'host.example',
		resolver: { async resolveTxt() { return [[`awtsmoos-verification=${TOKEN}`]]; } },
		now: 200,
		$i
	});
}

async function activateRoute($i) {
	await mutateDriveState('alpha', $i, state => {
		state.domains['host.example'].routeState = 'active';
	});
}

test('unknown, malformed, pending, and merely verified hosts fail closed', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-host-closed-');
	assert.equal(await resolveDomainHost('unknown.example', $i), null);
	assert.equal(await resolveDomainHost('https://bad.example/path', $i), null);
	await claimedDomain($i);
	assert.equal(await resolveDomainHost('HOST.EXAMPLE.:443', $i), null);
	await verifyOwnership($i);
	assert.equal(await resolveDomainHost('host.example', $i), null);
});

test('verified and explicitly activated host resolves to its enabled canonical site', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-host-active-');
	await claimedDomain($i);
	await verifyOwnership($i);
	await activateRoute($i);
	const resolved = await resolveDomainHost('HOST.EXAMPLE.:443', $i);
	assert.equal(resolved.aliasId, 'alpha');
	assert.equal(resolved.siteId, 'home');
	assert.equal(resolved.canonicalSiteUrl, '/sites/alpha/home/');
});

test('disabled site remains unroutable even with verified active claim', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-host-disabled-');
	await claimedDomain($i);
	await verifyOwnership($i);
	await activateRoute($i);
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'home', input: { enabled: false }, $i });
	assert.equal(await resolveDomainHost('host.example', $i), null);
});
