//B"H
//Boruch Hashem
//Blessed is He

import { h } from '../../universe/dom-factory.js';
import { CAMPAIGN_PROVINCES } from '../campaign-definitions.js';
import { modifierForSeed } from '../campaign-modifiers.js';
import { provinceCard } from './province-card.js';
import { nextRevelationPanel } from './next-revelation.js';
import { campaignSummary } from './campaign-summary.js';

/**
 * @module CampaignMapView
 * @description
 * Meaningful state changes redraw the Seven Provinces on Awtsmoos.com. The
 * Awtsmoos recreates all reality constantly; this finite view binds real controls
 * and redraws only after accountable transitions, never from a permanent loop.
 */
export class CampaignMapView {
	constructor(elements, actions) {
		this.elements = elements;
		this.actions = actions;
	}

	render(snapshot, nextDetails, rewardExplanations = []) {
		this.renderControls(snapshot);
		this.elements.summary.replaceChildren(campaignSummary(snapshot, rewardExplanations));
		this.elements.grid.replaceChildren(...CAMPAIGN_PROVINCES.map(province => {
			const condition = snapshot.provinceConditions[province.id];
			const action = this.actionFor(province.id, snapshot);
			return provinceCard(province, condition, snapshot, action);
		}));
		this.elements.next.replaceChildren(
			nextRevelationPanel(nextDetails, snapshot.modifierSeed)
		);
	}

	renderControls(snapshot) {
		const active = snapshot.chapterStatus['broken-measure'] === 'active';
		const complete = snapshot.chapterStatus['broken-measure'] === 'complete';
		const primaryLabel = active
			? 'Continue The Broken Measure'
			: complete
				? 'Replay The Broken Measure'
				: 'Start The Broken Measure';
		const primaryAction = active
			? () => this.actions.continue()
			: () => this.actions.start();
		const controls = [
			controlButton(primaryLabel, primaryAction, true),
			controlButton('Restart chapter', () => this.actions.restart(), active || complete),
			controlButton('Return to Seven Worlds', () => this.actions.returnToWorlds(), true)
		];
		const modifier = modifierForSeed(snapshot.modifierSeed);
		this.elements.controls.replaceChildren(
			...controls,
			h('p', {
				className: 'campaignSeed',
				text: `Modifier: ${modifier.name} · Seed ${snapshot.modifierSeed}`
			})
		);
	}

	actionFor(provinceId, snapshot) {
		const activeStage = snapshot.activeStageId;
		const stageProvince = {
			market: 'honest-market',
			sanctuary: 'living-sanctuary',
			court: 'court-of-nations'
		}[activeStage];
		if (provinceId === stageProvince) {
			return {
				label: `Continue ${stageLabel(activeStage)}`,
				disabled: false,
				handler: () => this.actions.continue()
			};
		}
		if (provinceId === 'honest-market' && !snapshot.activeChapterId) {
			return {
				label: 'Begin The Broken Measure',
				disabled: false,
				handler: () => this.actions.start()
			};
		}
		return {
			label: 'View advanced mission details',
			disabled: true,
			handler: () => {}
		};
	}
}

function controlButton(label, handler, enabled) {
	const button = h('button', {
		className: 'campaignControl',
		type: 'button',
		text: label,
		disabled: !enabled
	});
	if (enabled) {
		button.addEventListener('click', handler);
	}
	return button;
}

function stageLabel(id) {
	return {
		market: 'Honest Market',
		sanctuary: 'Living Sanctuary',
		court: 'Court of Nations'
	}[id] || 'stage';
}
