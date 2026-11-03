// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicDiscovery
 * @description
 * The Awtsmoos gives each new selection its own bright place in the day;
 * Awtsmoos.com refuses to let an older feed repaint the newer way.
 * The latest question is the living one, whose returned words deserve the sun.
 */

import { installSocialExperience } from '../../../shared/social/SocialExperienceInstaller.js';
import { renderPublicFeedCard } from './PublicFeedCard.js';
import { BinahPublicDiscoveryLoader } from './PublicDiscoveryLoader.js';
import { PublicDiscoveryView } from './PublicDiscoveryView.js';
import { createLatestDiscoveryRequest } from './LatestDiscoveryRequest.js';
import { readFeedDensity, writeFeedDensity } from './feed/FeedPreferences.js';

export class PublicDiscovery {
	/** Creates the public feed with guarded asynchronous request generations. */
	constructor({ root, api, state, profile, operations }) {
		Object.assign(this, { root, api, state, profile, operations });
		this.mode = 'latest';
		this.density = readFeedDensity();
		this.experience = null;
		this.latestRequest = createLatestDiscoveryRequest();
		this.loader = new BinahPublicDiscoveryLoader({ api, state, operations });
		this.view = new PublicDiscoveryView(root, {
			onMode: mode => void this.load(mode),
			onDensity: density => this.setDensity(density),
			onProfile: aliasId => void this.openProfile(aliasId)
		});
		this.operations.subscribe(event => this.renderOperation(event));
	}

	/** Installs the public surface and loads the current default mode. */
	async initialize() {
		this.experience = installSocialExperience(this.root, { ambient: true });
		this.view.mount(this.density);
		this.view.renderDensity(this.density);
		this.setIdentityState(false);
		await this.load('latest');
	}

	/**
	 * Loads only the latest chosen mode; stale results cannot replace a newer feed.
	 * @param {string} mode - Latest, trending, questions, or answers.
	 * @returns {Promise<void>} Completion of the request when still current.
	 */
	async load(mode = 'latest') {
		const requestNumber = this.latestRequest.start();
		this.mode = mode;
		this.view.renderMode(mode);
		try {
			const items = await this.loader.load(mode);
			if (!this.latestRequest.isCurrent(requestNumber)) return;
			this.renderItems(Array.isArray(items) ? items : []);
		} catch (error) {
			if (!this.latestRequest.isCurrent(requestNumber) || error?.name === 'AbortError') return;
			this.view.list.replaceChildren();
			this.view.status.textContent = 'Public feed is temporarily unavailable. Try another mode or open a public profile.';
		}
	}

	/** Renders the verified current public results with existing feed cards. */
	renderItems(items) {
		this.view.list.replaceChildren();
		this.view.renderDensity(this.density);
		if (!items.length) return this.view.renderEmpty(this.mode);
		const viewerAliasId = this.state.snapshot().identity.aliasId || '';
		for (const item of items) {
			this.view.list.append(renderPublicFeedCard(this.root, item, {
				onOpenProfile: aliasId => void this.openProfile(aliasId), viewerAliasId
			}));
		}
		const noun = this.mode === 'questions' ? 'questions' : this.mode === 'answers' ? 'answers' : 'posts';
		this.view.status.textContent = `${items.length} public ${noun} shown.`;
	}

	/** Mirrors operation lifecycle into accessibility status without locking mode changes. */
	renderOperation({ operationKey, state }) {
		if (operationKey !== 'public-discovery' || !this.view.section) return;
		const busy = state.phase === 'loading';
		this.view.section.setAttribute('aria-busy', String(busy));
		this.view.section.dataset.operation = state.phase;
		if (busy) this.view.status.textContent = 'Loading living social context…';
	}

	/** Stores compact or comfortable feed density, then updates the view. */
	setDensity(value) {
		this.density = writeFeedDensity(value);
		this.view.renderDensity(this.density);
	}

	/** Opens a selected public alias without requiring a private account. */
	async openProfile(aliasId) {
		if (aliasId) await this.profile.openAlias(aliasId, true);
	}

	/** Mirrors the current canonical identity snapshot to the home surface. */
	render(snapshot) {
		this.setIdentityState(Boolean(snapshot.identity.aliasId));
	}

	/** Marks whether an active alias is currently verified. */
	setIdentityState(active) {
		const home = this.root.querySelector('[data-panel="home"]');
		if (home) home.dataset.identityActive = String(active);
	}
}
