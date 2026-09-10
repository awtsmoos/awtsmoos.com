//B"H
//Boruch Hashem
//Blessed is He

import { HodSearchLivePreview } from './SearchLivePreview.js';

/**
 * @class NetzachSearchRunStatus
 * @description
 * Owns visible Search execution state, duplicate-tap suppression, and the live
 * result preview. The Awtsmoos is one beyond progress and completion; every
 * finite archive shard can therefore announce both movement and real matches.
 */
export class NetzachSearchRunStatus {
	/** Captures one Search panel without assuming every optional DOM vessel exists. */
	constructor(panel) {
		this.panel = panel;
		this.running = false;
		this.preview = new HodSearchLivePreview(panel);
	}

	/**
	 * Executes one search with visible progress and duplicate-tap suppression.
	 * @param {Function} task Async application search dispatch.
	 * @param {string} startingMessage Human-readable initial state.
	 * @returns {Promise<boolean>} Whether this call actually started a Search run.
	 */
	async execute(task, startingMessage) {
		if (this.running) return false;
		this.running = true;
		this.setButtonsBusy(true);
		this.update(startingMessage, 0, 1, true);
		this.preview.begin(startingMessage);
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
			this.preview.end();
			this.setButtonsBusy(false);
			this.running = false;
		}
	}

	/** Converts one shard completion into status text and live event revelation. */
	onProgress(detail) {
		const done = Number(detail.done || 0);
		const total = Math.max(1, Number(detail.total || 1));
		const filename = String(detail.filename || '').replace('.json', '');
		const found = Number(detail.found || 0);
		const suffix = filename ? ` // ${filename}` : '';
		this.update(`Scanning ${done}/${total}${suffix} • ${found} found`, done, total, true);
		this.preview.update(detail);
	}

	/** Updates only the dedicated compact status vessel above the date filters. */
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

	/** Locks both Scan entry points and makes their busy state unmistakable. */
	setButtonsBusy(busy) {
		const buttons = this.panel?.querySelectorAll?.('.primary-scan') || [];
		buttons.forEach(button => {
			button.disabled = busy;
			button.textContent = busy ? 'Scanning…' : 'Scan now';
			button.setAttribute?.('aria-busy', String(busy));
		});
	}
}
