// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatContracts.test.mjs
 * @description Proves the renderer-independent combat vessels before runtime integration.
 * The Awtsmoos gives truth to every boundary; Awtsmoos.com tests each finite contract
 * so timing, terrain, focus, defense, targeting, and community motion cannot drift silently.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createCombatDamageEvent } from '../../gameplay/CombatDamageEvent.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { PlayerCombatDefense } from '../../gameplay/PlayerCombatDefense.js';
import { torahAbilityFor } from '../../gameplay/TorahAbilityRules.js';
import { TorahFocusRuntime } from '../../gameplay/TorahFocusRuntime.js';
import { chooseEnemyAttack } from '../../world/enemy/EnemyAttackCatalog.js';
import {
	advanceEnemyAttack,
	beginEnemyAttack,
	markEnemyAttackDamage
} from '../../world/enemy/EnemyAttackTimeline.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';
import { enemyTerrainAllows } from '../../world/enemy/EnemyTerrainPolicy.js';
import { EnemyUpdateCadence, enemyUpdateInterval } from '../../world/enemy/EnemyUpdateCadence.js';
import {
	advanceNpcDangerMotion,
	createNpcDangerReaction,
	npcReactionState
} from '../../world/npc/NpcDangerReactionPolicy.js';

test('attack timeline exposes anticipation, one active window, recovery, and completion', () => {
	const attack = chooseEnemyAttack('shadow-husk', 0, 2);
	const timeline = beginEnemyAttack(attack, 10);
	assert.equal(advanceEnemyAttack(timeline, 10.1).state, ENEMY_STATE.ATTACK_ANTICIPATION);
	assert.equal(advanceEnemyAttack(timeline, timeline.activeStart).damageWindowOpened, true);
	markEnemyAttackDamage(timeline);
	assert.equal(advanceEnemyAttack(timeline, timeline.activeStart).damageWindowOpened, false);
	assert.equal(advanceEnemyAttack(timeline, timeline.activeEnd).state, ENEMY_STATE.ATTACK_RECOVERY);
	assert.equal(advanceEnemyAttack(timeline, timeline.completeAt).complete, true);
});

test('archetypes select distinct readable attacks', () => {
	assert.equal(chooseEnemyAttack('portal-wraith', 2, 7).id, 'charged-pulse');
	assert.equal(chooseEnemyAttack('klipah-stalker', 0, 3).id, 'lunging-cut');
	assert.equal(chooseEnemyAttack('shadow-husk', 1, 2).id, 'ground-pulse');
});

test('damage events are normalized and immutable', () => {
	const event = createCombatDamageEvent({ amount: -4, sourceId: 's', targetId: 't' }, 55);
	assert.equal(event.amount, 0);
	assert.equal(event.timestamp, 55);
	assert.equal(Object.isFrozen(event), true);
	assert.equal(Object.isFrozen(event.worldPosition), true);
});

test('ward resolves perfect, partial, and ordinary incoming damage', () => {
	const defense = new PlayerCombatDefense();
	const event = createCombatDamageEvent({ amount: 10, sourceId: 's', targetId: 'p' });
	defense.activateWard(5);
	assert.equal(defense.resolveIncoming(event, 5.1).amount, 0);
	assert.equal(defense.resolveIncoming(event, 5.5).amount, 3);
	assert.equal(defense.resolveIncoming(event, 7).amount, 10);
});

test('focus runtime enforces canonical learning, ownership, cost, cooldown, and regeneration', () => {
	const inventory = new InventoryStore();
	const runtime = new TorahFocusRuntime(inventory, {
		focus: 20,
		regenerationPerSecond: 2
	});
	const forgedRequest = {
		cooldownMs: 0,
		focusCost: 0,
		id: 'modeh-ani'
	};
	const accepted = runtime.tryUse(forgedRequest, 2000);
	assert.equal(accepted.ok, true);
	assert.equal(accepted.passage.focusCost, 8);
	assert.equal(runtime.tryUse({ id: 'modeh-ani' }, 2200).reason, 'PASSAGE_COOLDOWN');
	assert.equal(runtime.update(1).focus, 14);
});

test('ability rules preserve respectful named mechanics', () => {
	assert.equal(torahAbilityFor({ aspect: 'peace', damage: 0, id: 'p', name: 'P' }).name, 'Tehillim Ward');
	assert.equal(torahAbilityFor({ aspect: 'courage', damage: 7, id: 'm', name: 'M' }).targetMode, 'area');
});

test('terrain policy rejects sanctuaries and allows the canonical bridge', () => {
	const ground = {
		heightAt() {
			return 0;
		},
		sample() {
			return { kind: 'terrain', normal: { y: 1 } };
		}
	};
	assert.equal(enemyTerrainAllows(ground, -34, -24), false);
	assert.equal(enemyTerrainAllows(ground, 18, 7), true);
});

test('distance cadence preserves urgent updates and releases accumulated time', () => {
	assert.equal(enemyUpdateInterval({ distance: 200, selected: true, state: ENEMY_STATE.WANDER }), 0);
	const cadence = new EnemyUpdateCadence();
	assert.equal(cadence.advance(0.2, { distance: 150, selected: false, state: ENEMY_STATE.WANDER }), 0);
	const released = cadence.advance(0.4, {
		distance: 150,
		selected: false,
		state: ENEMY_STATE.WANDER
	});
	assert.ok(Math.abs(released - 0.6) < Number.EPSILON * 4);
});

test('friendly danger motion flees from the threat and returns to calm', () => {
	const actor = {
		dangerReaction: createNpcDangerReaction({ x: 0, z: 0 }, 10, 2),
		footOffset: 0,
		ground: {
			heightAt() {
				return 0;
			}
		},
		model: { position: { set() {} } },
		profile: {},
		worldX: 1,
		worldZ: 0
	};
	assert.equal(advanceNpcDangerMotion(actor, 1, 10.5), true);
	assert.ok(actor.worldX > 1);
	assert.equal(npcReactionState(actor, 13), 'calm');
});
