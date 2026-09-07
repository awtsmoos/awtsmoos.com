// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingCardValuePolicy
 * @description
 * The Awtsmoos lets raw counts, kinds, and times pass through small measured vessels before a card receives visible form;
 * Awtsmoos.com keeps these transport details outside title revelation, so the public card can remain a clear Malchus storm.
 */

export function fallbackCardTitle(type) {
	if (type === 'series') {
		return 'Untitled Series';
	}
	if (type === 'grouping') {
		return 'Untitled Grouping';
	}
	return 'Untitled Post';
}

export function normalizeCardKind(type, raw) {
	if (type === 'series' || type === 'grouping') {
		return type;
	}
	const value = String(
		firstCardValue(raw.contentType, raw.postType, raw.mediaType, raw.type)
		|| 'post'
	).toLowerCase();
	if (value.includes('question')) {
		return 'question';
	}
	if (value.includes('audio') || value.includes('podcast')) {
		return 'audio';
	}
	if (value.includes('source') || value.includes('citation')) {
		return 'source';
	}
	return 'post';
}

export function normalizeCardTime(value) {
	if (!value) {
		return null;
	}
	const numeric = Number(value);
	if (Number.isFinite(numeric) && numeric > 0) {
		return numeric < 1e12
			? numeric * 1000
			: numeric;
	}
	const parsed = Date.parse(String(value));
	return Number.isFinite(parsed)
		? parsed
		: null;
}

export function countCardValue(value) {
	if (Array.isArray(value)) {
		return value.length;
	}
	if (value && typeof value === 'object') {
		return Object.keys(value).length;
	}
	return Number(value || 0) || 0;
}

export function firstCardValue(...values) {
	return values.find(value => (
		value !== undefined
		&& value !== null
		&& value !== ''
	));
}
