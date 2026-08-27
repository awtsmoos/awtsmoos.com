//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PublicDiscovery
 * @description The Awtsmoos keeps one discovery stream while Awtsmoos.com makes its surface clean and its depth available;
 * modes stay truthful, density stays retractable, stale responses stay rejected, and one ambient experience serves the whole page.
 */
import { installSocialExperience } from '../../../shared/social/SocialExperienceInstaller.js';
import { renderPublicFeedCard } from './PublicFeedCard.js';
import { PublicDiscoveryView } from './PublicDiscoveryView.js';
import { readFeedDensity, writeFeedDensity } from './feed/FeedPreferences.js';

function followedAliasIds(entries = []) {
	return entries.filter(entry => entry?.type === 'alias' && typeof entry.id === 'string')
		.map(entry => entry.id.trim())
		.filter(Boolean);
}

function modeOptions(mode) {
	if (mode === 'questions') return { contentKind: 'question' };
	if (mode === 'answers') return { contentKind: 'answer' };
	return {};
}

export class PublicDiscovery {
	constructor({ root, api, state, profile }) {
		Object.assign(this, { root, api, state, profile });
		this.mode = 'latest';
		this.density = readFeedDensity();
		this.loadSequence = 0;
		this.experience = null;
		this.view = new PublicDiscoveryView(root, {
			onMode: mode => void this.load(mode),
			onDensity: density => this.setDensity(density),
			onProfile: aliasId => void this.openProfile(aliasId)
		});
	}

	async initialize() {
		this.experience = installSocialExperience(this.root, { ambient: true });
		this.view.mount(this.density);
		this.view.renderDensity(this.density);
		this.setIdentityState(false);
		await this.load('latest');
	}

	async load(mode = 'latest') {
		const requestId = ++this.loadSequence;
		this.mode = mode;
		this.view.renderMode(mode);
		this.view.status.textContent = 'Loading living social context…';
		try {
			const options = await this.feedOptions(requestId);
			if (!options || requestId !== this.loadSequence) return;
			const request = { ...options, ...modeOptions(mode) };
			const items = mode === 'trending' ? await this.api.trending(request) : await this.api.feed(request);
			if (requestId !== this.loadSequence) return;
			this.renderItems(Array.isArray(items) ? items : []);
		} catch {
			if (requestId !== this.loadSequence) return;
			this.view.list.replaceChildren();
			this.view.status.textContent = 'Public feed is temporarily unavailable. Profile lookup still works.';
		}
	}

	async feedOptions(requestId) {
		const viewer = this.state.snapshot().identity.aliasId;
		if (!viewer) return { limit: 12 };
		try {
			const entries = await this.api.following(viewer, { limit: 100 });
			if (requestId !== this.loadSequence) return null;
			const aliases = [...new Set([viewer, ...followedAliasIds(entries)])];
			return { limit: 12, aliases: aliases.join(','), viewerAliasId: viewer };
		} catch {
			return { limit: 12, aliases: viewer, viewerAliasId: viewer };
		}
	}

	renderItems(items) {
		this.view.list.replaceChildren();
		this.view.renderDensity(this.density);
		if (!items.length) return this.view.renderEmpty(this.mode);
		const viewerAliasId = this.state.snapshot().identity.aliasId || '';
		for (const item of items) {
			this.view.list.append(renderPublicFeedCard(this.root, item, {
				onOpenProfile: aliasId => void this.openProfile(aliasId),
				viewerAliasId
			}));
		}
		const noun = this.mode === 'questions' ? 'questions' : this.mode === 'answers' ? 'answers' : 'posts';
		this.view.status.textContent = `${items.length} public ${noun} shown.`;
	}

	setDensity(value) {
		this.density = writeFeedDensity(value);
		this.view.renderDensity(this.density);
	}

	async openProfile(aliasId) {
		if (aliasId) await this.profile.openAlias(aliasId, true);
	}

	render(snapshot) {
		this.setIdentityState(Boolean(snapshot.identity.aliasId));
	}

	setIdentityState(active) {
		const home = this.root.querySelector('[data-panel="home"]');
		if (home) home.dataset.identityActive = String(active);
	}
}

export { followedAliasIds, modeOptions };
