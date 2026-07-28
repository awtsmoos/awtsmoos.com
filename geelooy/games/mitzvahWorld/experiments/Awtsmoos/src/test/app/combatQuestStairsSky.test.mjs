// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatQuestStairsSky.test.mjs
 * @description Proves merciful combat, spaced spawns, bright selection, live mission, stairs, and sky.
 * The Awtsmoos gives trial, choice, ascent, mission, and heaven their visible measures;
 * Awtsmoos.com prevents crowd attacks, fake parchment, hidden slopes, and flat blue emptiness.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { skyFragmentFunctions } from '../../../../light-three-gltf/tiny-sky-fragment-functions.js';
import {
	MINIMAL_MEADOW_COMBAT_ACTIONS
} from '../../app/MinimalMeadowCombatActions.js';
import {
	MINIMAL_MEADOW_COMBAT_BALANCE
} from '../../app/MinimalMeadowCombatBalancePolicy.js';
import {
	MINIMAL_MEADOW_ENEMY_PROFILES
} from '../../app/MinimalMeadowEnemyProfiles.js';
import {
	clearMinimalMeadowEnemyVisual,
	selectMinimalMeadowEnemyVisual
} from '../../app/MinimalMeadowEnemySelectionVisual.js';
import {
	createMinimalMeadowHouseStairs
} from '../../app/MinimalMeadowHouseStairs.js';
import {
	MINIMAL_MEADOW_HOUSE_PROFILES
} from '../../app/MinimalMeadowHouseProfiles.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';
import {
	minimalMeadowShlichusMenuContent
} from '../../ui/MinimalMeadowMenuShlichus.js';

test('B"H action icons are pictographic while Hebrew remains present', () => {
	assert.equal(MINIMAL_MEADOW_COMBAT_ACTIONS['hebrew-fire'].icon, '🔥');
	assert.equal(MINIMAL_MEADOW_COMBAT_ACTIONS['letter-light'].icon, '☀️');
	assert.equal(MINIMAL_MEADOW_COMBAT_ACTIONS['staff-strike'].icon, '🪄');
	assert.equal(MINIMAL_MEADOW_COMBAT_ACTIONS['hebrew-fire'].letters, 'אש');
});

test('B"H combat pressure is slower, smaller, and spatially separated', () => {
	assert.equal(MINIMAL_MEADOW_COMBAT_BALANCE.attackSlots.melee, 1);
	assert.ok(MINIMAL_MEADOW_COMBAT_BALANCE.cooldowns.melee >= 4);
	assert.ok(MINIMAL_MEADOW_COMBAT_BALANCE.damage.melee <= 6);
	assert.ok(MINIMAL_MEADOW_COMBAT_BALANCE.playerInvulnerabilitySeconds >= 1.3);
	assert.ok(MINIMAL_MEADOW_COMBAT_BALANCE.ranges.aggro <= 12);
	for (let first = 0; first < MINIMAL_MEADOW_ENEMY_PROFILES.length; first += 1) {
		for (let second = first + 1; second < MINIMAL_MEADOW_ENEMY_PROFILES.length; second += 1) {
			const a = MINIMAL_MEADOW_ENEMY_PROFILES[first];
			const b = MINIMAL_MEADOW_ENEMY_PROFILES[second];
			assert.ok(Math.hypot(a.x - b.x, a.z - b.z) >= 20);
		}
	}
});

test('B"H selected enemy brightens and receives visible markers', () => {
	const group = new Group();
	const material = {
		baseColorFactor: [0.3, 0.2, 0.5, 1],
		color: [0.3, 0.2, 0.5, 1],
		emissiveColor: [0.02, 0.02, 0.02, 1],
		emissiveStrength: 0.06
	};
	group.userData.rig = { mesh: { material } };
	const actor = { group, profile: { height: 2.4, id: 'selected' }, selected: true };
	const original = [...material.color];
	const marker = selectMinimalMeadowEnemyVisual(actor);
	assert.equal(marker.children.length, 5);
	assert.ok(material.emissiveStrength >= 0.55);
	assert.notDeepEqual(material.color, original);
	clearMinimalMeadowEnemyVisual(actor);
	assert.deepEqual(material.color, original);
	assert.equal(marker.visible, false);
});

test('B"H Shlichus menu follows canonical active mission progress', () => {
	const record = {
		definition: { description: 'Defeat the shadow.', id: 'live', title: 'Live Shlichus' },
		objectiveIndex: 0,
		objectives: [{ count: 5, description: 'Defeat five shadows.', progress: 2 }],
		pinned: true,
		status: 'active'
	};
	const content = minimalMeadowShlichusMenuContent({
		adventures: { snapshot: () => ({ active: [record], available: [], completed: [], offered: [], pinned: [record] }) }
	});
	assert.match(content.body, /Live Shlichus/);
	assert.match(content.body, /2\/5 · 40%/);
	assert.doesNotMatch(content.body, /East Gate/);
});

test('B"H stairs expose discrete tread heights and no hidden ramp', () => {
	const profile = MINIMAL_MEADOW_HOUSE_PROFILES.find(item => item.floors > 1);
	const stairs = createMinimalMeadowHouseStairs(profile, { floor: { color: '#777777' } }, 0);
	assert.equal(stairs.stats.collision, 'discrete-tread-height-sampler');
	assert.equal(stairs.definitions.some(item => item.id.includes('continuous-stair-ramp')), false);
	const startZ = profile.layout.innerDepth / 2 - 3;
	const first = housePoint(profile, 0, startZ - profile.layout.stairTread * 0.5);
	const third = housePoint(profile, 0, startZ - profile.layout.stairTread * 2.5);
	const firstHeight = stairs.support.heightAt(first.x, first.z, 0);
	const thirdHeight = stairs.support.heightAt(third.x, third.z, firstHeight);
	assert.ok(thirdHeight > firstHeight);
	assert.ok(Math.abs((thirdHeight - firstHeight) - stairs.stats.maximumRise * 2) < 0.00001);
});

test('B"H sky shader contains intense disc, halo, clouds, and warm horizon', () => {
	assert.match(skyFragmentFunctions, /heroSun/);
	assert.match(skyFragmentFunctions, /core\*11\.0/);
	assert.match(skyFragmentFunctions, /cloud\*0\.88/);
	assert.match(skyFragmentFunctions, /horizon\*0\.28/);
});
