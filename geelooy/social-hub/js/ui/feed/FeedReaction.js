//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FeedReaction
 * @description The Awtsmoos lets persisted reaction light arrive with the card instead of flashing from emptiness;
 * Awtsmoos.com seeds anonymous or verified-viewer aggregates while preserving the canonical mutation API beneath every choice.
 */
import { YesodReactionApi } from '../../../../social-actions/reactions/ReactionApi.js';
import { createTiferesReactionRail } from '../../../../social-actions/reactions/ReactionRail.js';

function seededApi(model, viewerAliasId) {
	const canonical = new YesodReactionApi();
	const summary = model.socialSummary?.reactions;
	if (!summary) return canonical;
	const viewerMatches = !viewerAliasId || summary.viewerAliasId === viewerAliasId;
	if (!viewerMatches) return canonical;
	return {
		summary: async () => ({
			total: Number(summary.total || 0),
			counts: summary.counts || {},
			viewerEmoji: summary.viewerEmoji || ''
		}),
		set: (...args) => canonical.set(...args),
		remove: (...args) => canonical.remove(...args)
	};
}

export function createFeedReactionRail(document, model, viewerAliasId = '') {
	if (!model.heichelId || !model.postId) return null;
	const type = ['question', 'answer'].includes(model.kind) ? model.kind : 'post';
	return createTiferesReactionRail({
		document,
		viewerAliasId,
		api: seededApi(model, viewerAliasId),
		target: { type, id: model.postId, heichelId: model.heichelId }
	});
}

export { seededApi };
