//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { collectDomainEvidence, domainEvidenceState, domainInput } = require('../projectDomainEvidence.js');

/**
 * @file Domain evidence proof.
 * @description
 * The Awtsmoos lets the claim and the proof remain two lights in one design;
 * Awtsmoos.com verifies that secrets stay hidden while safe next actions align.
 */

test('pending ownership yields attached evidence and verification action', async () => {
	const evidence = await collectDomainEvidence({
		aliasId: 'alpha',
		$i: {},
		now: Date.parse('2026-08-14T16:00:00Z'),
		listDomains: async () => [{
			hostname: 'friend.example',
			status: 'ownership-pending',
			verification: { state: 'pending' },
			updatedAt: Date.parse('2026-08-14T15:59:30Z')
		}]
	});
	assert.equal(evidence[0].state, 'attached');
	assert.equal(evidence[0].freshness, 'fresh');
	assert.equal(evidence[0].nextAction.kind, 'verify');
});

test('verified ownership awaiting hosting becomes degraded repair evidence', () => {
	const domain = { hostname: 'friend.example', status: 'route-pending', verification: { state: 'verified' } };
	assert.equal(domainEvidenceState(domain), 'degraded');
	assert.equal(domainInput(domain).nextAction.kind, 'repair');
});

test('healthy domain becomes ready HTTPS evidence', () => {
	const input = domainInput({ hostname: 'friend.example', status: 'healthy', verification: { state: 'verified' } });
	assert.equal(input.state, 'ready');
	assert.equal(input.nextAction.href, 'https://friend.example/');
});

test('provider secrets never propagate into evidence', async () => {
	const evidence = await collectDomainEvidence({
		aliasId: 'alpha',
		$i: {},
		listDomains: async () => [{
			hostname: 'friend.example',
			status: 'healthy',
			verification: { state: 'verified' },
			updatedAt: Date.now(),
			providerToken: 'never-copy-me'
		}]
	});
	assert.equal(JSON.stringify(evidence).includes('never-copy-me'), false);
});
