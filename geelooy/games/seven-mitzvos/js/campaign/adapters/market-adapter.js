//B"H
//Boruch Hashem
//Blessed is He

import { HonestMarketGame } from '../../world-games/honest-market/game.js';
import { BrokenMeasureMarketState } from '../chapters/broken-measure/market-state.js';
import { CampaignStageAdapter } from './stage-adapter.js';

/**
 * @module MarketCampaignAdapter
 * @description
 * Honest Market remains itself on Awtsmoos.com. The Awtsmoos reveals a new path
 * through the same game vessel; only the external state factory authors the
 * Broken Measure investigation, leaving every standalone mode independent.
 */
export function launchMarketStage(portal, configuration, onComplete) {
	const adapter = new CampaignStageAdapter(portal, configuration, onComplete);
	return adapter.launch(HonestMarketGame, options => {
		return new BrokenMeasureMarketState(options);
	});
}
