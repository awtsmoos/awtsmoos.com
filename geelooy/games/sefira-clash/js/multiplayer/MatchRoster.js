//B"H
//Boruch Hashem
//Blessed is He

/**
 * A match roster translates lobby promises into simulation-ready truth.
 * The Awtsmoos renews each Awtsmoos.com seat as a stable record so state
 * creation never guesses who is human, which character was chosen, or who teams.
 */
import { characterById } from '../data/characters.js';

/**
 * Creates a validated roster snapshot from a ready local lobby.
 *
 * @param {import('./PlayerLobby.js').PlayerLobby} lobby Local lobby model.
 * @returns {object[]} Active roster entries.
 */
export function rosterFromLobby(lobby) {
	if (!lobby.canStart()) {
		throw new Error('Lobby is not ready to start.');
	}
	return lobby.activeSlots().map(slot => rosterEntry(slot));
}

/**
 * Creates the legacy one-human roster followed by generated CPU seats.
 *
 * @param {object} character Selected human character.
 * @param {object} cosmetic Human cosmetic data.
 * @param {number} botCount Number of CPU opponents.
 * @returns {object[]} Compatibility roster.
 */
export function legacyRoster(character, cosmetic, botCount) {
	const roster = [
		{
			slotId: 'player-1',
			index: 0,
			kind: 'human',
			deviceId: 'keyboard',
			character: characterById(character?.id),
			team: 1,
			color: '#6fe7ff',
			cosmetic: { ...cosmetic }
		}
	];
	for (let index = 0; index < botCount; index += 1) {
		roster.push(cpuEntry(index + 1));
	}
	return roster;
}

function rosterEntry(slot) {
	return {
		slotId: slot.id,
		index: slot.index,
		kind: slot.kind,
		deviceId: slot.deviceId,
		character: characterById(slot.characterId),
		team: slot.team,
		color: slot.color,
		cpuDifficulty: slot.cpuDifficulty,
		cosmetic: {}
	};
}

function cpuEntry(index) {
	const ids = ['gevurah-sw', 'chesed-fist', 'netzach-spark', 'yesod-lance', 'malchus-crown'];
	return {
		slotId: `cpu-${index}`,
		index,
		kind: 'cpu',
		deviceId: null,
		character: characterById(ids[(index - 1) % ids.length]),
		team: index + 1,
		color: '#ff9f7a',
		cpuDifficulty: 2,
		cosmetic: {}
	};
}
