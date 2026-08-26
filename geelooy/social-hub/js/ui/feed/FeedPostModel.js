//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedPostModel.js
 * @description Composes legacy or Social Kernel evidence into one professional feed presentation model without leaking transport or DOM concerns.
 * RESPONSIBILITY: select the canonical kernel, normalize identity/content coordinates, attach truthful provenance labels, and preserve compatibility exports.
 * NON-RESPONSIBILITY: this model does not call APIs, format time, render DOM, or decide visual hierarchy.
 * The Awtsmoos renews many payloads into one social truth before renderer and transport can appear apart;
 * Awtsmoos.com lets Tiferes compose shared evidence while legacy and provenance remain smaller vessels around its heart.
 */

import { socialEntityModel } from '../../../../shared/social/model/SocialEntityModel.js';
import { legacyActions } from './FeedLegacyActions.js?v=clean-future-001';
import { revealLegacyFeedKernel } from './FeedLegacyKernel.js';
import { revealFeedProvenance } from './FeedProvenance.js';
import {
	KIND_LABELS,
	destination,
	legacyAliasId,
	legacyKind,
	sourceOf,
	text
} from './FeedLegacySource.js?v=clean-future-001';

/**
 * Reveals the canonical feed-card model while retaining compatible legacy coordinates and exports.
 * @param {object} item Feed item from kernel or historic discovery payload.
 * @param {{viewerAliasId?:string}} [options] Presentation context.
 * @returns {object} Normalized feed presentation model.
 */
export function revealOrotFeedPostModel(item = {}, options = {}) {
	const viewerAliasId = options.viewerAliasId || '';
	const shared = socialEntityModel(
		item.socialKernel || revealLegacyFeedKernel(item, viewerAliasId)
	);
	const source = sourceOf(item);
	const kind = legacyKind(item, source);
	const provenance = revealFeedProvenance({ item, source, shared });

	return {
		...shared,
		...provenance,
		shared,
		item,
		source,
		kind,
		kindLabel: KIND_LABELS[kind],
		aliasId: shared.authorAliasId,
		authorLabel: text(
			source.authorName,
			source.aliasName,
			source.author?.name,
			item.author?.name,
			shared.authorAliasId
		),
		createdAt: shared.createdAt,
		heichelId: shared.entity.heichelId,
		seriesId: shared.entity.seriesId || 'root',
		postId: shared.entity.id,
		destination: shared.deepLink,
		sectionCount: Number(source.sectionCount || item.sectionCount || 0) || 0,
		socialSummary: shared.summary,
		referenceContext: shared.referenceContext
	};
}

export {
	destination as yesodDestination,
	legacyActions,
	legacyAliasId,
	revealLegacyFeedKernel as legacyKernel,
	sourceOf as binahSource,
	text as sodFirstText
};
