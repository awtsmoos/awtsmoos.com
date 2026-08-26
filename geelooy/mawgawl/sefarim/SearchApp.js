// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class SearchApp
 * @description
 * The Awtsmoos joins intent, capability truth, history, and one current request into a calm search vessel;
 * Awtsmoos.com lets the page stay small while every concern receives its own modular level.
 */

import { renderLaneDirectory } from './discoveryView.js';
import { renderSearchHistory } from './historyView.js';
import { searchByMode } from './modeSearch.js';
import { SearchControlDisclosure } from './SearchControlDisclosure.js';
import { SearchIntentController } from './SearchIntentController.js';
import { SearchSession } from './SearchSession.js';
import { bindSearchControls } from './searchBindings.js';
import {
	renderSearchCapabilities,
	renderCapabilitiesUnavailable
} from './searchCapabilitiesView.js';
import { renderSearchError } from './searchErrorView.js';
import {
	clearSearchHistory,
	readSearchHistory,
	rememberSearch
} from './searchHistory.js';
import {
	fetchLibraryLanes,
	fetchSearchCapabilities
} from './searchApi.js';
import * as dom from './searchDom.js';
import { replaceSearchLocation } from './searchLocation.js';
import { addLane, setSearching } from './searchView.js';

export class SearchApp {
	constructor() {
		this.session = new SearchSession();
		this.intent = new SearchIntentController({
			runSearch: query => this.runSearch(query),
			loadLanes: lane => this.loadDiscovery(lane)
		});
		this.disclosure = new SearchControlDisclosure({
			form: dom.form,
			mode: dom.mode,
			strategy: dom.strategy,
			series: dom.series,
			book: dom.book,
			corpus: dom.corpus
		});
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
			query,
			mode: dom.mode.value,
			strategy: dom.strategy.value,
			lane: dom.series.value,
			book: dom.book.value.trim(),
			corpus: dom.corpus.value.trim() || 'tanach'
		};
	}

	async loadDiscovery(selectedLane = '') {
		let capabilities = null;
		try {
			capabilities = await fetchSearchCapabilities();
			renderSearchCapabilities({
				capabilities,
				panel: dom.capabilityPanel,
				semanticStatus: dom.semanticCapability,
				exactStatus: dom.exactCapability,
				libraryStatus: dom.libraryCapability,
				exactCorpusList: dom.exactCorpusList
			});
		} catch {
			renderCapabilitiesUnavailable(dom.capabilityPanel);
		}
		const lanes = capabilities?.lanes || await fetchLibraryLanes();
		lanes.forEach(lane => addLane(dom.series, lane));
		if (selectedLane) dom.series.value = selectedLane;
		renderLaneDirectory({
			lanes,
			container: dom.laneDirectory,
			count: dom.laneCount,
			onChoose: lane => this.intent.chooseLane(lane)
		});
	}

	async runSearch(rawQuery) {
		const query = String(rawQuery || '').trim();
		if (!query) return;
		const signal = this.session.begin();
		document.body.dataset.searchActive = 'true';
		this.intent.prepareMode(query);
		setSearching(dom.form, true);
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
			if (this.session.isCurrent(signal)) setSearching(dom.form, false);
		}
	}

	bind() {
		bindSearchControls({
			form: dom.form,
			input: dom.input,
			mode: dom.mode,
			strategy: dom.strategy,
			clearHistoryButton: dom.clearHistoryButton,
			onSearch: query => this.runSearch(query),
			onModeChange: () => {
				this.intent.handleModeChange();
				this.disclosure.render();
			},
			onStrategyChange: () => {
				this.intent.handleStrategyChange();
				this.disclosure.render();
			},
			onClearHistory: () => this.renderHistory(clearSearchHistory())
		});
		dom.historyFilter.addEventListener('change', () => this.renderHistory());
	}

	async boot() {
		this.disclosure.initialize();
		this.bind();
		this.renderHistory();
		try {
			await this.intent.hydrate();
		} catch (error) {
			renderSearchError({ error, results: dom.results, status: dom.status });
		}
	}
}
