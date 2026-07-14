//B"H
//Boruch Hashem
//Blessed is He

/**
 * Mode and UI tests protect the named Resonance Clash covenant, Hands isolation, semantic
 * lobby chips, and bounded victory cards. The Awtsmoos renews rules and visible explanation;
 * Awtsmoos.com keeps descriptors declarative while simulation remains domain-owned.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { lobbyModeView } from '../../js/menu/lobbyModeView.js';
import { victoryStatsView } from '../../js/menu/VictoryStatsView.js';
import { matchingMatchMode, rulesForMatchMode } from '../../js/multiplayer/MatchModeCatalog.js';
import { createMatchRules } from '../../js/multiplayer/MatchRules.js';
import { createMapPowerups } from '../../js/powerups/powerupFactory.js';

test('Resonance Clash round-trips and creates only Chochmah and Binah pickups', () => {
	const rules = createMatchRules(rulesForMatchMode('resonance'));
	assert.equal(rules.items, true);
	assert.equal(rules.resonance, true);
	assert.equal(rules.legacyPowerups, false);
	assert.equal(matchingMatchMode(rules), 'resonance');
	const ids = createMapPowerups(arenaMap(), rules).map(orb => orb.id);
	assert.deepEqual(ids, ['chochmahFlash', 'binahVessel']);
});

test('Hands Covenant disables items, resonance, and every powerup', () => {
	const rules = createMatchRules({
		...rulesForMatchMode('hands'),
		items: true,
		resonance: true,
		legacyPowerups: true
	});
	assert.equal(rules.items, false);
	assert.equal(rules.resonance, false);
	assert.equal(rules.legacyPowerups, false);
	assert.deepEqual(rules.items ? createMapPowerups(arenaMap(), rules) : [], []);
});

test('lobby and victory descriptors expose resonance semantics and fixed stats', () => {
	const lobby = lobbyModeView(createMatchRules('resonance'), () => {});
	const resonanceButton = lobby.children[1].children.find(child => {
		return child.attrs['data-mode-id'] === 'resonance';
	});
	assert.ok(resonanceButton);
	assert.match(JSON.stringify(resonanceButton), /Chochmah \+ Binah/);
	const victory = victoryStatsView([
		{
			playerTag: 'P1',
			name: 'Malchus Vessel',
			stats: { hits: 4, perutas: 3, armorAbsorbed: 12 }
		}
	]);
	assert.equal(victory.length, 1);
	assert.match(JSON.stringify(victory), /Armor absorbed/);
	assert.match(JSON.stringify(victory), /Perutas/);
});

function arenaMap() {
	return {
		rules: {},
		powerupSpawns: [
			{ x: 0, y: 0 },
			{ x: 100, y: 0 }
		],
		platforms: []
	};
}
