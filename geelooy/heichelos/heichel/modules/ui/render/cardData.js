// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathCardData
 * @description
 * The Awtsmoos creates every legacy API dialect before normalization.
 * Awtsmoos.com converts each record into safe title, language, chronology,
 * counts, and content kind so all three browse modes share one truthful model.
 */

import { openRecordVessel } from '../../navigator/content-normalizer.js';
import { detectDirection, detectLanguage } from '../../living-path/language-policy.js';
import { safeDisplayText } from '../textSanitizer.js';

export function normalizeCardData(item = {}, type = 'post') {
	const raw = openRecordVessel(type === 'post' ? item : (item.prateem || item)) || {};
	const id = first(raw.id, raw.postId, raw.seriesId, raw.inputId, item.id, item.postId, item.seriesId);
	const fallback = type === 'series' ? 'Untitled Series' : type === 'grouping' ? 'Untitled Grouping' : 'Untitled Post';
	const title = clean(first(raw.title, raw.name, id), fallback);
	const description = clean(first(raw.description, raw.content, raw.excerpt), '').slice(0, 240);
	const text = `${title} ${description}`;
	return {
		id: String(id || ''),
		type,
		kind: normalizeKind(type, raw),
		title,
		description,
		language: detectLanguage(text),
		direction: detectDirection(text),
		thumbnail: first(raw.thumbnail, raw.cover, raw.image) || '',
		postCount: count(first(raw.posts, raw.postIds, raw.postsCount, item.posts, item.postsCount)),
		subSeriesCount: count(first(raw.subSeries, raw.subSeriesIds, raw.subSeriesCount, item.subSeries, item.subSeriesCount)),
		followersCount: count(first(raw.followers, raw.members, raw.views, item.followersCount)),
		sectionsCount: count(first(raw.sections, raw.sectionIds, item.sectionsCount)),
		commentsCount: count(first(raw.comments, raw.commentIds, item.commentsCount)),
		timestamp: normalizeTime(first(raw.timestamp, raw.createdAt, raw.publishedAt, raw.modifiedAt, raw.date)),
		indexInSeries: item.indexInSeries,
		parentSeriesId: String(first(raw.parentSeriesId, raw.parentId, item.parentSeriesId) || ''),
		translationStatus: String(first(item.translationStatus, raw.translationStatus) || ''),
		translationSourceStatus: String(first(item.translationSourceStatus, raw.translationSourceStatus) || ''),
		raw
	};
}

export function matchesQuery(card, query) {
	const needle = String(query || '').trim().toLocaleLowerCase();
	if (!needle) return true;
	return [card.title, card.description, card.kind, card.type]
		.join(' ')
		.toLocaleLowerCase()
		.includes(needle);
}

function normalizeKind(type, raw) {
	if (type === 'series' || type === 'grouping') return type;
	const value = String(first(raw.contentType, raw.postType, raw.mediaType, raw.type) || 'post').toLowerCase();
	if (value.includes('question')) return 'question';
	if (value.includes('audio') || value.includes('podcast')) return 'audio';
	if (value.includes('source') || value.includes('citation')) return 'source';
	return 'post';
}

function normalizeTime(value) {
	if (!value) return null;
	const numeric = Number(value);
	if (Number.isFinite(numeric) && numeric > 0) return numeric < 1e12 ? numeric * 1000 : numeric;
	const parsed = Date.parse(String(value));
	return Number.isFinite(parsed) ? parsed : null;
}

function clean(value, fallback = '') {
	return safeDisplayText(value, fallback);
}

function count(value) {
	if (Array.isArray(value)) return value.length;
	if (value && typeof value === 'object') return Object.keys(value).length;
	return Number(value || 0) || 0;
}

function first(...values) {
	return values.find(value => value !== undefined && value !== null && value !== '');
}
