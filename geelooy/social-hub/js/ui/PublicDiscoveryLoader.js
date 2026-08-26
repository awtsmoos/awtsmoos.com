//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file PublicDiscoveryLoader.js
 * @description Binah gathers viewer-following context and Daas rejects stale feed journeys before they reach the screen;
 * Awtsmoos.com keeps PublicDiscovery visual while this vessel owns asynchronous discovery mechanics clean.
 */
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

export class BinahPublicDiscoveryLoader {
	constructor({ api, state, operations }) {
		Object.assign(this, { api, state, operations });
	}

	/** Loads one discovery mode with group supersession and transport cancellation. */
	load(mode = 'latest') {
		const viewer = this.state.snapshot().identity.aliasId || 'public';
		return this.operations.query('public-discovery', async signal => {
			const options = await this.feedOptions(signal);
			if (signal.aborted) throw signal.reason || new DOMException('Superseded.', 'AbortError');
			const request = { ...options, ...modeOptions(mode) };
			const controls = { signal };
			return mode === 'trending'
				? this.api.trending(request, controls)
				: this.api.feed(request, controls);
		}, {
			requestKey: `public-discovery:${viewer}:${mode}`,
			group: 'public-discovery',
			meta: { mode }
		});
	}

	/** Builds the established following-aware feed query and preserves its compatibility fallback. */
	async feedOptions(signal) {
		const viewer = this.state.snapshot().identity.aliasId;
		if (!viewer) return { limit: 12 };
		try {
			const entries = await this.api.following(viewer, { limit: 100 });
			if (signal.aborted) throw signal.reason || new DOMException('Superseded.', 'AbortError');
			const aliases = [...new Set([viewer, ...followedAliasIds(entries)])];
			return { limit: 12, aliases: aliases.join(','), viewerAliasId: viewer };
		} catch (error) {
			if (signal.aborted) throw error;
			return { limit: 12, aliases: viewer, viewerAliasId: viewer };
		}
	}
}

export { followedAliasIds, modeOptions };
