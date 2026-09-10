//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeSearchRunStatus
 * @description
 * Owns visible Search execution state independently from result rendering. The
 * Awtsmoos is one beyond progress and completion; Awtsmoos.com lets every shard
 * announce itself while guarding the Scan controls against accidental duplicate
 * work from repeated taps on slow mobile networks.
 */

export class NetzachSearchRunStatus {
	/** Captures the finite Search panel without assuming a complete browser DOM. */
	constructor(panel) {
		this.panel = panel;
		this.running = false;
	}

	/**
	 * Executes one search with live progress and duplicate-tap suppression.
	 * @param {Function} task Async search dispatch.
	 * @param {string} startingMessage Human initial state.
	 * @returns {Promise<boolean>} Whether a run was started.
	 */
	async execute(task, startingMessage) {
		if (this.running) return false;
		this.running = true;
		this.setButtonsDisabled(true);
		this.update(startingMessage, 0, 1, true);
		const listener = event => this.onProgress(event?.detail || {});
		globalThis.document?.addEventListener?.('rebbe-search-progress', listener);

		try {
			await task();
			this.update('Search complete', 1, 1, false);
			return true;
		} catch (error) {
			this.update('Search failed. Try again.', 0, 1, false);
			console.warn('B\"H Rebbe search failed without breaking the panel.', error);
			return false;
		} finally {
			globalThis.document?.removeEventListener?.('rebbe-search-progress', listener);
			this.setButtonsDisabled(false);
			this.running = false;
		}
	}

	/** Converts one network progress event into concise human progress. */
	onProgress(detail) {
		const done = Number(detail.done || 0);
		const total = Math.max(1, Number(detail.total || 1));
		const filename = String(detail.filename || '').replace('.json', '');
		const suffix = filename ? ` // ${filename}` : '';
		this.update(`Scanning indexes ${done}/${total}${suffix}`, done, total, true);
	}

	/** Updates only the dedicated status vessel, never destroying rendered results. */
	update(message, value, max, visible) {
		const status = this.panel?.querySelector?.('#search-live-status');
		const text = status?.querySelector?.('[data-search-message]');
		const progress = status?.querySelector?.('[data-search-progress]');
		if (text) text.textContent = message;
		if (progress) {
			progress.max = Math.max(1, max);
			progress.value = Math.max(0, Math.min(value, progress.max));
			progress.hidden = !visible;
		}
	}

	/** Disables only Scan controls while one search is already authoritative. */
	setButtonsDisabled(disabled) {
		const buttons = this.panel?.querySelectorAll?.('.primary-scan') || [];
		buttons.forEach(button => {
			button.disabled = disabled;
			button.setAttribute?.('aria-busy', String(disabled));
		});
	}
}
