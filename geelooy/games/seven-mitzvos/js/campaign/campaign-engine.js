//B"H
//Boruch Hashem
//Blessed is He

import { CampaignState } from './campaign-state.js';
import { CampaignMapView } from './ui/campaign-map-view.js';
import { CampaignStagePortal } from './ui/campaign-stage-portal.js';
import { createCampaignTemplate } from './ui/campaign-template.js';
import { CampaignStageRunner } from './campaign-stage-runner.js';
import { bindCampaignLifecycle } from './campaign-lifecycle.js';
import { campaignStageName } from './campaign-stage-definitions.js';
import { completeBrokenMeasure, rewardExplanations } from './campaign-completion.js';

/**
 * @module CampaignEngine
 * @description
 * The campaign coordinates only meaningful transitions on Awtsmoos.com. The
 * Awtsmoos joins cause and consequence directly; smaller vessels now own stage
 * loading and browser lifecycle while this engine guards state, save, and view.
 */
export class CampaignEngine {
	constructor(mount, store) {
		this.store = store;
		this.state = new CampaignState(store.load());
		this.elements = createCampaignTemplate(mount);
		this.portal = new CampaignStagePortal(this.elements.stage);
		this.runner = new CampaignStageRunner(this.portal, this.state);
		this.rewardTexts = [];
		this.nextDetails = null;
		this.view = new CampaignMapView(this.elements, this.actions());
		this.releaseLifecycle = bindCampaignLifecycle(this.portal, this.runner, () => {
			this.announce('Stage paused. Continue from the campaign map.');
			this.render();
		});
		this.render();
	}

	actions() {
		return {
			start: () => this.start(),
			continue: () => this.continue(),
			restart: () => this.restart(),
			returnToWorlds: () => this.returnToWorlds()
		};
	}

	start() {
		this.runner.destroy();
		this.state.startChapter(Date.now() >>> 0);
		this.rewardTexts = [];
		this.nextDetails = null;
		this.persist('The Broken Measure began in Honest Market.');
		this.continue();
	}

	restart() {
		this.runner.destroy();
		this.state.restartChapter();
		this.rewardTexts = [];
		this.nextDetails = null;
		this.persist('The chapter restarted with the same deterministic seed.');
		this.continue();
	}

	async continue() {
		if (!this.state.resume()) {
			this.start();
			return;
		}
		try {
			await this.runner.launch((stageId, result) => {
				this.completeStage(stageId, result);
			});
		} catch (error) {
			this.announce(`Stage could not open: ${error.message}`);
			this.render();
		}
	}

	completeStage(stageId, result) {
		this.state.completeStage(stageId, result);
		this.portal.close();
		if (stageId === 'court') {
			const completion = completeBrokenMeasure(this.state);
			this.rewardTexts = rewardExplanations(completion.rewards);
			this.nextDetails = completion.nextDetails;
		}
		this.persist(`${campaignStageName(stageId)} completed. Campaign consequences saved.`);
	}

	persist(message) {
		this.store.save(this.state.snapshot());
		this.announce(message);
		this.render();
	}

	render() {
		this.view.render(this.state.snapshot(), this.nextDetails, this.rewardTexts);
	}

	announce(message) {
		this.elements.announcement.textContent = '';
		queueMicrotask(() => {
			this.elements.announcement.textContent = message;
		});
	}

	returnToWorlds() {
		document.getElementById('universeMount')?.scrollIntoView({ block: 'start' });
	}

	destroy() {
		this.runner.destroy();
		this.releaseLifecycle();
	}
}
