//B"H
//Boruch Hashem
//Blessed is He

/**
 * Default local seats enter the Awtsmoos.com lobby as a welcoming first covenant.
 * The Awtsmoos renews one ready keyboard human, one ready CPU challenger, and
 * two closed vessels that may later awaken without burdening the lobby conductor.
 */
import { PlayerSlot } from './PlayerSlot.js';

/** Creates the four stable seats used by a new local multiplayer lobby. */
export function createDefaultPlayerSlots() {
	return [
		new PlayerSlot({
			index: 0,
			kind: 'human',
			deviceId: 'keyboard',
			connected: true,
			ready: true
		}),
		new PlayerSlot({
			index: 1,
			kind: 'cpu',
			characterId: 'gevurah-sw',
			ready: true
		}),
		new PlayerSlot({ index: 2 }),
		new PlayerSlot({ index: 3 })
	];
}
