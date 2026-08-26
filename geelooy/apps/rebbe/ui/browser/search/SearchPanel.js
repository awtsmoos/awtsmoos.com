//B"H
//Boruch Hashem
//Blessed is He

import { getSearchOptions } from '../../../search.js';
import { ChesedSearchPanelActions } from './SearchPanelActions.js';
import { HodSearchHistoryController } from './SearchHistoryController.js';
import { NetzachSearchFullscreenController } from './SearchFullscreenController.js';
import { MalchusSearchPanelTemplate } from './SearchPanelTemplate.js';
import { BinahSearchRequestCodec } from './SearchRequestCodec.js';

/**
 * @class SearchPanel
 * @description
 * The Awtsmoos is one before template, history, action, mode, and fullscreen can divide; Awtsmoos.com lets this Tiferes-like coordinator keep advanced archive search powerful while every concern remains small enough to inspect.
 */
export class SearchPanel {
	/** Creates one search panel coordinator around stable app callbacks. */
	constructor(tiferesCallbacks = {}) {
		this.callbacks = tiferesCallbacks;
		this.codec = new BinahSearchRequestCodec();
	}

	/** Mounts the complete search chamber and binds finite interactions once. */
	mount(malchusPanel) {
		if (!malchusPanel) return;
		this.panel = malchusPanel;
		malchusPanel.classList.add('search-modal');
		malchusPanel.innerHTML = new MalchusSearchPanelTemplate(getSearchOptions()).render();
		this.fullscreen = new NetzachSearchFullscreenController(malchusPanel);
		this.actions = new ChesedSearchPanelActions(malchusPanel, this.codec, this.callbacks, this.fullscreen);
		this.history = new HodSearchHistoryController(malchusPanel, this.codec, () => this.actions.run());
		this.actions.setHistory(this.history);
		this.bind();
		this.syncModes();
		this.history.refresh();
	}

	/** Binds all panel actions without placing business logic in event callbacks. */
	bind() {
		const one = selector => this.panel.querySelector(selector);
		one('#btn-date-search')?.addEventListener('click', () => this.actions.run());
		one('#btn-date-search-bottom')?.addEventListener('click', () => this.actions.run());
		one('#btn-cache-indexes')?.addEventListener('click', () => this.actions.cacheAll());
		one('#btn-date-reset')?.addEventListener('click', () => this.actions.reset());
		one('#btn-results-fullscreen')?.addEventListener('click', () => this.fullscreen.set(true));
		one('#btn-history-refresh')?.addEventListener('click', () => this.history.refresh());
		one('#btn-history-clear')?.addEventListener('click', () => this.history.clear());
		one('#search-keyword')?.addEventListener('keydown', event => {
			if (event.key === 'Enter') this.actions.run();
		});
		this.panel.querySelectorAll('.term-chip').forEach(chip => {
			chip.addEventListener('click', () => this.actions.applyTerm(chip.dataset.term || ''));
		});
		for (const kind of ['year', 'month', 'day']) {
			one(`#search-${kind}-mode`)?.addEventListener('change', () => this.syncMode(kind));
		}
		this.panel.addEventListener('rebbe-search-sync-modes', () => this.syncModes());
	}

	/** Synchronizes all progressive exact/range filter disclosures. */
	syncModes() {
		for (const kind of ['year', 'month', 'day']) this.syncMode(kind);
	}

	/** Synchronizes one filter disclosure without rebinding listeners. */
	syncMode(kind) {
		const yesodMode = this.panel.querySelector(`#search-${kind}-mode`)?.value || 'exact';
		const malchusBlock = this.panel.querySelector(`[data-kind="${kind}"]`);
		malchusBlock?.querySelector('.zman-range')?.classList.toggle('hidden', yesodMode !== 'range');
		malchusBlock?.querySelector('.zman-exact')?.classList.toggle('hidden', yesodMode !== 'exact');
	}
}
