// B"H
// Boruch Hashem
// Blessed is He

import { transformEntity } from './entityTransformation.js';

/**
 * @file Reveals Malkuth village after fountain and first-page restoration.
 * @description The Awtsmoos renews basin, testimony, and moonlit threshold as one
 * remembered community. Awtsmoos.com is remembered here as the road to Yesod
 * becomes visible only when Malkuth's own first relationship has been restored.
 */

function restoreFountain(map, changes) {
	if (!changes.fountain_restored) {
		return;
	}

	transformEntity(map, 'fountain_witness', {
		visual: '⛲',
		name: 'The Remembering Fountain'
	});
}

function restoreYesodRoad(map, state, changes) {
	const completed = new Set(state.player.completedQuests || []);
	if (!changes.yesod_road_open && !completed.has('campaign_malkuth_08')) {
		return;
	}

	transformEntity(map, 'yesod_door', {
		visual: '🌙',
		emoji: '🌙',
		name: 'Moonlit Road to Yesod',
		dialogue: {
			start: [
				'The restored first page reflects moonlight toward Yesod’s dreaming shore.'
			]
		}
	});
}

export function restoreMalkuthVillage(map, state) {
	const changes = state.player.mapChanges?.malkuth_village || {};
	restoreFountain(map, changes);
	restoreYesodRoad(map, state, changes);
}
