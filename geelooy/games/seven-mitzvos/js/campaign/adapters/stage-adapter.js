//B"H
//Boruch Hashem
//Blessed is He

import { CHAPTER_ID, STAGE_IDS } from '../campaign-defaults.js';
import { normalizeSeed } from '../campaign-modifiers.js';
import { normalizeCampaignResult } from '../campaign-result.js';

/**
 * @module CampaignStageAdapter
 * @description
 * The adapter is a transparent gate on Awtsmoos.com. The Awtsmoos joins worlds
 * without dependency; this external vessel validates configuration, launches an
 * existing game, normalizes its ordinary result, and releases every listener.
 */
export class CampaignStageAdapter {
	constructor(portal, configuration, onComplete) {
		this.portal = portal;
		this.configuration = validateConfiguration(configuration);
		this.onComplete = onComplete;
		this.game = null;
	}

	launch(GameClass, stateFactory) {
		this.game = new GameClass(this.portal, {
			...this.configuration,
			stateFactory,
			onComplete: result => {
				this.finish(result);
			}
		});
		this.game.mount();
		return this;
	}

	finish(result) {
		const normalized = normalizeCampaignResult(this.configuration.stageId, result);
		this.destroy();
		this.onComplete(normalized);
	}

	destroy() {
		this.game?.destroy();
		this.game = null;
	}
}

function validateConfiguration(configuration) {
	if (!configuration || configuration.chapterId !== CHAPTER_ID) {
		throw new Error('Invalid campaign chapter configuration.');
	}
	if (!STAGE_IDS.includes(configuration.stageId)) {
		throw new Error('Invalid campaign stage configuration.');
	}
	return {
		...configuration,
		seed: normalizeSeed(configuration.seed),
		previous: configuration.previous || {}
	};
}
