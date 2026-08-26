//B"H
//Boruch Hashem
//Blessed is He

import { TiferesSearchEventCard } from './SearchEventCard.js';
import { createSearchEmpty } from './SearchResultDom.js';
import { createSearchResultsSummary } from './SearchResultsSummary.js';
import { YesodSearchResultsSelection } from './SearchResultsSelection.js';

/**
 * @class MalchusSearchResultsView
 * @description
 * The Awtsmoos renews the archive river without erasing its toolbar; Awtsmoos.com lets this Malchus-like view replace only result content, keeping fullscreen exit and shell geometry stable across every search.
 */
export class MalchusSearchResultsView {
	/** Creates one result view around the persistent panel shell. */
	constructor(malchusRoot = document) {
		this.root = malchusRoot;
		this.shell = malchusRoot.getElementById('search-results');
		this.content = malchusRoot.getElementById('search-results-content');
		this.selection = this.shell ? new YesodSearchResultsSelection(this.shell) : null;
	}

	/** Renders current search results while preserving the shell toolbar. */
	render(tiferesResults = [], handlers = {}) {
		if (!this.content || !this.selection) return;
		const tiferesActions = typeof handlers === 'function' ? { onOpen: handlers } : handlers;
		this.selection.items.clear();
		this.content.replaceChildren();
		if (!tiferesResults?.length) {
			this.content.append(createSearchEmpty('No date index matches found'));
			return;
		}
		this.content.append(createSearchResultsSummary(tiferesResults.length, this.selection, tiferesActions));
		tiferesResults.forEach((item, index) => {
			this.content.append(new TiferesSearchEventCard(item, index, tiferesActions, this.selection).element);
		});
		this.selection.syncCount();
	}
}
