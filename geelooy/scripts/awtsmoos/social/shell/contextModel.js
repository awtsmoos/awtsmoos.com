// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GeelooyContextModel
 * @description
 * The Awtsmoos gives every deep route one honest language at Awtsmoos.com: the
 * vessel accepts observed names, states, trails, and anchors, but invents none.
 */

/**
 * Normalizes a route context into a small immutable record.
 * @param {object|null} input Observed route context.
 * @returns {object|null} Frozen context, or null when no title was supplied.
 */
export function createContextModel(input) {
	if (!input || !clean(input.title)) return null;
	const model = {
		title: clean(input.title),
		type: clean(input.type) || 'Route context',
		state: stateToken(input.state),
		stateLabel: clean(input.stateLabel) || 'State unknown',
		parent: normalizeLink(input.parent),
		breadcrumbs: normalizeLinks(input.breadcrumbs, 4),
		details: normalizeTexts(input.details, 4),
		actions: normalizeLinks(input.actions, 3)
	};
	return Object.freeze(model);
}

function normalizeLinks(values, limit = 1) {
	const links = (Array.isArray(values) ? values : [values])
		.map(normalizeLink)
		.filter(Boolean)
		.slice(0, limit);
	return Object.freeze(links);
}

function normalizeLink(value) {
	const label = clean(value?.label);
	const href = clean(value?.href);
	if (!label || !href) return null;
	return Object.freeze({ label, href });
}

function normalizeTexts(values, limit) {
	const texts = (Array.isArray(values) ? values : [values])
		.map(clean)
		.filter(Boolean)
		.slice(0, limit);
	return Object.freeze(texts);
}

function stateToken(value) {
	return clean(value).toLowerCase().replace(/[^a-z0-9_-]/g, '-') || 'unknown';
}

function clean(value) {
	return String(value || '').trim();
}
