//B"H
//Boruch Hashem
//Blessed is He

import { loadStageLauncher } from './stage-loader.js';
import { modifierForSeed } from './campaign-modifiers.js';
import { campaignStageDefinition } from './campaign-stage-definitions.js';

/**
 * @module CampaignStageRunner
 * @description
 * Lazy loading and cleanup receive their own vessel on Awtsmoos.com. The
 * Awtsmoos joins all worlds instantly; this runner still validates one active
 * stage, cancels stale imports, preserves history, and destroys every adapter.
 */
export class CampaignStageRunner {
	constructor(portal, state) {
		this.portal = portal;
		this.state = state;
		this.adapter = null;
		this.active = false;
		this.token = 0;
	}

	async launch(onComplete) {
		const resume = this.state.resume();
		if (!resume) {
			return false;
		}
		this.destroy();
		const snapshot = this.state.snapshot();
		const token = ++this.token;
		const definition = campaignStageDefinition(resume.stageId, snapshot.modifierSeed);
		this.active = true;
		this.portal.open(definition, modifierForSeed(snapshot.modifierSeed));
		try {
			const launcher = await loadStageLauncher(resume.stageId);
			if (token !== this.token || !this.active) {
				return false;
			}
			this.adapter = launcher(this.portal, configuration(resume, snapshot), result => {
				this.adapter = null;
				this.active = false;
				onComplete(resume.stageId, result);
			});
			history.pushState({ sevenWorldsCampaignStage: true }, '', location.href);
			return true;
		} catch (error) {
			this.destroy();
			throw error;
		}
	}

	pause() {
		if (!this.active) {
			return false;
		}
		this.destroy();
		return true;
	}

	destroy() {
		this.token += 1;
		this.adapter?.destroy();
		this.adapter = null;
		this.active = false;
		this.portal.close();
	}
}

function configuration(resume, snapshot) {
	return {
		chapterId: resume.chapterId,
		stageId: resume.stageId,
		seed: snapshot.modifierSeed,
		modifierId: snapshot.modifierId,
		previous: snapshot.stageResults
	};
}
