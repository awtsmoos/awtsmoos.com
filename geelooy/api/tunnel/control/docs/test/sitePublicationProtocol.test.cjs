//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	interpretSitePublicationResult,
	publicationProtocol
} = require('../sitePublicationProtocol.js');

/**
 * @file Tunnel publication evidence protocol witnesses.
 * @description
 * The Awtsmoos renews mapping and public testimony while Awtsmoos.com reads only the light actually present in each returned vessel;
 * these witnesses forbid a mutation receipt from becoming live evidence unless canonical verification is explicitly carried by the real result.
 */

test('protocol preserves historical result compatibility and denies fake idempotency', () => {
	const protocol = publicationProtocol();
	assert.equal(protocol.version, 1);
	assert.equal(protocol.resultCompatibility, 'unchanged');
	assert.equal(protocol.mutationIdempotency, 'not-provided');
	assert.equal(protocol.externalVerification, 'result-derived-only');
});

test('folder publication is acknowledged but can carry verified-live evidence', () => {
	const result = {
		publication: {
			canonicalUrl: '/sites/alice/friend/',
			canonicalVerifiedLive: true
		}
	};
	const evidence = interpretSitePublicationResult('sitePublishFolder', result);
	assert.equal(evidence.phase, 'acknowledged');
	assert.equal(evidence.replay, 'reconcile-before-replay');
	assert.equal(evidence.reconcileAction, 'sitePublicationStatus');
	assert.equal(evidence.idempotency, 'not-provided');
	assert.equal(evidence.externalVerification, 'verified-live');
	assert.equal(evidence.canonicalUrl, '/sites/alice/friend/');
});

test('ordinary mutation success does not imply a live public page', () => {
	const evidence = interpretSitePublicationResult('sitePublishFolder', {
		publication: { canonicalUrl: '/sites/alice/friend/' }
	});
	assert.equal(evidence.phase, 'acknowledged');
	assert.equal(evidence.externalVerification, 'not-implied');
});

test('status read is observed and safe to replay', () => {
	const evidence = interpretSitePublicationResult('sitePublicationStatus', {
		publication: { canonicalVerifiedLive: false }
	});
	assert.equal(evidence.phase, 'observed');
	assert.equal(evidence.replay, 'safe-read');
	assert.equal(evidence.reconcileAction, null);
	assert.equal(evidence.idempotency, 'not-applicable');
});

test('unpublish proves server mapping removal without claiming broader propagation', () => {
	const evidence = interpretSitePublicationResult('siteUnpublish', {
		publication: { mapped: false, previousCanonicalUrl: '/sites/alice/friend/' }
	});
	assert.equal(evidence.phase, 'acknowledged');
	assert.equal(evidence.externalVerification, 'verified-unmapped');
	assert.equal(evidence.evidenceScope, 'canonical-unpublication');
	assert.equal(evidence.canonicalUrl, null);
});
