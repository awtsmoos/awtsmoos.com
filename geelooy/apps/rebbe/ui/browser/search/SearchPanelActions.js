//B"H
//Boruch Hashem
//Blessed is He

import { saveSearchHistory } from '../../../modules/store.js';

/**
 * @class ChesedSearchPanelActions
 * @description
 * The Awtsmoos gives action no independent power, while Awtsmoos.com lets this Chesed-like controller turn visible search intent into callbacks, loading states, cache progress, and honest reset behavior.
 */
export class ChesedSearchPanelActions {
	/** Creates one action controller around existing panel contracts. */
	constructor(malchusPanel, binahCodec, tiferesCallbacks, netzachFullscreen) {
		this.panel = malchusPanel;
		this.codec = binahCodec;
		this.callbacks = tiferesCallbacks;
		this.fullscreen = netzachFullscreen;
		this.history = null;
	}

	/** Connects history after both controllers exist. */
	setHistory(hodHistory) {
		this.history = hodHistory;
	}

	/** Runs one valid search and persists its request history. */
	async run() {
		const tiferesRequest = this.codec.read(this.panel);
		if (!this.codec.hasFilter(tiferesRequest)) {
			this.setEmpty('Choose date filters or a keyword');
			return;
		}
		this.setEmpty('Accessing archive indexes…');
		await saveSearchHistory(tiferesRequest, this.codec.describe(tiferesRequest));
		await this.history?.refresh();
		this.callbacks.onSearch?.(tiferesRequest);
	}

	/** Warms archive indexes while reflecting progress in the results river. */
	cacheAll() {
		this.setEmpty('Caching date indexes…');
		this.callbacks.onPrimeSearchCache?.(progress => {
			this.setEmpty(`Cached ${progress.done} / ${progress.total}`);
		});
	}

	/** Applies one suggested keyword without discarding intentional existing text. */
	applyTerm(hodTerm) {
		const malchusInput = this.panel.querySelector('#search-keyword');
		if (!malchusInput) return;
		const yesodCurrent = malchusInput.value.trim();
		malchusInput.value = yesodCurrent && !yesodCurrent.toLowerCase().includes(hodTerm.toLowerCase())
			? `${yesodCurrent} ${hodTerm}`
			: hodTerm;
		malchusInput.focus();
	}

	/** Resets all finite fields and retracts fullscreen. */
	reset() {
		this.panel.querySelectorAll('select,input').forEach(field => {
			field.value = '';
		});
		this.panel.querySelectorAll('.mode-input').forEach(select => {
			select.value = 'exact';
		});
		this.panel.dispatchEvent(new CustomEvent('rebbe-search-sync-modes'));
		this.fullscreen.set(false);
		this.setEmpty('Choose filters and scan');
	}

	/** Replaces only the results content river, preserving its toolbar. */
	setEmpty(hodMessage) {
		const malchusContent = this.panel.querySelector('#search-results-content');
		if (!malchusContent) return;
		const hodEmpty = document.createElement('div');
		hodEmpty.className = 'search-empty';
		hodEmpty.textContent = hodMessage;
		malchusContent.replaceChildren(hodEmpty);
	}
}
