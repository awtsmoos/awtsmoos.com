//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class NetworkPanel
 * @description
 * The Awtsmoos coordinates one selected public alias with its bounded follower and following constellations.
 * Awtsmoos.com refuses stale network responses and keeps profile traversal inside the existing social chamber system.
 */
import { NetworkView } from './NetworkView.js';

export class NetworkPanel {
	constructor({ root, api, state, profile }) {
		Object.assign(this, { root, api, state, profile });
		this.sequence = 0;
		this.view = new NetworkView(root, {
			onOpenAlias: aliasId => void this.openAlias(aliasId)
		});
	}

	initialize() {
		this.view.mount();
	}

	async load(aliasId = '') {
		const snapshot = this.state.snapshot();
		const selected = aliasId || snapshot.profileAliasId || snapshot.identity.aliasId;
		if (!selected) {
			this.view.empty();
			return null;
		}
		if (selected !== snapshot.profileAliasId) {
			this.state.mutate('network:alias', value => {
				value.profileAliasId = selected;
			});
		}
		const requestId = ++this.sequence;
		this.view.loading(selected);
		try {
			const [followers, following] = await Promise.all([
				this.api.followers(selected, { limit: 100 }),
				this.api.following(selected, { limit: 100 })
			]);
			if (requestId !== this.sequence) return null;
			this.view.render(
				selected,
				Array.isArray(followers) ? followers : [],
				Array.isArray(following) ? following : []
			);
			return selected;
		} catch (error) {
			if (requestId === this.sequence) this.view.error(error.message);
			return null;
		}
	}

	async openAlias(aliasId) {
		if (!aliasId) return null;
		return this.profile.openAlias(aliasId, true);
	}
}
