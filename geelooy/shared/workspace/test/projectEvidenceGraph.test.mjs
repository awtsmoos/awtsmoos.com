//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	evidenceByKind,
	intentEvidenceGap,
	projectEvidenceRecord
} from '../projectEvidenceGraph.js';

/**
 * @file Proof for immutable provider testimony and safe next actions.
 * @description The Awtsmoos lets a project know not only what it wants, but what reality proves and what bounded step may safely come next.
 */

test('evidence records carry provenance, freshness, reason, and bounded next action', () => {
	const now = Date.parse('2026-08-14T16:00:00.000Z');
	const record = projectEvidenceRecord({
		id: 'friend.example',
		kind: 'domain',
		provider: 'drive-domain',
		state: 'degraded',
		source: 'drive-domain-registry',
		observedAt: '2026-08-14T15:59:30.000Z',
		maxAgeMs: 60_000,
		reason: 'Ownership verified; routing still pending.',
		nextAction: { kind: 'verify', id: 'verify-domain', label: 'Verify routing' }
	}, now);
	assert.equal(record.freshness, 'fresh');
	assert.equal(record.ageMs, 30_000);
	assert.equal(record.nextAction.kind, 'verify');
	assert.equal(Object.isFrozen(record), true);
});

test('old evidence becomes stale without changing provider state', () => {
	const now = Date.parse('2026-08-14T16:00:00.000Z');
	const record = projectEvidenceRecord({
		id: 'git', kind: 'git', provider: 'github', state: 'ready', source: 'owned-node',
		observedAt: '2026-08-14T15:00:00.000Z', maxAgeMs: 60_000
	}, now);
	assert.equal(record.state, 'ready');
	assert.equal(record.freshness, 'stale');
});

test('intent gap distinguishes requested providers from proven ready evidence', () => {
	const intents = [
		{ kind: 'git', provider: 'github', id: 'friend/repo' },
		{ kind: 'social', provider: 'geelooy', id: 'garden' }
	];
	const evidence = [
		{ kind: 'git', provider: 'github', id: 'friend/repo', state: 'ready' },
		{ kind: 'social', provider: 'geelooy', id: 'garden', state: 'degraded' }
	];
	assert.deepEqual(intentEvidenceGap(intents, evidence), [
		{ kind: 'git', provider: 'github', id: 'friend/repo', proven: true },
		{ kind: 'social', provider: 'geelooy', id: 'garden', proven: false }
	]);
});

test('evidence filtering remains stable and action kinds reject arbitrary execution', () => {
	const records = [{ kind: 'domain' }, { kind: 'git' }, { kind: 'domain' }];
	assert.equal(evidenceByKind(records, 'domain').length, 2);
	assert.throws(() => projectEvidenceRecord({
		id: 'x', kind: 'git', provider: 'github', source: 'test',
		nextAction: { kind: 'shell', label: 'Run arbitrary shell' }
	}), /Unknown evidence action kind/);
});
