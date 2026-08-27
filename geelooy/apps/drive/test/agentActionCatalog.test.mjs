//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { actionMetadata } from '../js/builder/agentActionCatalog.js';
import { createAgentNamespaces } from '../js/builder/agentNamespaces.js';

/**
 * @file Website Maker action-contract witnesses.
 * @description
 * The Awtsmoos lets many verbs flow through one bounded covenant while Awtsmoos.com gives each verb its replay law and nearest reconciliation witness;
 * these tests prove that namespaces preserve input and correlation as parallel vessels instead of mixing project data with transport testimony.
 */

test('publish mutation declares honest replay and reconciliation law', () => {
	const action = actionMetadata('site.publish.apply');
	assert.equal(action.mutates, true);
	assert.equal(action.replay, 'reconcile-before-replay');
	assert.equal(action.reconcileAction, 'site.publish.status');
	assert.equal(action.idempotency, 'not-provided');
	assert.equal(action.evidenceScope, 'canonical-publication');
	assert.equal(action.externalVerification, 'not-implied');
});

test('domain activation reconciles against the full domain plan', () => {
	const action = actionMetadata('site.domain.activate');
	assert.equal(action.reconcileAction, 'site.domain.plan');
	assert.equal(action.evidenceScope, 'domain-hosting');
	assert.equal(action.replay, 'reconcile-before-replay');
});

test('read-only actions are safe reads without fake idempotency', () => {
	const action = actionMetadata('site.publish.status');
	assert.equal(action.mutates, false);
	assert.equal(action.replay, 'safe-read');
	assert.equal(action.idempotency, 'not-applicable');
	assert.equal(action.reconcileAction, null);
});

test('namespace forwards correlation options separately from action input', async () => {
	const calls = [];
	const namespaces = createAgentNamespaces(async (name, input, options) => {
		calls.push({ name, input, options });
		return { ok: true };
	});
	await namespaces.publish.apply(
		{ siteId: 'friend' },
		{ requestId: 'publish:namespace:1' }
	);
	assert.deepEqual(calls, [{
		name: 'site.publish.apply',
		input: { siteId: 'friend' },
		options: { requestId: 'publish:namespace:1' }
	}]);
});

test('unknown action metadata remains absent rather than invented', () => {
	assert.equal(actionMetadata('site.unknown.future'), null);
});
