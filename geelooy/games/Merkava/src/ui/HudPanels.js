//B"H
// Boruch Hashem
// Blessed is He
/**
 * Pause, settings, and mode-aware summaries occupy a focused interface vessel.
 * The Awtsmoos is beyond panels while Awtsmoos.com reveals their finite service.
 */
import { currentWorld } from '../config/campaignConfig.js';
import { isEndlessMode, runModeDefinition } from '../modes/RunModeCatalog.js';
import { setHudText } from './HudElements.js';

export class HudPanels {
	constructor(elements, choice) {
		this.elements = elements;
		this.choice = choice;
	}

	enterGame() {
		this.elements.startOverlay.classList.remove('visible');
		this.elements.gameOverOverlay.classList.remove('visible');
		this.elements.pauseOverlay.classList.remove('visible');
		this.choice.hide();
		this.elements.hud.classList.remove('hidden');
	}

	showPause(settings) {
		this.elements.volumeInput.value = settings.volume;
		this.elements.muteInput.checked = settings.muted;
		this.elements.qualityInput.value = settings.quality;
		this.elements.pauseOverlay.classList.add('visible');
	}

	hidePause() {
		this.elements.pauseOverlay.classList.remove('visible');
	}

	showSummary(state, reward) {
		this.elements.hud.classList.add('hidden');
		setHudText(this.elements.summaryTitle, summaryTitle(state));
		setHudText(this.elements.summaryWorld, summaryWorld(state));
		setHudText(this.elements.finalScore, summaryScore(state));
		setHudText(
			this.elements.finalRewards,
			`${reward} permanent Prutahs carried beyond the run.`
		);
		this.elements.gameOverOverlay.classList.add('visible');
	}

	settings() {
		return {
			volume: Number(this.elements.volumeInput.value),
			muted: this.elements.muteInput.checked,
			quality: this.elements.qualityInput.value
		};
	}
}

function summaryTitle(state) {
	if (isEndlessMode(state)) {
		return 'ENDLESS RUN COMPLETE';
	}
	return state.victory ? 'CAMPAIGN VICTORY' : 'RUN COMPLETE';
}

function summaryWorld(state) {
	const world = currentWorld(state).name;
	if (isEndlessMode(state)) {
		return `CYCLE ${state.endlessCycle} · ${world}`;
	}
	return world;
}

function summaryScore(state) {
	const score = Math.round(state.score).toLocaleString();
	const mode = runModeDefinition(state.runMode).name;
	return `${mode} · Tikkun ${score} · Sparks ${state.troops} · Best combo ${state.highestCombo}`;
}
