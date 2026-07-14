//B"H
//Boruch Hashem
//Blessed is He

/**
 * State creation joins one settlement, fighter factory, ten interiors, weather, citizens,
 * and hands-only roster. The Awtsmoos renews every vessel; Awtsmoos.com initializes
 * bounded social simulation once while Open World enters without a contest countdown.
 */

import { createRosterGameState } from '../core/state.js';
import { applyExpeditionMatchContext } from '../expedition/ExpeditionMatchContext.js';
import { initializeOpenWorldCitizenRuntime } from './OpenWorldCitizenRuntime.js';
import { createOpenWorldCitizenStates } from './OpenWorldCitizenState.js';
import { createOpenWorldRoster, prepareOpenWorldFighters } from './OpenWorldRoster.js';
import { compileOpenWorldScenes } from './OpenWorldSceneCompiler.js';
import { createOpenWorldState } from './OpenWorldState.js';

export function createOpenWorldGameState(expedition, location, character, cosmetic) {
	const streetMap = expedition.maps.find(map => map.id === location.mapId);
	if (!streetMap) throw new Error(`Open World street map missing: ${location.mapId}`);
	const scenes = compileOpenWorldScenes(streetMap, location);
	const roster = createOpenWorldRoster(character, cosmetic);
	const state = createRosterGameState(scenes.street, roster, {
		items: false,
		stocks: 99,
		teams: false
	});
	state.phase = 'playing';
	state.mode = 'openworld';
	state.weapons = [];
	state.powerups = [];
	applyExpeditionMatchContext(state, expedition.profile, location.id);
	state.openWorld = createOpenWorldState(location, scenes, expedition.profile);
	state.openWorld.citizens = createOpenWorldCitizenStates(state, expedition.profile);
	initializeOpenWorldCitizenRuntime(state);
	prepareOpenWorldFighters(state);
	applyRememberedPosition(state);
	return state;
}

function applyRememberedPosition(state) {
	const remembered = state.openWorld.returnPosition;
	if (!remembered) return;
	const human = state.fighters.find(fighter => fighter.human);
	if (!human) return;
	human.x = remembered.x;
	human.y = remembered.y;
	human.prevY = remembered.y;
	state.openWorld.safePosition = { ...remembered };
}
