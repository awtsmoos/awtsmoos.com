//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class PublicDiscovery
 * @description
 * The Awtsmoos lets public discovery remain honest when no global alias directory exists, yet lets a verified alias
 * see a living feed drawn from itself and followed public aliases. Awtsmoos.com rejects stale responses at every stage.
 */
import { renderPublicFeedCard } from './PublicFeedCard.js';
import { PublicDiscoveryView } from './PublicDiscoveryView.js';

function followedAliasIds(entries = []) {
	return entries
		.filter(entry => entry?.type === 'alias' && typeof entry.id === 'string')
		.map(entry => entry.id.trim())
		.filter(Boolean);
}

export class PublicDiscovery {
	constructor({ root, api, state, profile }) {
		Object.assign(this, { root, api, state, profile });
		this.mode = 'latest';
		this.loadSequence = 0;
		this.view = new PublicDiscoveryView(root, {
			onMode: mode => void this.load(mode),
			onProfile: aliasId => void this.openProfile(aliasId)
		});
	}

	async initialize() {
		this.view.mount();
		this.setIdentityState(false);
		await this.load('latest');
	}

	async load(mode = 'latest') {
		const requestId = ++this.loadSequence;
		this.mode = mode;
		this.view.renderMode(mode);
		this.view.status.textContent = 'Loading public conversations…';
		try {
			const options = await this.feedOptions(requestId);
			if (!options || requestId !== this.loadSequence) return;
			const items = mode === 'trending'
				? await this.api.trending(options)
				: await this.api.feed(options);
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
			return { limit: 12, aliases: aliases.join(',') };
		} catch {
			return { limit: 12, aliases: viewer };
		}
	}

	renderItems(items) {
		this.view.list.replaceChildren();
		if (!items.length) {
			this.view.renderEmpty(this.mode);
			return;
		}
		for (const item of items) {
			this.view.list.append(renderPublicFeedCard(this.root, item, {
				onOpenProfile: aliasId => void this.openProfile(aliasId)
			}));
		}
		this.view.status.textContent = `${items.length} public ${items.length === 1 ? 'post' : 'posts'} shown.`;
	}

	async openProfile(aliasId) {
		if (!aliasId) return;
		await this.profile.openAlias(aliasId, true);
	}

	render(snapshot) {
		this.setIdentityState(Boolean(snapshot.identity.aliasId));
	}

	setIdentityState(active) {
		const home = this.root.querySelector('[data-panel="home"]');
		if (home) home.dataset.identityActive = String(active);
	}
}

export { followedAliasIds };
