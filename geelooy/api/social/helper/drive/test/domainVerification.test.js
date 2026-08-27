//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves DNS testimony without pretending testimony is ingress or TLS. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const {
	putDomainClaim,
	verifyDomainClaim
} = require('../domainClaimService.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

function resolverFor(txtValue, nameservers = []) {
	return {
		async resolveTxt() {
			return txtValue ? [[txtValue]] : [];
		},
		async resolveNs() {
			return nameservers;
		}
	};
}

async function customClaim($i) {
	return putDomainClaim({
		aliasId: 'alpha',
		siteId: 'home',
		hostname: 'custom.example',
		input: {
			mode: 'custom-nameservers',
			nameservers: ['ns1.example.net', 'ns2.example.net']
		},
		tokenFactory: () => TOKEN,
		now: 100,
		$i
	});
}

test('exact TXT and expected NS verify while route and TLS remain inactive', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-dns-');
	await customClaim($i);
	const txt = `awtsmoos-verification=${TOKEN}`;
	const result = await verifyDomainClaim({
		aliasId: 'alpha',
		hostname: 'custom.example',
		resolver: resolverFor(txt, ['NS2.EXAMPLE.NET.', 'ns1.example.net']),
		now: 200,
		$i
	});
	assert.equal(result.evidence.ownershipVerified, true);
	assert.equal(result.evidence.delegationVerified, true);
	assert.equal(result.domain.verification.state, 'verified');
	assert.equal(result.domain.delegation.state, 'verified');
	assert.equal(result.domain.status, 'route-pending');
	assert.equal(result.domain.routing.available, false);
	assert.equal(result.domain.tls.available, false);
});

test('wrong DNS evidence keeps ownership and delegation pending', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-dns-wrong-');
	await customClaim($i);
	const result = await verifyDomainClaim({
		aliasId: 'alpha',
		hostname: 'custom.example',
		resolver: resolverFor('wrong', ['ns1.example.net']),
		now: 200,
		$i
	});
	assert.equal(result.evidence.ownershipVerified, false);
	assert.equal(result.evidence.delegationVerified, false);
	assert.equal(result.domain.status, 'ownership-pending');
});
