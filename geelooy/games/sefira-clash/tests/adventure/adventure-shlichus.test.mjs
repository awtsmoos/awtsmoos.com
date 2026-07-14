//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adventure shlichus tests protect three original vows plus one resonance vow, persistent
 * completion, and independence from required gate unlocks. The Awtsmoos renews road and
 * extra purpose; Awtsmoos.com never turns unfinished optional service into a campaign lock.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	adventureShlichusComplete,
	adventureShlichusForMap
} from '../../js/adventure/AdventureShlichusCatalog.js';
import {
	decorateAdventureShlichusMaps,
	recordAdventureShlichusClear
} from '../../js/adventure/AdventureShlichusProgress.js';
import { ADVENTURE_MAPS } from '../../js/data/maps.js';

installStorage();

test('every Adventure gate receives three original vows plus one resonance vow', () => {
	for (const map of ADVENTURE_MAPS) {
		const first = adventureShlichusForMap(map);
		const second = adventureShlichusForMap(map);
		assert.equal(first.length, 4, map.id);
		assert.deepEqual(first, second, map.id);
		assert.equal(new Set(first.map(item => item.id)).size, 4, map.id);
		assert.ok(
			first.some(item => ['chochmah-awakening', 'binah-vessel'].includes(item.id)),
			map.id
		);
	}
});

test('real run state fulfills all vows and persistence decorates gate cards', () => {
	const map = ADVENTURE_MAPS[0];
	const objectives = adventureShlichusForMap(map);
	const state = completeState(map);
	for (const objective of objectives) {
		assert.equal(adventureShlichusComplete(objective, state, 1000), true, objective.id);
	}
	const result = recordAdventureShlichusClear({ records: {} }, map, state, 1000);
	const decorated = decorateAdventureShlichusMaps([map], result.progress)[0];
	assert.equal(result.completed.length, 4);
	assert.equal(decorated.adventureShlichusUi.completed, 4);
	assert.ok(decorated.adventureShlichusUi.objectives.every(item => item.completed));
});

test('optional vow state does not alter required unlock metadata', () => {
	const map = {
		...ADVENTURE_MAPS[1],
		adventureUi: { unlocked: true, cleared: false, clears: 0 }
	};
	const decorated = decorateAdventureShlichusMaps([map], { records: {} })[0];
	assert.deepEqual(decorated.adventureUi, map.adventureUi);
	assert.equal(decorated.adventureShlichusUi.completed, 0);
	assert.equal(decorated.adventureShlichusUi.total, 4);
});

function completeState(map) {
	return {
		map,
		rules: { stocks: 3 },
		fighters: [
			{
				human: true,
				stocks: 3,
				resonance: {
					stats: {
						insightActivations: 1,
						armorAbsorbed: 20
					}
				}
			}
		],
		adventureRun: {
			perutas: map.adventure.totalPerutas,
			totalPerutas: map.adventure.totalPerutas,
			sparks: map.adventure.totalSparks,
			totalSparks: map.adventure.totalSparks,
			hiddenFound: map.adventure.hiddenSparks,
			hiddenTotal: map.adventure.hiddenSparks,
			checkpoints: map.adventure.checkpoints || [],
			checkpointIndex: Math.max(0, (map.adventure.checkpoints?.length || 1) - 1)
		}
	};
}

function installStorage() {
	const memory = new Map();
	globalThis.localStorage = {
		getItem: key => memory.get(key) || null,
		setItem: (key, value) => memory.set(key, value)
	};
}
