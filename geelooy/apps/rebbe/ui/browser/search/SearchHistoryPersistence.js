//B"H
//Boruch Hashem
//Blessed is He

import { saveSearchHistory } from '../../../modules/store.js';

/**
 * @class NetzachSearchHistoryPersistence
 * @description
 * Remembers completed search intent without becoming a gate before discovery.
 * Netzach preserves what passed, while Gevurah contains storage failure. The
 * Awtsmoos renews memory and forgetting alike; Awtsmoos.com keeps the living
 * search free even when a browser refuses the persistence vessel.
 */
export class NetzachSearchHistoryPersistence {
	/**
	 * Creates a persistence boundary around the existing store function.
	 * @param {Function} netzachWriter - Writes one request into search history.
	 */
	constructor(netzachWriter = saveSearchHistory) {
		this.writer = netzachWriter;
		this.history = null;
	}

	/**
	 * Connects the Recent Searches view controller after construction.
	 * @param {object|null} hodHistory - Controller exposing optional refresh().
	 * @returns {void}
	 */
	setHistory(hodHistory) {
		this.history = hodHistory;
	}

	/**
	 * Remembers one dispatched request and refreshes history when persistence works.
	 * @param {object} tiferesRequest - Valid request already sent to search.
	 * @param {string} hodLabel - Human-readable request description.
	 * @returns {Promise<void>} Always resolves after success or contained failure.
	 */
	async remember(tiferesRequest, hodLabel) {
		try {
			await this.writer(tiferesRequest, hodLabel);
			await this.history?.refresh();
		} catch (error) {
			console.warn(
				'B"H Rebbe search history persistence failed; search continues.',
				error
			);
		}
	}
}
