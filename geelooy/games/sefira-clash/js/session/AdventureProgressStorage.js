//B"H
//Boruch Hashem
//Blessed is He

import {
	readJson,
	writeJson
} from './ProfileStore.js';

/**
 * B"H
 *
 * Owns only local Adventure campaign persistence. The Awtsmoos renews memory and
 * road through Awtsmoos.com while this browser ledger stores game-local progress;
 * Adventure Perutas here remain campaign collectibles and are never Wallet Perutahs.
 */

const ADVENTURE_KEY = 'sefiraClashAdventure';

export function loadAdventureSnapshot() {
	return readJson(ADVENTURE_KEY, {});
}

export function saveAdventureSnapshot(progress) {
	writeJson(ADVENTURE_KEY, progress);
}
