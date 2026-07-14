//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GameHud
 * @description
 * The herald names region, chapter, mission, progress, abilities, and the latest
 * living event. Awtsmoos.com keeps these words outside simulation so the city's
 * logic remains pure while the Awtsmoos makes every purpose visible.
 */

import { abilityList } from '../campaign/AbilityCatalog.js';
import { ChapterMenu } from './ChapterMenu.js';

export class GameHud {
	constructor(root = document) {
		this.root = root;
		this.chapterMenu = new ChapterMenu(root.getElementById('chapterGrid'));
		this.elements = Object.fromEntries([
			'regionValue', 'chapterValue', 'chapterTitle', 'missionLabel',
			'missionProgress', 'sparkValue', 'totalValue', 'abilityValue',
			'seedValue', 'message', 'pauseOverlay', 'transitionOverlay',
			'transitionTitle', 'transitionReward', 'errorOverlay', 'errorMessage'
		].map(id => [id, root.getElementById(id)]));
	}

	bind(handlers) {
		const actions = {
			pauseButton: handlers.pause,
			resumeButton: handlers.resume,
			restartCheckpointButton: handlers.restartCheckpoint,
			restartChapterButton: handlers.restartChapter,
			continueButton: handlers.continueChapter,
			newCampaignButton: handlers.newCampaign,
			motionButton: handlers.toggleMotion,
			contrastButton: handlers.toggleContrast,
			muteButton: handlers.toggleMute
		};
		for (const [id, handler] of Object.entries(actions)) {
			this.root.getElementById(id)?.addEventListener('click', handler);
		}
		this.chapterMenu.bind(handlers.selectChapter);
	}

	update(state) {
		const chapter = state.level.chapter;
		const mission = state.session.mission.progress();
		this.text('regionValue', chapter.regionName);
		this.text('chapterValue', `${chapter.number} / 24`);
		this.text('chapterTitle', chapter.title);
		this.text('missionLabel', mission.label);
		this.text('missionProgress', mission.complete ? 'Complete' : `${mission.completed} / ${mission.required}`);
		this.text('sparkValue', state.session.collectedSparks);
		this.text('totalValue', state.progress.totalSparks + state.session.collectedSparks);
		this.text('abilityValue', abilityList(state.progress.unlockedAbilities).map(item => item.name).join(' · ') || 'Steady Light');
		this.text('seedValue', state.baseSeed);
		this.text('message', state.session.lastEvent);
		this.chapterMenu.render(state.progress);
		this.toggle('pauseOverlay', state.paused && !state.chapterTransition);
		this.updateTransition(state.chapterTransition);
		this.updateSettings(state.settings);
	}

	updateTransition(transition) {
		this.toggle('transitionOverlay', Boolean(transition));
		if (!transition) return;
		this.text('transitionTitle', `${transition.completed.title} completed`);
		this.text('transitionReward', transition.rewardAbility
			? `A new ability was revealed: ${transition.rewardAbility}.`
			: `The path now opens toward ${transition.next.title}.`);
	}

	updateSettings(settings) {
		this.root.body.classList.toggle('highContrast', settings.highContrast);
		this.press('motionButton', settings.reducedMotion);
		this.press('contrastButton', settings.highContrast);
		this.press('muteButton', settings.muted);
	}

	showError(error) {
		this.text('errorMessage', error?.message || 'The city encountered an unknown fault.');
		this.toggle('errorOverlay', true);
	}

	text(id, value) {
		if (this.elements[id]) this.elements[id].textContent = String(value);
	}

	toggle(id, visible) {
		this.elements[id]?.classList.toggle('visible', Boolean(visible));
		this.elements[id]?.setAttribute('aria-hidden', String(!visible));
	}

	press(id, pressed) {
		this.root.getElementById(id)?.setAttribute('aria-pressed', String(Boolean(pressed)));
	}
}
