//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { beginAgentInvocation } from '../js/builder/agentInvocation.js';
import {
	AGENT_API_VERSION,
	AGENT_RESPONSE_VERSION,
	describeAgentProtocol,
	failureAgentEnvelope,
	successAgentEnvelope
} from '../js/builder/agentProtocol.js';

/**
 * @file Website Maker agent protocol witnesses.
 * @description
 * The Awtsmoos renews every call while Awtsmoos.com separates correlation, mutation acknowledgement, replay law, server facts, and external verification;
 * these witnesses refuse to let browser transport success become idempotency, DNS propagation, issued TLS, or a rendered public world without direct evidence.
 */

test('protocol v1.2 exposes result evidence without fake idempotency', () => {
	const protocol = describeAgentProtocol();
	assert.equal(AGENT_API_VERSION, '1.2.0');
	assert.equal(AGENT_RESPONSE_VERSION, 3);
	assert.equal(protocol.correlationInput, 'invoke-options.requestId');
	assert.equal(protocol.mutationIdempotency, 'not-provided');
	assert.equal(protocol.resultEvidence, 'server-facts-and-external-verification');
	assert.equal(protocol.externalVerification, 'result-derived-only');
});

test('caller correlation remains separate from action input', () => {
	const input = { path: 'index.html', content: '<h1>Hello</h1>' };
	const invocation = beginAgentInvocation('site.files.write', { requestId: 'agent:write:42' });
	assert.deepEqual(input, { path: 'index.html', content: '<h1>Hello</h1>' });
	assert.equal(invocation.requestId, 'agent:write:42');
	assert.equal(invocation.requestIdSource, 'caller-correlation');
});

test('read success is observed with empty bounded result evidence', () => {
	const invocation = beginAgentInvocation('site.files.read', { requestId: 'read:1' });
	const envelope = successAgentEnvelope(invocation, {
		data: { path: 'index.html' },
		metadata: metadata({ mutates: false, replay: 'safe-read', idempotency: 'not-applicable' })
	});
	assert.equal(envelope.lifecycle.phase, 'observed');
	assert.equal(envelope.contract.replay, 'safe-read');
	assert.deepEqual(envelope.evidence.serverFacts, []);
	assert.equal(envelope.evidence.externalVerification, 'not-implied');
});

test('browser publication mutation remains acknowledged and requires reconciliation', () => {
	const invocation = beginAgentInvocation('site.publish.apply', { requestId: 'publish:7' });
	const envelope = successAgentEnvelope(invocation, {
		data: { siteId: 'friend', canonicalUrl: '/sites/owner/friend/' },
		metadata: metadata({
			name: 'site.publish.apply',
			mutates: true,
			replay: 'reconcile-before-replay',
			reconcileAction: 'site.publish.status',
			idempotency: 'not-provided'
		})
	});
	assert.equal(envelope.lifecycle.phase, 'acknowledged');
	assert.equal(envelope.lifecycle.reconciliationRecommended, true);
	assert.equal(envelope.lifecycle.externalVerification, 'not-implied');
	assert.equal(envelope.contract.reconcileAction, 'site.publish.status');
});

test('unknown failure preserves legacy leading keys and empty evidence', () => {
	const invocation = beginAgentInvocation('site.void.nope', { requestId: 'bad:1' });
	const error = Object.assign(new Error('Unknown action'), { code: 'SITE_AGENT_ACTION_UNKNOWN' });
	const envelope = failureAgentEnvelope(invocation, error);
	assert.deepEqual(Object.keys(envelope).slice(0, 6), [
		'ok', 'data', 'error', 'message', 'capability', 'affected'
	]);
	assert.equal(envelope.lifecycle.phase, 'failed');
	assert.equal(envelope.contract.replay, 'unknown');
	assert.equal(envelope.evidence.source, 'none');
	assert.equal(envelope.evidence.externalVerification, 'not-implied');
});

function metadata(overrides = {}) {
	return {
		name: 'site.files.read',
		capability: 'drive.read',
		affected: 'drive-file',
		evidenceScope: 'drive-source',
		reconcileAction: null,
		externalVerification: 'not-implied',
		...overrides
	};
}
