//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves hosting instructions come from owned Drive state plus server
 * ingress testimony. Awtsmoos.com never lets a client invent routing targets while
 * still revealing provider-ready TXT, A, and CNAME records to the domain owner.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

function moduleStub(modulePath, exports) {
	const previous = require.cache[modulePath];
	require.cache[modulePath] = {
		id: modulePath,
		filename: modulePath,
		loaded: true,
		exports
	};
	return () => {
		if (previous) require.cache[modulePath] = previous;
		else delete require.cache[modulePath];
	};
}

test('hosting plan service reveals server-owned DNS choices for an owned claim', async t => {
	const statePath = require.resolve('../stateRepository.js');
	const servicePath = require.resolve('../domainHostingPlanService.js');
	const claim = domainRecord();
	const restoreState = moduleStub(statePath, {
		readDriveState: async () => ({
			sites: {
				home: { id: 'home', rootPath: '/', enabled: true, primary: true }
			},
			domains: { [claim.hostname]: claim }
		})
	});
	delete require.cache[servicePath];
	t.after(() => {
		delete require.cache[servicePath];
		restoreState();
	});
	const { getDomainHostingPlan } = require(servicePath);
	const plan = await getDomainHostingPlan({
		aliasId: 'alpha',
		hostname: 'Site.Example',
		environment: {
			AWTSMOOS_SITE_INGRESS_IPV4: '203.0.113.20',
			AWTSMOOS_SITE_INGRESS_HOSTNAME: 'edge.example.net'
		}
	});
	assert.equal(plan.hostname, 'site.example');
	assert.equal(plan.ownership.record.type, 'TXT');
	assert.equal(plan.routing.options.direct[0].type, 'A');
	assert.equal(plan.routing.options.cname[0].type, 'CNAME');
	assert.equal(plan.awtsmoosNameservers.available, false);
	assert.equal('verificationToken' in plan, false);
});

test('hosting plan service rejects a hostname without an owned claim', async t => {
	const statePath = require.resolve('../stateRepository.js');
	const servicePath = require.resolve('../domainHostingPlanService.js');
	const restoreState = moduleStub(statePath, {
		readDriveState: async () => ({ sites: {}, domains: {} })
	});
	delete require.cache[servicePath];
	t.after(() => {
		delete require.cache[servicePath];
		restoreState();
	});
	const { getDomainHostingPlan } = require(servicePath);
	await assert.rejects(
		getDomainHostingPlan({ aliasId: 'alpha', hostname: 'missing.example' }),
		error => error.code === 'DOMAIN_NOT_FOUND' && error.statusCode === 404
	);
});

function domainRecord() {
	return {
		hostname: 'site.example',
		siteId: 'home',
		mode: 'external-dns',
		nameservers: [],
		verificationToken: 'abcdefghijklmnopqrstuvwxyz012345',
		ownershipState: 'verified',
		delegationState: 'not-required',
		routeState: 'inactive',
		tlsState: 'inactive'
	};
}
