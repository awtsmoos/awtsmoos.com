//B"H
//Boruch Hashem
//Blessed is He

/**
 * Frontier encounter tests protect deterministic weather and monotonic guardian phases.
 * The Awtsmoos renews sky, warning, and combat together; Awtsmoos.com must expose every
 * escalation through state and events rather than invisible stat inflation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EXPEDITION_BOSSES } from '../../js/data/expedition/bossCatalog.js';
import { ADVENTURE_MAPS } from '../../js/data/maps.js';
import {
	initializeExpeditionBoss,
	stepExpeditionBoss
} from '../../js/expedition/ExpeditionBossDirector.js';
import { compileExpeditionMaps } from '../../js/expedition/ExpeditionMapCompiler.js';
import {
	advanceExpeditionWeather,
	resolveExpeditionWeather,
	stepExpeditionWeather
} from '../../js/expedition/ExpeditionWeather.js';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';

test('authors ten guardians with three monotonic phases', () => {
	assert.equal(EXPEDITION_BOSSES.length, 10);
	for (const boss of EXPEDITION_BOSSES) {
		assert.equal(boss.phases.length, 3, boss.id);
		assert.deepEqual(
			boss.phases.map(phase => phase.threshold),
			[...boss.phases].map(phase => phase.threshold).sort((a, b) => a - b)
		);
	}
});

test('boss transitions from actual damage and emits visible events', () => {
	const map = compileExpeditionMaps(ADVENTURE_MAPS).find(
		item => item.expedition.locationId === 'crown-ruins'
	);
	const human = { id: 'human', human: true, x: 400, y: 400, dead: false };
	const enemy = {
		id: 'enemy',
		human: false,
		x: 800,
		y: 400,
		vx: 0,
		vy: 0,
		damage: 0,
		onGround: true,
		dead: false,
		stats: { power: 1, maxSpeed: 10, accel: 2, air: 1, shield: 100, jump: 18 },
		shield: 100
	};
	const state = {
		frame: 1,
		map,
		fighters: [human, enemy],
		events: [],
		expedition: { locationId: 'crown-ruins' }
	};
	initializeExpeditionBoss(state);
	enemy.damage = 120;
	stepExpeditionBoss(state);
	assert.equal(state.expedition.boss.phaseIndex, 2);
	assert.ok(enemy.stats.power > 1.4);
	assert.ok(state.events.some(event => event.storyBeat === 'bossPhase'));
});

test('weather is deterministic, advances explicitly, and emits named effects', () => {
	const map = compileExpeditionMaps(ADVENTURE_MAPS)[0];
	const profile = createBaseExpeditionProfile();
	const first = resolveExpeditionWeather(map, profile);
	const repeated = resolveExpeditionWeather(map, profile);
	assert.deepEqual(first, repeated);
	const advanced = advanceExpeditionWeather(profile, 2);
	assert.equal(advanced.weatherClock, 2);
	const state = {
		frame: 10,
		events: [],
		expedition: { weather: { ...first, cadence: 1 }, weatherFrame: 0 }
	};
	stepExpeditionWeather(state);
	assert.equal(state.events[0].type, 'expeditionWeather');
	assert.equal(state.events[0].weatherId, first.id);
});
