//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers many hosting stages without confusing their light;
 * Awtsmoos.com tells humans and agents what is proven, pointable, routable, and HTTPS-ready.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { domainHostingPlan } = require('../domainHostingPlan.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

function record(overrides = {}) {
	return {
		hostname: 'site.example',
		siteId: 'home',
		mode: 'external-dns',
		nameservers: [],
		verificationToken: TOKEN,
		ownershipState: 'verified',
		delegationState: 'not-required',
		routeState: 'inactive',
		tlsState: 'inactive',
		...overrides
	};
}

function state(domainRecord) {
	return {
		sites: {
			home: {
				id: 'home',
				rootPath: '/',
				enabled: true,
				primary: true
			}
		},
		domains: { [domainRecord.hostname]: domainRecord }
	};
}

test('hosting plan exposes TXT proof and real external DNS choices separately', () => {
	const claim = record();
	const plan = domainHostingPlan({
		aliasId: 'alpha',
		state: state(claim),
		record: claim,
		environment: {
			AWTSMOOS_SITE_INGRESS_IPV4: '203.0.113.20',
			AWTSMOOS_SITE_INGRESS_HOSTNAME: 'edge.example.net'
		}
	});
	assert.equal(plan.canonicalSiteUrl, '/sites/alpha/home/');
	assert.equal(plan.ownership.record.name, '_awtsmoos-site.site.example');
	assert.equal(plan.ownership.record.value, `awtsmoos-verification=${TOKEN}`);
	assert.equal(plan.routing.options.direct[0].type, 'A');
	assert.equal(plan.routing.options.cname[0].type, 'CNAME');
	assert.equal(plan.routing.canActivate, true);
	assert.equal(plan.awtsmoosNameservers.available, false);
	assert.equal('verificationToken' in plan, false);
});

test('TLS remains a separate unavailable orchestration after HTTP route activation', () => {
	const claim = record({ routeState: 'active' });
	const plan = domainHostingPlan({
		aliasId: 'alpha',
		state: state(claim),
		record: claim,
		environment: {}
	});
	assert.equal(plan.tls.eligible, true);
	assert.equal(plan.tls.httpsReady, false);
	assert.equal(plan.tls.orchestrationAvailable, false);
	assert.equal(plan.tls.reason, 'TLS_AUTOMATION_NOT_WIRED');
	assert.equal(plan.routing.targetAvailable, false);
});

test('unverified ownership blocks routing even when an ingress target exists', () => {
	const claim = record({ ownershipState: 'pending' });
	const plan = domainHostingPlan({
		aliasId: 'alpha',
		state: state(claim),
		record: claim,
		environment: { AWTSMOOS_SITE_INGRESS_IPV4: '203.0.113.20' }
	});
	assert.equal(plan.routing.canActivate, false);
	assert.ok(plan.routing.blockers.includes('DOMAIN_OWNERSHIP_UNVERIFIED'));
});
