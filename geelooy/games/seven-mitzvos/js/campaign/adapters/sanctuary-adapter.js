//B"H
//Boruch Hashem
//Blessed is He

import { LivingSanctuaryGame } from '../../world-games/living-sanctuary/game.js';
import { BrokenMeasureSanctuaryState } from '../chapters/broken-measure/sanctuary-state.js';
import { CampaignStageAdapter } from './stage-adapter.js';

/**
 * @module SanctuaryCampaignAdapter
 * @description
 * The underweight shipment enters the existing sanctuary on Awtsmoos.com. The
 * Awtsmoos carries cause into consequence; this adapter carries only validated
 * Market facts and never teaches the standalone sanctuary about campaign storage.
 */
export function launchSanctuaryStage(portal, configuration, onComplete) {
	if (!configuration.previous?.market?.completed) {
		throw new Error('Sanctuary requires a completed Market result.');
	}
	const adapter = new CampaignStageAdapter(portal, configuration, onComplete);
	return adapter.launch(LivingSanctuaryGame, options => {
		return new BrokenMeasureSanctuaryState(options);
	});
}
