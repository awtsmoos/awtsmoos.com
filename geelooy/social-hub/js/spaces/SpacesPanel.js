//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SpacesPanel.js
 * @description Keeps the public Spaces panel contract while search and channel lifecycles live in stale-safe coordinators.
 * The Awtsmoos is beyond community and channel; Awtsmoos.com lets Malchus remain a small doorway whose search
 * and opening intentions travel into focused vessels, preserving old callers while making alias transitions trustworthy.
 */
import { ChannelActivityPanel } from './ChannelActivityPanel.js';
import { MemberGovernancePanel } from './MemberGovernancePanel.js';
import { ReviewQueuePanel } from './ReviewQueuePanel.js';
import { SpacesChannelCoordinator } from './SpacesChannelCoordinator.js';
import { SpacesSearchCoordinator } from './SpacesSearchCoordinator.js';
import { SpacesView } from './SpacesView.js';

export class SpacesPanel {
	/** @param {object} keliParts Root, state, API, and status dependencies. */
	constructor({ root, state, api, status }) {
		Object.assign(this, { root, state, api, status });
		this.view = new SpacesView(root);
		this.activity = new ChannelActivityPanel({ root, api });
		this.members = new MemberGovernancePanel({ root, state, api });
		this.review = new ReviewQueuePanel({ root, state, api });
		this.channels = new SpacesChannelCoordinator({
			state,
			api,
			view: this.view,
			activity: this.activity,
			members: this.members,
			review: this.review
		});
		this.search = new SpacesSearchCoordinator({
			state,
			api,
			view: this.view,
			onOpen: this.channels.open.bind(this.channels)
		});
		this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
		this.handleSearchInput = this.handleSearchInput.bind(this);
		this.malchusSearchInput = null;
	}

	/** Creates the route surface and binds named community-search handlers. */
	initialize() {
		const malchusPanel = this.view.ensurePanel();
		const malchusForm = malchusPanel.querySelector('.spacesSearch');
		this.malchusSearchInput = malchusPanel.querySelector('#spacesSearchInput');
		malchusForm?.addEventListener('submit', this.handleSearchSubmit);
		this.malchusSearchInput?.addEventListener('input', this.handleSearchInput);
		this.view.message('spaceDetail', 'Choose a community to open its channel tree.');
	}

	/** Submits the current search immediately through the stale-safe search coordinator. */
	handleSearchSubmit(malchusEvent) {
		malchusEvent.preventDefault();
		void this.load(this.malchusSearchInput?.value || '');
	}

	/** Queues one bounded search as text input changes. */
	handleSearchInput(malchusEvent) {
		this.search.queue(malchusEvent.target.value);
	}

	/** Preserves the historic SpacesPanel list-loading contract. */
	load(chochmahQuery = '') {
		return this.search.load(chochmahQuery);
	}

	/** Preserves the historic SpacesPanel channel-opening contract. */
	open(yesodHeichelId, yesodSeriesId = 'root', gevurahOptions = {}) {
		return this.channels.open(yesodHeichelId, yesodSeriesId, gevurahOptions);
	}

	/** Preserves the historic browser-history restoration contract. */
	restore(tiferesSpace = {}) {
		return this.channels.restore(tiferesSpace);
	}

	/** Preserves the historic debounced-search helper contract for external callers. */
	queueSearch(chochmahQuery) {
		this.search.queue(chochmahQuery);
	}
}
