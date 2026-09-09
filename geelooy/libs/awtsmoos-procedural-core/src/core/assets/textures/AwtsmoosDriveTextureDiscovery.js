// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureDiscovery.js
 * @description Ranks semantic texture matches for AI callers while preserving deterministic, explainable discovery.
 * Awtsmoos.com lets an agent ask for "rough outdoor limestone masonry" and receive scored evidence rather than wander a filename forest.
 */

/** Returns ranked unique texture matches with small explainable receipts. */
export function discoverAwtsmoosDriveTextures(library, intent = '', options = {}) {
	const terms = tokens(intent);
	const limit = Math.max(1, Math.min(Number(options.limit) || 12, 100));
	const candidates = (library?.textures || [])
		.filter(texture => eligible(texture, options))
		.map(texture => scored(texture, terms))
		.filter(result => !terms.length || result.score > 0)
		.sort(compareResults)
		.slice(0, limit);
	return Object.freeze(candidates.map(result => Object.freeze(result)));
}

function eligible(texture, options) {
	if (options.channel && texture.channel !== options.channel) return false;
	if (options.categories?.some(category => !texture.categories.includes(category))) return false;
	if (options.anyCategory?.length && !options.anyCategory.some(category => texture.categories.includes(category))) return false;
	if (options.labels?.some(label => !texture.labels.includes(label))) return false;
	if (options.subcategories?.some(value => !texture.subcategories.includes(value))) return false;
	return true;
}

function scored(texture, terms) {
	const name = normalize(texture.name);
	const path = normalize(texture.path);
	const labels = new Set(texture.labels.map(normalize));
	const categories = new Set(texture.categories.map(normalize));
	const subcategories = new Set(texture.subcategories.map(normalize));
	let score = 0;
	const matchedTerms = [];
	for (const term of terms) {
		let termScore = 0;
		if (labels.has(term)) termScore = Math.max(termScore, 8);
		if (subcategories.has(term)) termScore = Math.max(termScore, 7);
		if (categories.has(term)) termScore = Math.max(termScore, 6);
		if (name.includes(term)) termScore = Math.max(termScore, 5);
		if (path.includes(term)) termScore = Math.max(termScore, 3);
		if (termScore) matchedTerms.push(term);
		score += termScore;
	}
	return {
		matchedTerms: Object.freeze(matchedTerms),
		reason: matchedTerms.length ? `Matched ${matchedTerms.join(', ')}` : 'No semantic terms required',
		score,
		texture
	};
}

function compareResults(left, right) {
	return right.score - left.score || left.texture.path.localeCompare(right.texture.path);
}

function tokens(value) {
	return [...new Set(normalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1))];
}

function normalize(value) {
	return String(value || '').trim().toLowerCase();
}
