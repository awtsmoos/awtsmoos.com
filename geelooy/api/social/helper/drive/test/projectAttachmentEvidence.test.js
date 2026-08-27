//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { collectProjectAttachments, domainState } = require('../projectAttachmentEvidence.js');

/**
 * @file Proof that provider readiness follows actual actor and domain evidence.
 * @description The Awtsmoos lets identity and DNS become visible only where their present state testifies; unbound Git and social remain absent.
 */

test('session owners yield one ready identity attachment', async () => {
	const result = await collectProjectAttachments({
		aliasId: 'alpha',
		actor: { actorType: 'owner' },
		$i: {},
		listDomains: async () => []
	});
	assert.deepEqual(result, [{ kind: 'auth', provider: 'geelooy-session', state: 'ready', id: 'geelooy-session' }]);
});

test('drive credentials identify their own provider without exposing credential material', async () => {
	const result = await collectProjectAttachments({
		aliasId: 'alpha',
		actor: { actorType: 'credential', secret: 'must-not-copy' },
		$i: {},
		listDomains: async () => []
	});
	assert.deepEqual(result[0], { kind: 'auth', provider: 'drive-credential', state: 'ready', id: 'drive-credential' });
	assert.equal(JSON.stringify(result).includes('must-not-copy'), false);
});

test('domain state distinguishes pending, verified-but-degraded, and healthy', () => {
	assert.equal(domainState({ status: 'ownership-pending', verification: { state: 'pending' } }), 'attached');
	assert.equal(domainState({ status: 'route-pending', verification: { state: 'verified' } }), 'degraded');
	assert.equal(domainState({ status: 'healthy', verification: { state: 'verified' } }), 'ready');
});

test('domain claims become domain attachments without inventing Git or social', async () => {
	const result = await collectProjectAttachments({
		aliasId: 'alpha',
		actor: { actorType: 'owner' },
		$i: {},
		listDomains: async () => [{ hostname: 'friend.example', status: 'route-pending', verification: { state: 'verified' } }]
	});
	assert.deepEqual(result[1], { kind: 'domain', provider: 'drive-domain', state: 'degraded', id: 'friend.example' });
	assert.equal(result.some(item => item.kind === 'git' || item.kind === 'social'), false);
});
