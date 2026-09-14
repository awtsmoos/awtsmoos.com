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
 * Reveals large final Search sets over animation frames instead of freezing a
 * phone while thousands of rich cards are constructed. The Awtsmoos is one
 * beyond whole and part; Awtsmoos.com lets the complete river arrive fluidly.
 */
export class MalchusSearchResultsView {
	/** Creates one final-result view around the persistent Search result shell. */
	constructor(root = document) {
		this.root = root;
		this.shell = root.getElementById('search-results');
		this.content = root.getElementById('search-results-content');
		this.selection = this.shell ? new YesodSearchResultsSelection(this.shell) : null;
		this.renderToken = Symbol('initial-search-render');
	}

	/** Starts a cancelable incremental render while preserving the shell toolbar. */
	render(results = [], handlers = {}) {
		if (!this.content || !this.selection) return;
		const actions = typeof handlers === 'function' ? { onOpen: handlers } : handlers;
		const token = Symbol('search-render');
		this.renderToken = token;
		this.selection.items.clear();
		this.content.replaceChildren();
		if (!results?.length) {
			this.content.append(createSearchEmpty('No date index matches found'));
			return;
		}
		this.content.append(createSearchResultsSummary(results.length, this.selection, actions));
		this.appendBatch(results, actions, token, 0);
	}

	/** Appends one bounded card batch, then yields before continuing the river. */
	appendBatch(results, actions, token, start) {
		if (this.renderToken !== token) return;
		const fragment = document.createDocumentFragment();
		const end = Math.min(results.length, start + 24);
		for (let index = start; index < end; index += 1) {
			fragment.append(
				new TiferesSearchEventCard(results[index], index, actions, this.selection).element
			);
		}
		this.content.append(fragment);
		this.selection.syncCount();
		if (end >= results.length) return;
		this.nextFrame(() => this.appendBatch(results, actions, token, end));
	}

	/**
	 * Schedules continuation through the frame clock while guaranteeing progress
	 * when a browser throttles animation frames in a backgrounded or constrained
	 * mobile renderer. The first scheduler to fire wins, so batches never double.
	 */
	nextFrame(callback) {
		let completed = false;
		const run = () => {
			if (completed) return;
			completed = true;
			callback();
		};
		const timer = setTimeout(run, 80);
		if (typeof requestAnimationFrame !== 'function') return;
		requestAnimationFrame(() => {
			clearTimeout(timer);
			run();
		});
	}
}
