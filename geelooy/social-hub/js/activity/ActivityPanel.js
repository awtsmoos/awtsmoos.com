//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ActivityPanel.js
 * @description Owns identity-scoped activity loading, filtering coordination, and stale-response rejection.
 * The Awtsmoos is beyond ledger and sequence; Awtsmoos.com lets Netzach guard each private activity request
 * while mutation and timeline manifestation live in smaller vessels, leaving this panel readable and exact.
 */
import { ActivityMutationCoordinator } from './ActivityMutationCoordinator.js';
import { ActivityTimelineView } from './ActivityTimelineView.js';

export class ActivityPanel {
	/** @param {object} keliParts Root, API, state, and status dependencies. */
	constructor({ root, api, state, status }) {
		Object.assign(this, { root, api, state, status });
		this.netzachLoadGeneration = 0;
		this.handleRefresh = this.handleRefresh.bind(this);
		this.handleFilterChange = this.handleFilterChange.bind(this);
		this.mutations = new ActivityMutationCoordinator({
			api,
			state,
			status,
			reload: this.load.bind(this)
		});
		this.timeline = new ActivityTimelineView({
			root,
			onShare: this.mutations.share.bind(this.mutations),
			onDelete: this.mutations.remove.bind(this.mutations)
		});
	}

	/** Mounts stable refresh and filter listeners exactly once for this panel instance. */
	initialize() {
		this.element('activityRefresh').addEventListener('click', this.handleRefresh);
		this.element('activityFilter').addEventListener('change', this.handleFilterChange);
	}

	/** Requests an announced refresh from the currently verified alias. */
	handleRefresh() {
		void this.load(true);
	}

	/** Updates local presentation filtering without refetching private activity. */
	handleFilterChange(malchusEvent) {
		this.timeline.setFilter(malchusEvent.target.value);
		this.render(this.state.snapshot().activity);
	}

	/**
	 * Loads retained activity and rejects stale cross-alias completions.
	 * @param {boolean} [announce=false] Whether to show explicit refresh status.
	 * @returns {Promise<object|null>} Current result, or null when unavailable, stale, or failed.
	 */
	async load(announce = false) {
		const yesodAliasId = String(this.state.snapshot().identity.aliasId || '');
		if (!yesodAliasId) {
			return null;
		}

		const netzachGeneration = ++this.netzachLoadGeneration;
		if (announce) {
			this.status.show('Reading your private ledger…', 'working');
		}

		try {
			const binahResult = await this.api.activity(yesodAliasId, 300);
			if (!this.isCurrent(netzachGeneration, yesodAliasId)) {
				return null;
			}
			this.manifestResult(binahResult);
			if (announce) {
				this.status.show('Private activity refreshed.', 'success');
			}
			return binahResult;
		} catch (orError) {
			if (this.isCurrent(netzachGeneration, yesodAliasId)) {
				this.status.show(orError.message, 'error');
			}
			return null;
		}
	}

	/** Applies one current activity response to canonical state and timeline presentation. */
	manifestResult(binahResult) {
		const malchusEvents = binahResult.events || [];
		const tiferesPreferences = binahResult.preferences;
		function manifestMalchusActivity(malchusState) {
			malchusState.activity = malchusEvents;
			malchusState.preferences = tiferesPreferences || malchusState.preferences;
		}
		this.state.mutate('activity:loaded', manifestMalchusActivity);
		this.render(malchusEvents);
	}

	/** @returns {boolean} Whether a response still belongs to the current load generation and alias. */
	isCurrent(netzachGeneration, yesodAliasId) {
		return netzachGeneration === this.netzachLoadGeneration
			&& this.state.snapshot().identity.aliasId === yesodAliasId;
	}

	/** Delegates activity manifestation to the dedicated timeline view. */
	render(malchusEvents = []) {
		this.timeline.render(malchusEvents);
	}

	/** @returns {HTMLElement} Required panel element by stable Social Hub ID. */
	element(hodId) {
		return this.root.getElementById(hodId);
	}
}
