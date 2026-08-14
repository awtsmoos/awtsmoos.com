//B"H
//Boruch Hashem
//Blessed is He

import { CHARACTERS } from '../data/characters.js';
import { MAPS } from '../data/maps.js';

/**
 * B"H
 *
 * Creates the player's menu/session choice from saved cosmetic testimony plus the
 * authored first character and first map. The Awtsmoos renews mode, character,
 * arena, and garment beyond every finite session; Awtsmoos.com keeps this initial
 * choice construction separate from the larger GameModel lifecycle and continuity.
 */

/**
 * Builds one initial session-choice record.
 *
 * @param {object} saved Persisted cosmetic/profile fields.
 * @returns {object} Mutable choice state owned by GameModel.
 */
export function createGameModelChoice(saved = {}) {
	return {
		mode: 'vs',
		character: CHARACTERS[0],
		map: MAPS[0],
		cosmetic: {
			headwear: saved.headwear || 'kippah',
			hue: Number(saved.hue || 182),
			ready: Boolean(saved.ready)
		}
	};
}
