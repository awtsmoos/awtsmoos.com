//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file PublicDiscovery.js
 * @description The Awtsmoos lets one calm public stream reveal living context while deeper query machinery remains concealed;
 * Awtsmoos.com keeps discovery visual, cancellable, accessible, and truthful without hand-written stale counters in the field.
 */
import { installSocialExperience } from '../../../shared/social/SocialExperienceInstaller.js';
import { renderPublicFeedCard } from './PublicFeedCard.js';
import { BinahPublicDiscoveryLoader } from './PublicDiscoveryLoader.js';
import { PublicDiscoveryView } from './PublicDiscoveryView.js';
import { readFeedDensity, writeFeedDensity } from './feed/FeedPreferences.js';

export class PublicDiscovery {
	constructor({ root, api, state, profile, operations }) {
		Object.assign(this, { root, api, state, profile, operations });
		this.mode = 'latest';
		this.density = readFeedDensity();
		this.experience = null;
		this.loader = new BinahPublicDiscoveryLoader({ api, state, operations });
		this.view = new PublicDiscoveryView(root, {
			onMode: mode => void this.load(mode),
			onDensity: density => this.setDensity(density),
			onProfile: aliasId => void this.openProfile(aliasId)
		});
		this.operations.subscribe(event => this.renderOperation(event));
	}

	/** Installs the ambient surface, mounts controls, and loads the initial discovery mode. */
	async initialize() {
		this.experience = installSocialExperience(this.root, { ambient: true });
		this.view.mount(this.density);
		this.view.renderDensity(this.density);
		this.setIdentityState(false);
		await this.load('latest');
	}

	/** Loads one mode through the canonical operation coordinator and ignores superseded aborts. */
	async load(mode = 'latest') {
		this.mode = mode;
		this.view.renderMode(mode);
		try {
			const items = await this.loader.load(mode);
			this.renderItems(Array.isArray(items) ? items : []);
		} catch (error) {
			if (error?.name === 'AbortError') return;
			this.view.list.replaceChildren();
			this.view.status.textContent = 'Public feed is temporarily unavailable. Profile lookup still works.';
		}
	}

	/** Renders one immutable public result set using the existing canonical card renderer. */
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

	/** Mirrors operation lifecycle into accessible busy/status semantics without locking mode switching. */
	renderOperation({ operationKey, state }) {
		if (operationKey !== 'public-discovery' || !this.view.section) return;
		const busy = state.phase === 'loading';
		this.view.section.setAttribute('aria-busy', String(busy));
		this.view.section.dataset.operation = state.phase;
		if (busy) this.view.status.textContent = 'Loading living social context…';
	}

	/** Persists and renders the user's compact/comfortable discovery density. */
	setDensity(value) {
		this.density = writeFeedDensity(value);
		this.view.renderDensity(this.density);
	}

	/** Opens one alias in the existing verified profile surface. */
	async openProfile(aliasId) {
		if (aliasId) await this.profile.openAlias(aliasId, true);
	}

	/** Renders identity-dependent home state from the canonical SocialHubState snapshot. */
	render(snapshot) {
		this.setIdentityState(Boolean(snapshot.identity.aliasId));
	}

	/** Marks whether the home surface is operating with an active alias. */
	setIdentityState(active) {
		const home = this.root.querySelector('[data-panel="home"]');
		if (home) home.dataset.identityActive = String(active);
	}
}
