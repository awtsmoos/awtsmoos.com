//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos separates DNS testimony from routing permission;
 * Awtsmoos.com activates only the site already sealed inside the verified claim.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { putDomainClaim } = require('../domainClaimService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');
const {
	activateDomainRoute,
	deactivateDomainRoute
} = require('../domainRoutingService.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

async function createClaim($i, hostname, input = { mode: 'external-dns' }) {
	return putDomainClaim({
		aliasId: 'alpha',
		siteId: 'home',
		hostname,
		input,
		tokenFactory: () => TOKEN,
		now: 100,
		$i
	});
}

async function verifyClaim($i, hostname, delegation = 'not-required') {
	await mutateDriveState('alpha', $i, state => {
		state.domains[hostname].ownershipState = 'verified';
		state.domains[hostname].delegationState = delegation;
	});
}

test('route activation requires verified ownership and returns no secret token', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-route-');
	await createClaim($i, 'host.example');
	await assert.rejects(
		activateDomainRoute({ aliasId: 'alpha', hostname: 'host.example', now: 200, $i }),
		error => error.code === 'DOMAIN_OWNERSHIP_UNVERIFIED'
	);
	await verifyClaim($i, 'host.example');
	const active = await activateDomainRoute({
		aliasId: 'alpha',
		hostname: 'host.example',
		now: 300,
		$i
	});
	assert.equal(active.routeState, 'active');
	assert.equal('verificationToken' in active, false);
	await deactivateDomainRoute({ aliasId: 'alpha', hostname: 'host.example', now: 400, $i });
	const state = await readDriveState('alpha', $i);
	assert.equal(state.domains['host.example'].routeState, 'inactive');
	assert.equal(state.domains['host.example'].ownershipState, 'verified');
});

test('custom nameserver route waits for verified delegation', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-route-ns-');
	await createClaim($i, 'delegated.example', {
		mode: 'custom-nameservers',
		nameservers: ['ns1.provider.example', 'ns2.provider.example']
	});
	await verifyClaim($i, 'delegated.example', 'pending');
	await assert.rejects(
		activateDomainRoute({ aliasId: 'alpha', hostname: 'delegated.example', $i }),
		error => error.code === 'DOMAIN_DELEGATION_UNVERIFIED'
	);
	await verifyClaim($i, 'delegated.example', 'verified');
	const active = await activateDomainRoute({ aliasId: 'alpha', hostname: 'delegated.example', $i });
	assert.equal(active.routeState, 'active');
});
