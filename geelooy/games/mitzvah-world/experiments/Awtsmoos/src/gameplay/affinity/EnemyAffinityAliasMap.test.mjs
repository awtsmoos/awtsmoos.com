// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAffinityAliasMap.test.mjs
 * @description Proves runtime enemy ids resolve to canonical shared/combat species
 * ids, and that the JSON affinity / resistance tables actually modify damage for
 * spawned enemies (stream 4 profile-id seam).
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalEnemyAffinityId,
	RUNTIME_ENEMY_AFFINITY_ALIASES
} from './EnemyAffinityAliasMap.js';
import {
	ENEMY_AFFINITY_PROFILES
} from './generated/CombatDefinitionRecords.js';
import {
	resolveLocalEnemyCombatImpact
} from '../../app/combat/LocalEnemyCombatAuthority.js';

test('every alias target exists in the canonical JSON-derived profile table', () => {
	for (const [runtimeId, canonicalId] of Object.entries(RUNTIME_ENEMY_AFFINITY_ALIASES)) {
		assert.ok(
			Object.hasOwn(ENEMY_AFFINITY_PROFILES, canonicalId),
			`${runtimeId} -> ${canonicalId} is missing from enemy-profiles.json`
		);
	}
});

test('runtime spawn ids remap to the JSON catalog species ids', () => {
	assert.equal(canonicalEnemyAffinityId('tzel-chai'), 'klipah-guardian');
	assert.equal(canonicalEnemyAffinityId('esh-katan'), 'klipah-guardian');
	assert.equal(canonicalEnemyAffinityId('ruach-afelah'), 'fallen-seraph-husk');
	assert.equal(canonicalEnemyAffinityId('ayin-raash'), 'great-dybbuk');
	assert.equal(canonicalEnemyAffinityId('even-koved'), 'dybbuk-shade');
	assert.equal(canonicalEnemyAffinityId('kedem-letter-warden'), 'kedem-letter-warden');
});

test('canonical JSON ids pass through unchanged', () => {
	assert.equal(canonicalEnemyAffinityId('fox'), 'fox');
	assert.equal(canonicalEnemyAffinityId('wolf'), 'wolf');
	assert.equal(canonicalEnemyAffinityId('dybbuk-shade'), 'dybbuk-shade');
});

test('unknown ids resolve to null (caller falls back to dybbuk-shade)', () => {
	assert.equal(canonicalEnemyAffinityId('not-a-creature'), null);
	assert.equal(canonicalEnemyAffinityId(''), null);
	assert.equal(canonicalEnemyAffinityId(null), null);
});

function fakeActor(profileId) {
	const applied = [];
	return {
		actor: {
			action: 'idle',
			airborne: false,
			hidden: false,
			defense: { value: 4 },
			profile: { id: profileId, tags: [] },
			statusLedger: null,
			applyDamage(amount) {
				applied.push(amount);
				return { damage: amount, defeated: false, health: 100 - amount };
			}
		},
		applied
	};
}

test('a fox-affinity enemy takes JSON-table modified damage (light-air resisted)', () => {
	const { actor, applied } = fakeActor('fox');
	const result = resolveLocalEnemyCombatImpact({
		actionId: 'letter-light',
		actor,
		localAction: { damage: 100 },
		runtime: {}
	});
	// enemy-profiles.json: fox light-air resistance 0.08 -> 100 * 0.92 = 92.
	assert.equal(result.effectiveness.finalDamage, 92);
	assert.deepEqual(applied, [92]);
	assert.ok(
		result.effectiveness.diagnostics.some(line => /target resistance/.test(line)),
		'resistance diagnostic is reported'
	);
});

test('a fox-affinity enemy takes full fire damage (fire resistance 0)', () => {
	const { actor } = fakeActor('fox');
	const result = resolveLocalEnemyCombatImpact({
		actionId: 'hebrew-fire',
		actor,
		localAction: { damage: 100 },
		runtime: {}
	});
	assert.equal(result.effectiveness.finalDamage, 100);
});

test('a tzel-chai spawn resolves to klipah-guardian affinity (not the dybbuk-shade fallback)', () => {
	const { actor } = fakeActor('tzel-chai');
	const result = resolveLocalEnemyCombatImpact({
		actionId: 'letter-light',
		actor,
		localAction: { damage: 100 },
		runtime: {}
	});
	// klipah-guardian light-air resistance 0.05 -> 95. Before the seam fix the
	// lookup missed and every spawn silently used empty resistances (100).
	assert.equal(result.effectiveness.finalDamage, 95);
	assert.equal(result.effectiveness.multiplier, 0.95);
});
