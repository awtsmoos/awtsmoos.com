//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match evidence joins lobby promises to simulation truth in Awtsmoos.com.
 * The Awtsmoos renews four seats, two humans, authored identities, enforced
 * rules, team presentation, and Adventure compatibility as executable proof.
 */
import assert from 'node:assert/strict';
import { inputForFighter } from '../../js/core/fighterInput.js';
import { createGameState, createRosterGameState } from '../../js/core/state.js';
import { resolveWinner } from '../../js/core/winner.js';
import { CHARACTERS } from '../../js/data/characters.js';
import { ADVENTURE_MAPS, MAPS } from '../../js/data/maps.js';
import { WEAPONS } from '../../js/data/weapons.js';
import { PlayerLobby } from '../../js/multiplayer/PlayerLobby.js';
import { rosterFromLobby } from '../../js/multiplayer/MatchRoster.js';
import { victoryPresentationFor } from '../../js/session/MatchVictory.js';
import { winnerFor } from '../../js/session/sessionHelpers.js';

/** Runs roster, match, input, rules, team, and Adventure assertions. */
export function runMatchAudit(registry) {
	assertRosterCatalog();
	const lobby = createReadyLobby(registry);
	const state = assertRosterMaterialization(lobby);
	assertSeparateCommands(state);
	assertEnforcedRules(lobby);
	assertTeamWinner(state);
	assertAdventureCompatibility();
}

function assertRosterCatalog() {
	const ids = CHARACTERS.map(character => character.id);
	assert.equal(new Set(ids).size, CHARACTERS.length);
	for (const character of CHARACTERS) {
		assert.ok(WEAPONS[character.weaponId], `Missing weapon: ${character.weaponId}`);
	}
}

function createReadyLobby(registry) {
	const lobby = new PlayerLobby();
	lobby.setKind(1, 'human', 'gamepad:0');
	lobby.toggleReady(1);
	lobby.setKind(2, 'cpu');
	lobby.setCharacter(2, 'chesed-fist');
	lobby.setKind(3, 'cpu');
	lobby.setCharacter(3, 'malchus-crown');
	lobby.syncConnections(registry);
	assert.equal(lobby.canStart(), true);
	assert.equal(lobby.activeSlots().length, 4);
	assert.throws(() => {
		lobby.assignDevice(2, 'keyboard');
	});
	return lobby;
}

function assertRosterMaterialization(lobby) {
	const roster = rosterFromLobby(lobby);
	const state = createRosterGameState(MAPS[0], roster, lobby.rules);
	state.mode = 'vs';
	assert.equal(state.fighters.length, 4);
	assert.equal(state.fighters.filter(fighter => fighter.human).length, 2);
	assert.equal(state.fighters[1].deviceId, 'gamepad:0');
	assert.notEqual(state.fighters[0].heldWeapon.id, state.fighters[2].heldWeapon.id);
	assert.notEqual(state.fighters[0].stats.maxSpeed, state.fighters[2].stats.maxSpeed);
	return state;
}

function assertSeparateCommands(state) {
	const frame = {
		bySlot: {
			'player-1': { x: -1 },
			'player-2': { x: 1 }
		}
	};
	assert.equal(inputForFighter(frame, state.fighters[0]).x, -1);
	assert.equal(inputForFighter(frame, state.fighters[1]).x, 1);
}

function assertEnforcedRules(lobby) {
	const roster = rosterFromLobby(lobby);
	const state = createRosterGameState(MAPS[0], roster, {
		stocks: 5,
		teams: true,
		items: false
	});
	assert.ok(state.fighters.every(fighter => fighter.stocks === 5));
	assert.equal(state.weapons.length, 0);
	assert.equal(state.powerups.length, 0);
}

function assertTeamWinner(state) {
	state.rules.teams = true;
	state.fighters.forEach((fighter, index) => {
		fighter.team = index < 2 ? 1 : 2;
		fighter.dead = index >= 2;
	});
	assert.equal(resolveWinner(state), 'Team 1');
	const winner = winnerFor(state);
	assert.equal(winner.team, 1);
	assert.deepEqual(victoryPresentationFor(state, winner), {
		label: 'Team 1',
		humanWon: true
	});
}

function assertAdventureCompatibility() {
	const state = createGameState(ADVENTURE_MAPS[0], 2, CHARACTERS[0], {});
	state.mode = 'adventure';
	assert.equal(state.fighters.filter(fighter => fighter.human).length, 1);
	assert.equal(resolveWinner(state), '');
	state.fighters.find(fighter => fighter.human).dead = true;
	assert.notEqual(resolveWinner(state), '');
}
