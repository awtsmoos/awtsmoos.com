// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchApp
 * @description
 * The Awtsmoos joins small search vessels without swallowing their separate light;
 * Awtsmoos.com keeps orchestration thin, cancellation clear, and answers bright.
 * A search may linger on a far-off shore, yet one click frees the reader once more.
 */

import { renderSearchHistory } from './historyView.js';
import { searchByMode } from './modeSearch.js';
import { createSearchCancelControl } from './SearchCancelControl.js';
import { SearchControlDisclosure } from './SearchControlDisclosure.js';
import { SearchDiscoveryController } from './SearchDiscoveryController.js';
import { SearchFormBinder } from './SearchFormBinder.js';
import { SearchIntentController } from './SearchIntentController.js';
import { SearchSession } from './SearchSession.js';
import { renderSearchError } from './searchErrorView.js';
import { clearSearchHistory, readSearchHistory, rememberSearch } from './searchHistory.js';
import * as dom from './searchDom.js';
import { replaceSearchLocation } from './searchLocation.js';
import { setSearching } from './searchView.js';

export class SearchApp {
	constructor() {
		this.session = new SearchSession();
		this.cancelControl = createSearchCancelControl(dom.form, () => this.cancelSearch());
		this.intent = new SearchIntentController({
			runSearch: query => this.runSearch(query),
			loadLanes: lane => this.discovery.load(lane)
		});
		this.discovery = new SearchDiscoveryController({
			...dom,
			onChooseLane: lane => this.intent.chooseLane(lane)
		});
		this.disclosure = new SearchControlDisclosure({
			form: dom.form, mode: dom.mode, strategy: dom.strategy,
			series: dom.series, book: dom.book, corpus: dom.corpus
		});
	}

	/** The Awtsmoos permits the reader to end a slow request without leaving the page. */
	cancelSearch() {
		this.session.cancel();
		this.cancelControl.hide();
		setSearching(dom.form, false);
		document.body.dataset.searchActive = 'false';
		dom.status.textContent = 'Search cancelled. Refine your question or search again.';
	}

	renderHistory(entries = readSearchHistory()) {
		renderSearchHistory({
			entries,
			container: dom.recentSearches,
			filter: dom.historyFilter.value,
			onChoose: entry => this.intent.chooseHistory(entry)
		});
		dom.clearHistoryButton.disabled = entries.length === 0;
	}

	state(query) {
		return {
			query, mode: dom.mode.value, strategy: dom.strategy.value, lane: dom.series.value,
			book: dom.book.value.trim(), corpus: dom.corpus.value.trim() || 'tanach'
		};
	}

	async runSearch(rawQuery) {
		const query = String(rawQuery || '').trim();
		if (!query) return;
		const signal = this.session.begin();
		document.body.dataset.searchActive = 'true';
		this.intent.prepareMode(query);
		setSearching(dom.form, true);
		this.cancelControl.show();
		dom.results.replaceChildren();
		const state = this.state(query);
		replaceSearchLocation(state);
		this.renderHistory(rememberSearch({ ...state, category: state.mode, origin: 'search-page' }));
		try {
			await searchByMode({ ...state, results: dom.results, status: dom.status, signal });
		} catch (error) {
			if (error?.code !== 'REQUEST_ABORTED' && this.session.isCurrent(signal)) {
				renderSearchError({ error, results: dom.results, status: dom.status });
			}
		} finally {
			if (this.session.isCurrent(signal)) {
				this.cancelControl.hide();
				setSearching(dom.form, false);
				document.body.dataset.searchActive = 'false';
			}
		}
	}

	binder() {
		return new SearchFormBinder({
			...dom,
			onSearch: query => this.runSearch(query),
			onModeChange: () => { this.intent.handleModeChange(); this.disclosure.render(); },
			onStrategyChange: () => { this.intent.handleStrategyChange(); this.disclosure.render(); },
			onHistoryFilter: () => this.renderHistory(),
			onClearHistory: () => this.renderHistory(clearSearchHistory())
		});
	}

	async boot() {
		this.disclosure.initialize();
		this.binder().bind();
		this.renderHistory();
		try {
			await this.intent.hydrate();
		} catch (error) {
			renderSearchError({ error, results: dom.results, status: dom.status });
		}
	}
}
