// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathCardData
 * @description
 * The Awtsmoos gathers many transport dialects into one truthful bilingual card without swallowing their lower-level rules;
 * Awtsmoos.com gives explicit counts precedence over empty legacy arrays, so virtual Torah branches remain visible jewels.
 */

import { openRecordVessel } from '../../navigator/content-normalizer.js';
import {
	detectDirection,
	detectLanguage
} from '../../living-path/language-policy.js';
import { torahTitlePair } from '../../torahTitlePresentation.js?v=torah-bilingual-003';
import { safeDisplayText } from '../textSanitizer.js';
import {
	countCardValue,
	fallbackCardTitle,
	firstCardValue,
	normalizeCardKind,
	normalizeCardTime
} from './card-data-values.js?v=heichel-mobile-010';

export function normalizeCardData(item = {}, type = 'post') {
	const raw = openRecordVessel(
		type === 'post'
			? item
			: (item.prateem || item)
	) || {};
	const id = firstCardValue(
		raw.id,
		raw.postId,
		raw.seriesId,
		raw.inputId,
		item.id,
		item.postId,
		item.seriesId
	);
	const fallback = fallbackCardTitle(type);
	const rawTitle = clean(
		firstCardValue(raw.title, raw.name, id),
		fallback
	);
	const titlePair = torahTitlePair({
		...raw,
		id,
		name: rawTitle
	});
	const title = clean(titlePair.display, fallback);
	const description = clean(
		firstCardValue(raw.description, raw.content, raw.excerpt),
		''
	).slice(0, 240);
	const text = `${title} ${description}`;
	return {
		id: String(id || ''),
		type,
		kind: normalizeCardKind(type, raw),
		title,
		titleHe: titlePair.he,
		titleEn: titlePair.en,
		titleEnglishKind: titlePair.englishKind,
		description,
		language: detectLanguage(text),
		direction: detectDirection(text),
		thumbnail: firstCardValue(raw.thumbnail, raw.cover, raw.image) || '',
		postCount: countCardValue(firstCardValue(raw.postsCount, item.postsCount, raw.posts, raw.postIds, item.posts)),
		subSeriesCount: countCardValue(firstCardValue(raw.subSeriesCount, item.subSeriesCount, raw.subSeries, raw.subSeriesIds, item.subSeries)),
		followersCount: countCardValue(firstCardValue(raw.followers, raw.members, raw.views, item.followersCount)),
		sectionsCount: countCardValue(firstCardValue(raw.sections, raw.sectionIds, item.sectionsCount)),
		commentsCount: countCardValue(firstCardValue(raw.comments, raw.commentIds, item.commentsCount)),
		timestamp: normalizeCardTime(firstCardValue(raw.timestamp, raw.createdAt, raw.publishedAt, raw.modifiedAt, raw.date)),
		indexInSeries: item.indexInSeries,
		parentSeriesId: String(firstCardValue(raw.parentSeriesId, raw.parentId, item.parentSeriesId) || ''),
		translationStatus: String(firstCardValue(item.translationStatus, raw.translationStatus) || ''),
		translationSourceStatus: String(firstCardValue(item.translationSourceStatus, raw.translationSourceStatus) || ''),
		raw
	};
}

export function matchesQuery(card, query) {
	const needle = String(query || '')
		.trim()
		.toLocaleLowerCase();
	if (!needle) {
		return true;
	}
	return [
		card.title,
		card.titleHe,
		card.titleEn,
		card.description,
		card.kind,
		card.type
	]
		.join(' ')
		.toLocaleLowerCase()
		.includes(needle);
}

function clean(value, fallback = '') {
	return safeDisplayText(value, fallback);
}
