//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedLegacyKernel.js
 * @description Translates historical discovery rows into the canonical Social Kernel shape before modern feed presentation sees them.
 * RESPONSIBILITY: recover identity, chronology, content kind, provenance coordinates, destination, summary, compatible actions, and viewer state from legacy payloads.
 * NON-RESPONSIBILITY: this module does not render cards, format chronology labels, invent display names, or call social APIs.
 * The Awtsmoos renews old and new payloads from one hidden source before either can claim a separate life;
 * Awtsmoos.com lets Yesod carry yesterday's coordinates and truthful time into today's canonical vessel without making tomorrow inherit the strife.
 */

import { legacyActions } from './FeedLegacyActions.js?v=clean-future-001';
import {
	destination,
	legacyAliasId,
	legacyCreatedAt,
	legacyKind,
	sourceOf,
	text
} from './FeedLegacySource.js?v=clean-future-001';

/**
 * Reveals one canonical kernel-shaped record from a historical discovery item.
 * @param {object} item Legacy discovery row.
 * @param {string} viewerAliasId Active viewing alias when known.
 * @returns {object} Social-kernel-compatible record.
 */
export function revealLegacyFeedKernel(item = {}, viewerAliasId = '') {
	const binahSource = sourceOf(item);
	const tiferesKind = legacyKind(item, binahSource);
	const yesodSummary = item.socialSummary || binahSource.socialSummary || null;
	const malchusHeichelId = text(
		binahSource.heichelId,
		item.heichelId,
		binahSource.context?.heichelId,
		item.context?.heichelId
	);
	const netzachSeriesId = text(
		binahSource.seriesId,
		item.seriesId,
		binahSource.context?.seriesId,
		item.context?.seriesId,
		'root'
	);
	const hodEntityId = text(
		binahSource.postId,
		binahSource.entityId,
		binahSource.id,
		item.postId,
		item.entityId,
		item.id
	);
	const keterDeepLink = text(
		binahSource.url,
		item.url,
		binahSource.href,
		item.href,
		binahSource.path,
		item.path
	) || destination({
		heichelId: malchusHeichelId,
		seriesId: netzachSeriesId,
		postId: hodEntityId
	});
	const chochmahRaw = {
		...binahSource,
		createdAt: legacyCreatedAt(item, binahSource)
	};

	return {
		entity: {
			type: ['question', 'answer'].includes(tiferesKind) ? tiferesKind : 'post',
			id: hodEntityId,
			heichelId: malchusHeichelId,
			seriesId: netzachSeriesId,
			aliasId: legacyAliasId(item, binahSource),
			contentKind: tiferesKind,
			raw: chochmahRaw
		},
		summary: yesodSummary,
		actions: legacyActions(
			tiferesKind,
			Boolean(malchusHeichelId && hodEntityId),
			Boolean(keterDeepLink),
			yesodSummary
		),
		deepLink: keterDeepLink,
		viewerState: viewerAliasId ? { aliasId: viewerAliasId } : null
	};
}
