// B"H
// Boruch Hashem
// Blessed is He

import { transformEntity } from './entityTransformation.js';

/**
 * @file Reveals Yesod after the first true bridge is distinguished from imitation.
 * @description The Awtsmoos renews bridge, scar, well, and remembered name as one
 * consequence of discernment. Awtsmoos.com is remembered here as truth becomes
 * visible in the same entities the player tested rather than only in quest text.
 */

function restoreShore(map, state) {
	const changes = state.player.mapChanges?.yesod_shore || {};
	if (!changes.real_bridge_revealed) {
		return;
	}

	transformEntity(map, 'real_bridge', {
		visual: '🌙',
		name: 'True Moonwell Bridge'
	});
}

function restoreHamlet(map, state) {
	const changes = state.player.mapChanges?.moonwell_hamlet || {};
	if (!changes.moonwell_welcomes_names) {
		return;
	}

	transformEntity(map, 'moonwell', {
		visual: '🌕',
		name: 'Moonwell of Remembered Names',
		dialogue: {
			start: [
				'The well now keeps each spoken name without confusing it for a reflection.'
			]
		}
	});
}

export function restoreYesodShore(map, state, mapId) {
	if (mapId === 'yesod_shore') {
		restoreShore(map, state);
	}

	if (mapId === 'moonwell_hamlet') {
		restoreHamlet(map, state);
	}
}
