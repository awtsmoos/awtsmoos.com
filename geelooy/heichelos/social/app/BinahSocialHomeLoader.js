// B"H
/**
 * @module BinahSocialHomeLoader
 * @description
 * Binah gathers parallel social responses into one comprehensible home-state.
 * Awtsmoos.com keeps network aggregation separate from rendering and lifecycle,
 * so additional streams can join without swelling the page coordinator.
 */
export class BinahSocialHomeLoader {
	/**
	 * @param {object} tiferesApi - Social API registry.
	 */
	constructor(tiferesApi) {
		if (!tiferesApi) throw new TypeError('B"H social API registry is required.');
		this.tiferesApi = tiferesApi;
	}

	/**
	 * Loads feed, activity, and notification streams concurrently.
	 * @returns {Promise<object>} `{data, meta}` on partial/full success or `{error}` when all streams fail.
	 */
	async load() {
		const [chesedFeed, netzachActivity, hodSignals] = await Promise.all([
			this.tiferesApi.feed.global({ limit: 20 }),
			this.tiferesApi.graph.activity({ scope: 'all', limit: 20 }),
			this.tiferesApi.graph.notifications({ unread: true, limit: 10 })
		]);
		const gevurahHealthy = [chesedFeed, netzachActivity, hodSignals].filter(malchusResult => malchusResult.ok);
		if (!gevurahHealthy.length) return { error: this.errorMessage(chesedFeed, netzachActivity, hodSignals) };
		return this.compose(chesedFeed, netzachActivity, hodSignals);
	}

	/**
	 * Composes successful and partially successful streams into one home payload.
	 * @param {object} chesedFeed - Feed response.
	 * @param {object} netzachActivity - Activity response.
	 * @param {object} hodSignals - Notification response.
	 * @returns {object} Home data and readable load metadata.
	 */
	compose(chesedFeed, netzachActivity, hodSignals) {
		const malchusPosts = this.list(chesedFeed.data);
		const malchusComments = this.comments(netzachActivity.data);
		const malchusSignals = this.list(hodSignals.data);
		return {
			data: {
				profile: this.profile(malchusPosts, malchusComments),
				posts: malchusPosts,
				comments: malchusComments,
				notifications: { unreadCount: malchusSignals.length, groups: malchusSignals }
			},
			meta: `Loaded ${malchusPosts.length} posts, ${malchusComments.length} comments, ${malchusSignals.length} unread signals.`
		};
	}

	/** @param {unknown} binahData @returns {Array<object>} Stable list shape. */
	list(binahData) {
		if (Array.isArray(binahData)) return binahData;
		for (const yesodKey of ['items', 'posts', 'success', 'results']) {
			if (Array.isArray(binahData?.[yesodKey])) return binahData[yesodKey];
		}
		return binahData ? [binahData] : [];
	}

	/** @param {unknown} binahData @returns {Array<object>} Activity entries shaped as comments. */
	comments(binahData) {
		return this.list(binahData)
			.filter(malchusItem => malchusItem?.kind === 'comment' || malchusItem?.commentId || malchusItem?.text || malchusItem?.body)
			.map(malchusItem => ({
				author: malchusItem.author || malchusItem.aliasId || malchusItem.actor || 'Alias',
				text: malchusItem.text || malchusItem.body || malchusItem.summary || 'Activity updated.',
				replies: malchusItem.replies || []
			}));
	}

	/** @param {Array<object>} malchusPosts @param {Array<object>} malchusComments @returns {object} Profile summary. */
	profile(malchusPosts, malchusComments) {
		return {
			name: this.alias() || 'Awtsmoos Social',
			bio: 'Live feed, publishing, comments, notifications, and discovery from /api/social.',
			posts: malchusPosts.length,
			comments: malchusComments.length,
			heichelos: new Set(malchusPosts.map(malchusPost => malchusPost.heichelId || malchusPost.heichel).filter(Boolean)).size
		};
	}

	/** @returns {string} Current Alias from runtime context. */
	alias() {
		return globalThis.curAlias || new URLSearchParams(globalThis.location?.search || '').get('alias') || '';
	}

	/** @param {...object} malchusResults @returns {string} First meaningful transport error. */
	errorMessage(...malchusResults) {
		return malchusResults.find(malchusResult => malchusResult?.error)?.error || 'Social APIs are unavailable.';
	}
}

/** @param {object} tiferesApi @returns {Promise<object>} Backward-compatible social-home loader. */
export function loadSocialHome(tiferesApi) {
	return new BinahSocialHomeLoader(tiferesApi).load();
}
