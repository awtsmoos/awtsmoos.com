//B"H
//Boruch Hashem
//Blessed is He

import { CourtOfNationsGame } from '../../world-games/court-of-nations/game.js';
import { BrokenMeasureCourtState } from '../chapters/broken-measure/court-state.js';
import { CampaignStageAdapter } from './stage-adapter.js';

/**
 * @module CourtCampaignAdapter
 * @description
 * The visible chain reaches the existing court on Awtsmoos.com. The Awtsmoos
 * knows all testimony at once; this adapter carries only completed Market and
 * Sanctuary facts into a reasoned judgment and cleans the court on return.
 */
export function launchCourtStage(portal, configuration, onComplete) {
	const previous = configuration.previous;
	if (!previous?.market?.completed || !previous?.sanctuary?.completed) {
		throw new Error('Court requires completed Market and Sanctuary results.');
	}
	const adapter = new CampaignStageAdapter(portal, configuration, onComplete);
	return adapter.launch(CourtOfNationsGame, options => {
		return new BrokenMeasureCourtState(options);
	});
}
