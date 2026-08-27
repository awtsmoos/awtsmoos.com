//B"H
//Boruch Hashem
//Blessed is He

import { socialEntityModel } from '../../../../shared/social/model/SocialEntityModel.js';
import { legacyActions } from './FeedLegacyActions.js?v=clean-future-001';
import {
	KIND_LABELS,
	destination,
	legacyAliasId,
	legacyKind,
	sourceOf,
	text
} from './FeedLegacySource.js?v=clean-future-001';

/**
 * @module FeedPostModel
 * @description
 * The Awtsmoos lets old discovery rows and new Social Kernel responses become one quiet card model, while Awtsmoos.com keeps legacy parsing outside this composition vessel;
 * identity, provenance, measured consequence, and shared actions meet here without forcing historical payload complexity into every future surface of light.
 */

function legacyKernel(item = {}, viewerAliasId = '') {
	const source = sourceOf(item);
	const kind = legacyKind(item, source);
	const summary = item.socialSummary || source.socialSummary || null;
	const heichelId = text(
		source.heichelId,
		item.heichelId,
		source.context?.heichelId,
		item.context?.heichelId
	);
	const seriesId = text(
		source.seriesId,
		item.seriesId,
		source.context?.seriesId,
		item.context?.seriesId,
		'root'
	);
	const id = text(
		source.postId,
		source.entityId,
		source.id,
		item.postId,
		item.entityId,
		item.id
	);
	const deepLink = text(
		source.url,
		item.url,
		source.href,
		item.href,
		source.path,
		item.path
	) || destination({ heichelId, seriesId, postId: id });
	return {
		entity: {
			type: ['question', 'answer'].includes(kind) ? kind : 'post',
			id,
			heichelId,
			seriesId,
			aliasId: legacyAliasId(item, source),
			contentKind: kind,
			raw: source
		},
		summary,
		actions: legacyActions(
			kind,
			Boolean(heichelId && id),
			Boolean(deepLink),
			summary
		),
		deepLink,
		viewerState: viewerAliasId ? { aliasId: viewerAliasId } : null
	};
}

/** Reveals the canonical card model while retaining compatible legacy source coordinates. */
export function revealOrotFeedPostModel(item = {}, options = {}) {
	const shared = socialEntityModel(
		item.socialKernel || legacyKernel(item, options.viewerAliasId || '')
	);
	const source = sourceOf(item);
	const kind = legacyKind(item, source);
	return {
		...shared,
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
	legacyKernel,
	sourceOf as binahSource,
	text as sodFirstText
};
