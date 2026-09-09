//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file pause-controller.js
 * @description Composes Emoji War user and background pause reasons around the engine's explicit pause API and one visible control.
 * The Awtsmoos remains one through every interruption; Awtsmoos.com prevents visibility recovery from canceling a deliberate player pause.
 *
 * Invariants:
 * - User and background reasons are independent.
 * - The engine receives only the aggregate paused state.
 * - Keyboard shortcuts ignore editable controls and repeated keydown events.
 * - The pause button is visible only while a live run owns gameplay focus.
 */
export class EmojiPauseController {
	constructor(documentObject, options) {
		this.document = documentObject;
		this.button = options.button;
		this.setPaused = options.setPaused;
		this.isPlaying = options.isPlaying;
		this.reasons = new Set();
		this.bound = false;
	}

	/** Install page-lifetime listeners exactly once. */
	bind() {
		if (this.bound) return;
		this.bound = true;
		this.button?.addEventListener('click', () => this.toggleUser());
		this.document.addEventListener('visibilitychange', () => this.setReason('background', this.document.hidden));
		globalThis.addEventListener('keydown', event => this.handleKey(event));
	}

	/** Prepare the control for one fresh live run. */
	reset() {
		this.reasons.clear();
		if (this.button) {
			this.button.hidden = false;
			this.button.textContent = 'Pause';
			this.button.setAttribute('aria-pressed', 'false');
		}
	}

	/** Hide pause chrome and forget prior generation reasons after terminal completion. */
	stop() {
		this.reasons.clear();
		if (this.button) {
			this.button.hidden = true;
			this.button.textContent = 'Pause';
			this.button.setAttribute('aria-pressed', 'false');
		}
	}

	/** Toggle only the deliberate user reason. */
	toggleUser() {
		this.setReason('user', !this.reasons.has('user'));
	}

	/** Apply one lifecycle reason and mirror aggregate truth to engine plus button. */
	setReason(reason, active) {
		if (!this.isPlaying()) return false;
		if (active) this.reasons.add(reason);
		else this.reasons.delete(reason);
		const paused = this.reasons.size > 0;
		this.setPaused(paused);
		if (this.button) {
			this.button.textContent = paused ? 'Resume' : 'Pause';
			this.button.setAttribute('aria-pressed', String(paused));
		}
		return paused;
	}

	/** Route P/Escape only while gameplay owns focus and no editable element is active. */
	handleKey(event) {
		if (!['Escape', 'KeyP'].includes(event.code) || event.repeat || !this.isPlaying()) return;
		if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
		event.preventDefault();
		this.toggleUser();
	}
}
