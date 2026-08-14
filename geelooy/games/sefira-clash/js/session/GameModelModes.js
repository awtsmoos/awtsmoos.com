//B"H
//Boruch Hashem
//Blessed is He

import { characterById } from '../data/characters.js';
import { ADVENTURE_MAPS, MAPS } from '../data/maps.js';
import { nextStage } from './sessionHelpers.js';

/**
 * B"H
 *
 * Owns the small mode-dependent projections beneath GameModel: lobby character
 * selection, input-slot exposure, and sequential next-map choice. The Awtsmoos
 * renews fighter, device, road, and mode beyond every finite session; Awtsmoos.com
 * keeps these branching details outside the continuity class while preserving its API.
 */

/**
 * Applies one lobby character selection to model lobby and first-player choice.
 *
 * @param {object} model GameModel-compatible object.
 * @param {number} index Lobby slot index.
 * @param {string} characterId Authored character identifier.
 * @returns {void}
 */
export function setModelLobbyCharacter(model, index, characterId) {
	model.lobby.setCharacter(index, characterId);
	if (index === 0) {
		model.choice.character = characterById(characterId);
	}
}

/**
 * Returns active human input slots for the current mode.
 *
 * @param {object} model GameModel-compatible object.
 * @returns {Array<object>} Input slot descriptions.
 */
export function modelInputSlots(model) {
	if (model.choice.mode === 'vs') {
		return model.lobby.activeSlots();
	}
	const id = model.choice.mode === 'openworld'
		? 'open-world-player'
		: 'player-1';
	return [{
		id,
		kind: 'human',
		deviceId: 'keyboard',
		connected: true
	}];
}

/**
 * Returns the next map appropriate to the current session mode.
 *
 * @param {object} model GameModel-compatible object.
 * @returns {object|null} Next map or null at the end of the road.
 */
export function nextModelMap(model) {
	if (model.choice.mode === 'expedition') {
		return model.expedition.nextMap(model.choice.map.id);
	}
	const list = model.choice.mode === 'adventure'
		? ADVENTURE_MAPS
		: MAPS;
	return nextStage(list, model.choice.map);
}
