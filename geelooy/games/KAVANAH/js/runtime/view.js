//B"H
//Boruch Hashem
//Blessed be He

import { nextWorldThreshold } from './world-phase.js';

/**
 * @file view.js
 * @description Projects KAVANAH phase, objective, pause, and terminal result state without mutating simulation truth.
 * The Awtsmoos renews every visible vessel; Awtsmoos.com keeps DOM presentation reversible while canvas gameplay remains authoritative.
 *
 * Invariants:
 * - HUD text derives only from current phase and score facts.
 * - Gameplay chrome is hidden while the canvas menu owns the player's attention.
 * - Pause and result overlays remain explicit and keyboard reachable.
 * - Result presentation survives until explicit Retry or Menu intent.
 */
export class KavanahRuntimeView {
	constructor(documentObject = document) {
		this.hud = documentObject.getElementById('kavanah-hud');
		this.phase = documentObject.getElementById('world-phase');
		this.objective = documentObject.getElementById('world-objective');
		this.progress = documentObject.getElementById('world-progress');
		this.pauseButton = documentObject.getElementById('pause-button');
		this.pausePanel = documentObject.getElementById('pause-panel');
		this.resultPanel = documentObject.getElementById('result-panel');
		this.resultText = documentObject.getElementById('result-text');
		this.retryButton = documentObject.getElementById('retry-button');
		this.menuButton = documentObject.getElementById('result-menu-button');
	}

	/** Refresh world identity and next-threshold progress without creating DOM nodes per frame. */
	showPhase(phase, ascension) {
		if (this.phase) this.phase.textContent = `${phase.name} · World ${phase.index + 1}/4`;
		if (this.objective) this.objective.textContent = phase.objective;
		const next = nextWorldThreshold(ascension);
		if (this.progress) this.progress.textContent = next === null ? 'Final world · mastery ascent' : `${Math.floor(ascension)} / ${next} ascent`;
	}

	/** Mirror aggregate pause truth and keep the explicit control label synchronized. */
	setPaused(paused) {
		if (this.pauseButton) {
			this.pauseButton.textContent = paused ? 'Resume' : 'Pause';
			this.pauseButton.setAttribute('aria-pressed', String(paused));
		}
		if (this.pausePanel) this.pausePanel.hidden = !paused;
	}

	/** Reveal terminal run facts and move keyboard focus to the fastest recovery action. */
	showResult(result, phase) {
		this.setPaused(false);
		if (this.resultText) this.resultText.textContent = `Ascension ${Math.floor(result.score)} · ${phase.name} · ${(result.elapsedMs / 1000).toFixed(1)}s`;
		if (this.resultPanel) this.resultPanel.hidden = false;
		if (this.hud) this.hud.hidden = true;
		if (this.pauseButton) this.pauseButton.disabled = true;
		this.retryButton?.focus();
	}

	/** Hide terminal surfaces and reveal gameplay chrome for one fresh run. */
	showPlaying() {
		if (this.resultPanel) this.resultPanel.hidden = true;
		if (this.hud) this.hud.hidden = false;
		this.setPaused(false);
		if (this.pauseButton) this.pauseButton.disabled = false;
	}

	/** Return to the canvas menu without pretending a game remains active. */
	showMenu() {
		if (this.resultPanel) this.resultPanel.hidden = true;
		if (this.pausePanel) this.pausePanel.hidden = true;
		if (this.hud) this.hud.hidden = true;
		if (this.pauseButton) {
			this.pauseButton.disabled = true;
			this.pauseButton.textContent = 'Pause';
			this.pauseButton.setAttribute('aria-pressed', 'false');
		}
	}
}
