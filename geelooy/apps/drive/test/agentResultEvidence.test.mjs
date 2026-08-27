//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { agentResultEvidence } from '../js/builder/agentResultEvidence.js';

/**
 * @file Website Maker result-evidence witnesses.
 * @description
 * The Awtsmoos gives DNS observation, persisted route state, TLS state, and nameserver plans different finite vessels;
 * Awtsmoos.com proves these witnesses never collapse into one false green light, and only a real resolver verification may cross into external evidence.
 */

test('domain verification may prove DNS ownership from resolver evidence', () => {
	const evidence = agentResultEvidence('site.domain.verify', {
		domain: {
			verification: { state: 'verified' },
			delegation: { state: 'not-required' }
		},
		evidence: {
			ownershipVerified: true,
			delegationVerified: false
		}
	});
	assert.equal(evidence.source, 'dns-resolver-and-server-state');
	assert.deepEqual(evidence.serverFacts, [
		'ownership:verified',
		'delegation:not-required'
	]);
	assert.equal(evidence.externalVerification, 'dns-ownership-verified');
});

test('failed DNS ownership observation does not imply external verification', () => {
	const evidence = agentResultEvidence('site.domain.verify', {
		domain: {
			verification: { state: 'pending' },
			delegation: { state: 'pending' }
		},
		evidence: {
			ownershipVerified: false,
			delegationVerified: false
		}
	});
	assert.equal(evidence.externalVerification, 'not-implied');
	assert.equal(evidence.serverFacts.includes('ownership:pending'), true);
});

test('route activation reports server facts without claiming propagation or TLS', () => {
	const evidence = agentResultEvidence('site.domain.activate', {
		ownershipState: 'verified',
		delegationState: 'not-required',
		routeState: 'active',
		tlsState: 'pending'
	});
	assert.deepEqual(evidence.serverFacts, [
		'ownership:verified',
		'delegation:not-required',
		'route:active',
		'tls:pending'
	]);
	assert.equal(evidence.source, 'server-state');
	assert.equal(evidence.externalVerification, 'not-implied');
});

test('domain hosting plan preserves independent readiness facts', () => {
	const evidence = agentResultEvidence('site.domain.plan', {
		plan: {
			ownership: { state: 'verified' },
			delegation: { state: 'not-required' },
			routing: { state: 'active' },
			tls: { state: 'waiting' },
			awtsmoosNameservers: { available: false }
		}
	});
	assert.equal(evidence.serverFacts.includes('ownership:verified'), true);
	assert.equal(evidence.serverFacts.includes('route:active'), true);
	assert.equal(evidence.serverFacts.includes('tls:waiting'), true);
	assert.equal(evidence.serverFacts.includes('awtsmoos-nameservers:unavailable'), true);
	assert.equal(evidence.externalVerification, 'not-implied');
});

test('nameserver plan truthfully reports unavailable Awtsmoos authority', () => {
	const evidence = agentResultEvidence('site.nameservers.plan', {
		available: false,
		mode: 'awtsmoos-nameservers'
	});
	assert.deepEqual(evidence.serverFacts, ['awtsmoos-nameservers:unavailable']);
	assert.equal(evidence.source, 'server-plan');
	assert.equal(evidence.externalVerification, 'not-implied');
});

test('ordinary publication result carries no invented external proof in browser path', () => {
	const evidence = agentResultEvidence('site.publish.apply', {
		canonicalUrl: '/sites/owner/friend/'
	});
	assert.deepEqual(evidence.serverFacts, []);
	assert.equal(evidence.externalVerification, 'not-implied');
});
