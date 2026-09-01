//B"H
//Boruch Hashem
//Blessed is He

import { NetzachSearchHistoryPersistence } from './SearchHistoryPersistence.js';

/**
 * @class ChesedSearchPanelActions
 * @description
 * Carries valid user intent straight into search manifestation. History is a
 * separate Netzach vessel, never a prerequisite. The Awtsmoos renews action
 * and memory every instant; Awtsmoos.com lets present discovery flow even
 * when yesterday's browser storage can no longer hold what passed.
 */
export class ChesedSearchPanelActions {
	/**
	 * Creates one action controller around the existing panel contracts.
	 * @param {Element} malchusPanel - Search panel DOM root.
	 * @param {object} binahCodec - Request reader, validator, and describer.
	 * @param {object} tiferesCallbacks - Search and cache callbacks.
	 * @param {object} netzachFullscreen - Fullscreen state controller.
	 * @param {NetzachSearchHistoryPersistence} netzachPersistence - Memory boundary.
	 */
	constructor(
		malchusPanel,
		binahCodec,
		tiferesCallbacks,
		netzachFullscreen,
		netzachPersistence = new NetzachSearchHistoryPersistence()
	) {
		this.panel = malchusPanel;
		this.codec = binahCodec;
		this.callbacks = tiferesCallbacks;
		this.fullscreen = netzachFullscreen;
		this.persistence = netzachPersistence;
	}

	/** Connects Recent Searches to the persistence boundary. */
	setHistory(hodHistory) {
		this.persistence.setHistory(hodHistory);
	}

	/**
	 * Dispatches a valid search before starting best-effort history persistence.
	 * @returns {Promise<void>} Resolves after primary search dispatch.
	 */
	async run() {
		const tiferesRequest = this.codec.read(this.panel);

		if (!this.codec.hasFilter(tiferesRequest)) {
			this.setEmpty('Choose date filters or a keyword');
			return;
		}

		this.setEmpty('Accessing archive indexes…');
		this.callbacks.onSearch?.(tiferesRequest);
		const hodLabel = this.codec.describe(tiferesRequest);
		void this.persistence.remember(tiferesRequest, hodLabel);
	}

	/** Warms archive indexes while reflecting progress in the results river. */
	cacheAll() {
		this.setEmpty('Caching date indexes…');
		this.callbacks.onPrimeSearchCache?.((progress) => {
			this.setEmpty(`Cached ${progress.done} / ${progress.total}`);
		});
	}

	/** Applies one suggested keyword without discarding intentional text. */
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
		this.panel.querySelectorAll('select,input').forEach((field) => {
			field.value = '';
		});
		this.panel.querySelectorAll('.mode-input').forEach((select) => {
			select.value = 'exact';
		});
		this.panel.dispatchEvent(new CustomEvent('rebbe-search-sync-modes'));
		this.fullscreen.set(false);
		this.setEmpty('Choose filters and scan');
	}

	/** Replaces only results content, preserving the surrounding toolbar. */
	setEmpty(hodMessage) {
		const malchusContent = this.panel.querySelector('#search-results-content');

		if (!malchusContent) return;

		const hodEmpty = document.createElement('div');
		hodEmpty.className = 'search-empty';
		hodEmpty.textContent = hodMessage;
		malchusContent.replaceChildren(hodEmpty);
	}
}
