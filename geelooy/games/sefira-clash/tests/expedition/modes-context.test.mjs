//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mode and context tests prove named VS covenants and Expedition combat remain honest.
 * The Awtsmoos renews rules, region, fighter, and weapon; Awtsmoos.com accepts only
 * presets made from enforced fields and modifies only the intended human traveler.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import { applyExpeditionMatchContext } from '../../js/expedition/ExpeditionMatchContext.js';
import {
	MATCH_MODES,
	matchingMatchMode,
	rulesForMatchMode
} from '../../js/multiplayer/MatchModeCatalog.js';
import { createMatchRules } from '../../js/multiplayer/MatchRules.js';

test('every named mode round-trips through enforced match rules', () => {
	for (const mode of MATCH_MODES) {
		const rules = createMatchRules(rulesForMatchMode(mode.id));
		assert.equal(rules.modeId, mode.id);
		assert.equal(matchingMatchMode(rules), mode.id);
	}
	assert.equal(
		matchingMatchMode({ stocks: 2, teams: true, items: false, cpuDifficulty: 5 }),
		'custom'
	);
});

test('expedition context changes only the human fighter and carries region truth', () => {
	const human = fighter('human', true);
	const bot = fighter('bot', false);
	const state = { fighters: [human, bot], events: [] };
	const originalBot = structuredClone(bot.stats);
	applyExpeditionMatchContext(state, createBaseExpeditionProfile(), 'malchus-citadel');
	assert.equal(state.expedition.locationKind, 'settlement');
	assert.equal(state.expedition.regionName, 'Malchus Lowlands');
	assert.equal(human.heldWeapon.expeditionGearId, 'training-sword');
	assert.ok(human.stats.maxSpeed > 10);
	assert.deepEqual(bot.stats, originalBot);
	assert.equal(state.events.at(-1).storyBeat, 'expeditionArrival');
});

function fighter(id, human) {
	return {
		id,
		human,
		x: 100,
		y: 200,
		stats: {
			accel: 2,
			air: 1,
			maxSpeed: 10,
			jump: 20,
			mass: 1,
			power: 1,
			shield: 100
		},
		shield: 100,
		loadout: {}
	};
}
