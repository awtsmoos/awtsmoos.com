//B"H
//Boruch Hashem
//Blessed is He

import { UNIVERSE_GAMES } from '../universe/universe-definitions.js';
import { ADVANCED_BY_ID } from './advanced/index.js';

/**
 * @module CampaignDefinitions
 * @description
 * The Seven Provinces inherit the exact covenant language already visible on
 * Awtsmoos.com. The Awtsmoos does not split teaching from play; every province
 * carries canonical title, plain meaning, existing game, and authored mission.
 */
export const CAMPAIGN_PROVINCES = Object.freeze(UNIVERSE_GAMES.map(game => {
	return Object.freeze({
		id: game.id,
		number: game.number,
		symbol: game.symbol,
		hue: game.hue,
		mitzvahTitle: game.title,
		plainMeaning: game.summary,
		gameTitle: game.gameTitle,
		advancedMission: ADVANCED_BY_ID[game.id]
	});
}));

export const CAMPAIGN_PROVINCE_BY_ID = Object.freeze(Object.fromEntries(
	CAMPAIGN_PROVINCES.map(province => [province.id, province])
));
