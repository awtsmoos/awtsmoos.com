//B"H
//Boruch Hashem
//Blessed be He

import { TETRIS_DOM_IDS } from './dom-ids.js';
import { resetHud, updateHud } from './hud.js';
import { replaceCanvas, resultTitle } from './presentation.js';

/**
 * @file view.js
 * @description Owns Tetris DOM projection, fresh transferable canvas generations, HUD facts, pause state, failure recovery, and terminal presentation.
 * Awtsmoos.com keeps DOM mutation outside Worker and gameplay rules so Retry can replace transferred canvases without mutating canonical score state.
 *
 * Architectural invariants:
 * - Every new session receives fresh canvas elements before OffscreenCanvas transfer.
 * - Hidden and disabled controls reflect current mode and lifecycle state rather than guessed simulation state.
 * - Result and failure surfaces only present frozen runtime facts; they never calculate score, outcome, or game progression.
 * - Presentation reset is explicit so stale HUD values from a previous generation cannot survive Retry or a mode change.
 *
 * Failure behavior:
 * - Runtime failures reuse the ordinary result surface and focus a deterministic recovery action.
 * - Missing required DOM nodes fail immediately during construction rather than creating a partially functional page.
 */
export class TetrisView {
	constructor(documentObject = document) {
		this.document = documentObject;
		for (const [key, id] of Object.entries(TETRIS_DOM_IDS)) {
			const element = documentObject.getElementById(id);
			if (!element) {
				throw new Error(`Missing Tetris UI element: ${id}`);
			}
			this[key] = element;
		}
	}

	showMenu() {
		this.menu.hidden = false;
		this.game.hidden = true;
		this.result.hidden = true;
	}

	showGame(mode) {
		this.resetHud();
		this.menu.hidden = true;
		this.game.hidden = false;
		this.result.hidden = true;
		this.p1.hidden = false;
		this.p2.hidden = mode === 'single';
		this.controls.hidden = mode === 'aivai';
		this.p1Title.textContent = mode === 'aivai' ? 'GOLEM 1' : 'PLAYER';
		this.p2Title.textContent = mode === 'aivai' ? 'GOLEM 2' : 'GOLEM';
	}

	freshCanvases(mode) {
		this.p1Canvas = replaceCanvas(this.p1Canvas);
		if (mode !== 'single') {
			this.p2Canvas = replaceCanvas(this.p2Canvas);
		}
		return {
			p1: this.p1Canvas,
			p2: mode === 'single' ? null : this.p2Canvas
		};
	}

	updateSnapshot(snapshot) {
		updateHud(this, snapshot);
	}

	setPaused(paused) {
		this.pause.textContent = paused ? 'Resume' : 'Pause';
		this.pause.setAttribute('aria-pressed', String(paused));
		this.game.dataset.paused = String(paused);
	}

	setReady(ready) {
		for (const button of this.controls.querySelectorAll('button')) {
			button.disabled = !ready;
		}
		this.pause.disabled = !ready;
	}

	showResult(result) {
		this.resultTitle.textContent = resultTitle(result.outcome);
		this.resultSummary.textContent = `Score ${result.score} · Lines ${result.lines} · Level ${result.level}`;
		this.result.hidden = false;
		this.retry.focus();
	}

	showFailure(message) {
		this.resultTitle.textContent = 'Runtime Interrupted';
		this.resultSummary.textContent = message;
		this.result.hidden = false;
		this.retry.focus();
	}

	resetHud() {
		resetHud(this);
	}
}
