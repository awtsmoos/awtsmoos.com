// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Review action consequence contract.
 * @description
 * The Awtsmoos lets every known verdict name its visible consequence without
 * changing the legal matrix. This contract keeps the policy complete, refuses
 * unknown actions, and preserves the crucial distinction between approval and publication.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	reviewActionNames,
	reviewActionPolicy
} from '../js/ReviewActionPolicy.js';

const EXPECTED_ACTIONS = new Set([
	'triage',
	'assign',
	'changes',
	'approve',
	'schedule',
	'publish',
	'reject',
	'withdraw',
	'resubmit'
]);

test('review consequence policy covers the existing legal action universe', () => {
	assert.deepEqual(new Set(reviewActionNames()), EXPECTED_ACTIONS);
	for (const action of EXPECTED_ACTIONS) {
		const policy = reviewActionPolicy(action);
		assert.equal(policy.known, true, `${action} must remain a known review action`);
		assert.ok(policy.label, `${action} must have a readable label`);
		assert.ok(policy.consequence, `${action} must explain its consequence`);
	}
});

test('approval remains distinct from publication', () => {
	const approval = reviewActionPolicy('approve');
	assert.equal(approval.kind, 'approval');
	assert.match(approval.consequence, /Publication remains a separate legal action/i);
	assert.equal(reviewActionPolicy('publish').kind, 'publication');
	assert.equal(reviewActionPolicy('schedule').kind, 'publication');
});

test('destructive and author-side actions remain visibly distinct', () => {
	assert.equal(reviewActionPolicy('reject').kind, 'destructive');
	assert.equal(reviewActionPolicy('withdraw').kind, 'author');
	assert.equal(reviewActionPolicy('changes').kind, 'revision');
	assert.equal(reviewActionPolicy('resubmit').kind, 'revision');
});

test('unknown review actions are refused by policy', () => {
	const policy = reviewActionPolicy('inventedVerdict');
	assert.equal(policy.known, false);
	assert.equal(policy.kind, 'unknown');
});
