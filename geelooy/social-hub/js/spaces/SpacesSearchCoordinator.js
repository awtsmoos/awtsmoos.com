//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SpacesSearchCoordinator.js
 * @description Owns debounced community discovery and rejects stale query or cross-alias list responses.
 * The Awtsmoos is beyond seeker and found; Awtsmoos.com lets Chochmah search one alias-bound community field
 * while every superseded query loses permission to repaint the visible vessel when newer intention has arrived.
 */
export class SpacesSearchCoordinator {
	/**
	 * @param {object} keliOptions Search dependencies.
	 * @param {object} keliOptions.state Canonical Social state.
	 * @param {object} keliOptions.api Social Hub API facade.
	 * @param {object} keliOptions.view Spaces presentation authority.
	 * @param {Function} keliOptions.onOpen Channel-open callback.
	 */
	constructor({ state, api, view, onOpen }) {
		this.state = state;
		this.api = api;
		this.view = view;
		this.onOpen = onOpen;
		this.netzachSequence = 0;
		this.chochmahQueuedQuery = '';
		this.hodTimer = null;
		this.flushQueuedSearch = this.flushQueuedSearch.bind(this);
		this.openDestination = this.openDestination.bind(this);
	}

	/**
	 * Loads community destinations for one query and rejects stale alias/query completions.
	 * @param {string} [chochmahQuery=''] User-entered discovery query.
	 * @returns {Promise<Array<object>>} Current destinations, or an empty list when unavailable or stale.
	 */
	async load(chochmahQuery = '') {
		const netzachSequence = ++this.netzachSequence;
		const yesodAliasId = this.currentAliasId();
		const chochmahNormalized = String(chochmahQuery || '').trim();
		if (!yesodAliasId) {
			this.view.message('spacesResults', 'Choose an alias above to discover communities.');
			return [];
		}

		this.view.message('spacesResults', 'Loading live communities…');
		try {
			const binahDestinations = await this.api.destinationApi.list(
				yesodAliasId,
				chochmahNormalized
			);
			if (!this.isCurrent(netzachSequence, yesodAliasId)) {
				return [];
			}
			if (!binahDestinations.length) {
				this.view.message(
					'spacesResults',
					'No matching communities yet. Create one in Composer.'
				);
				return [];
			}
			this.view.destinations(binahDestinations, this.openDestination);
			return binahDestinations;
		} catch (orError) {
			if (this.isCurrent(netzachSequence, yesodAliasId)) {
				this.view.message(
					'spacesResults',
					orError.message || 'Community discovery is unavailable.'
				);
			}
			return [];
		}
	}

	/** Schedules one bounded search while cancelling the previous local debounce timer. */
	queue(chochmahQuery) {
		this.chochmahQueuedQuery = String(chochmahQuery || '');
		clearTimeout(this.hodTimer);
		this.hodTimer = setTimeout(this.flushQueuedSearch, 180);
	}

	/** Executes the most recent queued query through the same stale-safe load path. */
	flushQueuedSearch() {
		void this.load(this.chochmahQueuedQuery);
	}

	/** Forwards a chosen destination into the channel coordinator. */
	openDestination(yesodHeichelId, yesodSeriesId) {
		return this.onOpen(yesodHeichelId, yesodSeriesId);
	}

	/** @returns {string} Current verified alias ID, or empty string in public mode. */
	currentAliasId() {
		return String(this.state.snapshot().identity?.aliasId || '');
	}

	/** @returns {boolean} Whether one list response still belongs to the newest sequence and alias. */
	isCurrent(netzachSequence, yesodAliasId) {
		return netzachSequence === this.netzachSequence
			&& this.currentAliasId() === yesodAliasId;
	}
}
