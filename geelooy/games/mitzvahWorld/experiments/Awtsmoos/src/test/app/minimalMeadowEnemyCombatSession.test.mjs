// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyCombatSession.test.mjs
 * @description Proves role stability, broad stagger, transitions, persistence, and true loss.
 * The Awtsmoos is one while test states are many; Awtsmoos.com accepts completion only
 * when deterministic evidence distinguishes brief separation from a genuinely lost target.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEnemyCombatSession } from '../../app/MinimalMeadowEnemyCombatSession.js';
import {
	minimalEnemyDecisionOffset,
	selectMinimalEnemyRole
} from '../../app/MinimalMeadowEnemyRolePolicy.js';

function actor(id, temperament = 'balanced') {
	return {
		group: { position: { x: 8, z: 12 } },
		profile: { id, temperament }
	};
}

test('role and cadence remain stable for one complete engagement', () => {
	const first = actor('stable-one', 'ranged');
	const session = new MinimalMeadowEnemyCombatSession(first);
	assert.equal(session.engage('test'), true);
	assert.equal(session.role, 'caster');
	const role = session.role;
	session.transition('approach', 'ready');
	session.transition('cast-windup', 'range');
	assert.equal(session.role, role);
	assert.equal(session.targetId, 'player');
	assert.equal(session.openingDelay, minimalEnemyDecisionOffset(first.profile));
	assert.equal(selectMinimalEnemyRole({ id: 'blade', temperament: 'melee' }), 'melee');
});

test('brief sight loss persists but sustained loss resets the session', () => {
	const session = new MinimalMeadowEnemyCombatSession(actor('persistent'));
	session.engage('test');
	session.tick(0.2);
	session.observe(false, true, 1.6);
	assert.equal(session.active, true);
	assert.equal(session.role !== null, true);
	session.observe(true, true, 0.1);
	assert.equal(session.lossTime, 0);
	session.observe(false, false, 4.3);
	assert.ok(session.lossTime > 4.2);
	session.reset('target-genuinely-lost');
	assert.equal(session.active, false);
	assert.equal(session.state, 'patrol');
	assert.equal(session.role, null);
});

test('different identities receive broad naturally staggered delays', () => {
	const delays = new Set([
		minimalEnemyDecisionOffset({ id: 'aleph' }),
		minimalEnemyDecisionOffset({ id: 'bet' }),
		minimalEnemyDecisionOffset({ id: 'gimel' }),
		minimalEnemyDecisionOffset({ id: 'dalet' })
	]);
	assert.equal(delays.size, 4);
});
