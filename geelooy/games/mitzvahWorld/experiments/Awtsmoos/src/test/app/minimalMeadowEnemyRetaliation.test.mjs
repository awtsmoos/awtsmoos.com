// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyRetaliation.test.mjs
 * @description Proves every configured demon immediately enters combat after a positive nonlethal hit.
 * The Awtsmoos grants no shadow permission to ignore consequence; Awtsmoos.com measures all nine
 * profiles so warden, skirmisher, cantor, ranged, flanker, balanced, and melee enemies answer alike.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	damageMinimalEnemy
} from '../../app/MinimalMeadowEnemyLifecycle.js';
import {
	MINIMAL_MEADOW_ENEMY_PROFILES
} from '../../app/MinimalMeadowEnemyProfiles.js';

test('B"H every living enemy profile retaliates when struck', () => {
	for (const profile of MINIMAL_MEADOW_ENEMY_PROFILES) {
		const engagements = [];
		const events = [];
		const actor = {
			action: 'idle',
			alive: true,
			bus: {
				emit(name, payload) {
					events.push({ name, payload });
				}
			},
			combat: {
				engage(reason) {
					engagements.push(reason);
				}
			},
			health: profile.maxHealth,
			payload() {
				return {
					health: this.health,
					id: profile.id
				};
			},
			profile,
			selected: false
		};
		const receipt = damageMinimalEnemy(actor, 1);
		assert.equal(receipt.damage, 1, profile.id);
		assert.equal(receipt.defeated, false, profile.id);
		assert.deepEqual(engagements, ['struck-by-player'], profile.id);
		assert.equal(events.at(-1).name, 'enemy:damaged', profile.id);
	}
});

test('B"H zero damage does not create false retaliation', () => {
	let engagements = 0;
	const actor = {
		action: 'idle',
		alive: true,
		bus: { emit() {} },
		combat: { engage() { engagements += 1; } },
		health: 10,
		payload() { return { health: this.health }; },
		selected: false
	};
	damageMinimalEnemy(actor, 0);
	assert.equal(engagements, 0);
});
