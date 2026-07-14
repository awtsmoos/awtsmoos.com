// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { selectMode } from '../../js/game/progression.js';
import { archetypeFor } from '../../js/game/rivalStrategies.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { MODES } from '../../js/modes/catalog.js';
import { dailySeed, dailyVariant } from '../../js/modes/daily.js';
import { createWorld } from '../../js/state.js';

const CORE_MODE_IDS = Object.freeze([
	'classic', 'last', 'endless', 'conquest', 'bossRush', 'zen',
	'daily', 'timeAttack', 'reverse', 'fragile', 'trafficChaos', 'celestial'
]);

/** Verify every original arena law, both expansion paths, and rival identities. */
export function runDirectorModeCases() {
	return [
		checkModeCatalog(),
		checkZenRules(),
		checkDailyDeterminism(),
		checkRivalArchetypes()
	];
}

function checkModeCatalog() {
	const ids = MODES.map(mode => mode.id);
	assert.equal(MODES.length, 14);
	assert.equal(new Set(ids).size, MODES.length);
	for (const id of CORE_MODE_IDS) assert.ok(ids.includes(id), id);
	assert.deepEqual(ids.slice(-2), ['adventure', 'hevruta']);
	assert.ok(MODES.every(mode => mode.name && mode.description));
	return { test: 'mode-catalog', modes: ids };
}

function checkZenRules() {
	const world = createWorld();
	selectMode(world, 'zen');
	assert.equal(world.gameMode.id, 'zen');
	assert.equal(world.rivals.length, 0);
	assert.equal(world.timeLeft, Infinity);
	assert.equal(world.gameMode.events, false);
	return { test: 'zen-rules', rivals: world.rivals.length, untimed: true };
}

function checkDailyDeterminism() {
	const firstDate = new Date(2026, 6, 12);
	const secondDate = new Date(2026, 6, 13);
	assert.equal(dailySeed(412, firstDate), dailySeed(412, firstDate));
	assert.notEqual(dailySeed(412, firstDate), dailySeed(412, secondDate));
	assert.equal(dailyVariant(firstDate).name, dailyVariant(firstDate).name);
	return {
		test: 'daily-determinism',
		seed: dailySeed(412, firstDate),
		variant: dailyVariant(firstDate).name
	};
}

function checkRivalArchetypes() {
	const identities = new Set();
	for (const level of LEVELS) {
		for (let index = 0; index < 7; index += 1) identities.add(archetypeFor(level, index).id);
	}
	assert.equal(identities.size, 7);
	return { test: 'rival-archetypes', identities: [...identities].sort() };
}
