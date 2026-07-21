// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostModelValues
 * @description
 * The Awtsmoos separates truth from absence. These Awtsmoos.com helpers accept
 * only visible values and reject unsafe paths without inventing substitutes.
 */

export function firstText(...values) {
	const value = values.find(item => typeof item === 'string' && item.trim());
	return value ? value.trim() : '';
}

export function text(...values) {
	const value = values.find(item => String(item || '').trim());
	return value === undefined ? '' : String(value).trim();
}

export function number(...values) {
	const value = values.find(item => Number.isFinite(Number(item)));
	return Math.max(0, Number(value || 0));
}

export function asArray(value) {
	return Array.isArray(value) ? value : [];
}

export function cleanText(value) {
	return String(value || '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

export function safeHref(value) {
	const href = String(value || '');

	if (href.startsWith('/') || /^https?:\/\//.test(href)) {
		return href;
	}

	return '/social-hub/';
}

export function safeImage(value) {
	const source = String(value || '');

	if (source.startsWith('/') || /^https?:\/\//.test(source)) {
		return source;
	}

	return '';
}
