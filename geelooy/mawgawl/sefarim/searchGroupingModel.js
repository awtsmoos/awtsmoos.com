// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchGroupingModel
 * @description
 * Converts backend category testimony into deterministic browser presentation
 * without rerunning search or guessing Torah categories from display titles.
 */

const CATEGORY_MODE = 'category';
const RELEVANCE_MODE = 'relevance';

/** Returns presentation modes explicitly supported by the current response. */
export function supportedPresentationModes(search = {}) {
	const modes = Array.isArray(search.presentation?.modes)
		? search.presentation.modes
		: [RELEVANCE_MODE];
	return modes.filter(mode => mode === RELEVANCE_MODE || mode === CATEGORY_MODE);
}

/** Resolves the shareable selected mode while respecting backend capability. */
export function selectedPresentationMode(search = {}) {
	const modes = supportedPresentationModes(search);
	const requested = new URL(location.href).searchParams.get('view');
	if (requested && modes.includes(requested)) return requested;
	const preferred = String(search.presentation?.defaultMode || RELEVANCE_MODE);
	return modes.includes(preferred) ? preferred : RELEVANCE_MODE;
}

/** Persists the selected presentation mode without creating history noise. */
export function rememberPresentationMode(mode) {
	const url = new URL(location.href);
	if (mode === RELEVANCE_MODE) url.searchParams.delete('view');
	else url.searchParams.set('view', mode);
	history.replaceState(history.state, '', url);
}

/** Returns backend category definitions in stable declared order. */
export function categoryDefinitions(search = {}, hits = []) {
	const declared = Array.isArray(search.presentation?.categories)
		? search.presentation.categories
		: [];
	const byId = new Map(declared.map(category => [category.id, category]));
	for (const hit of hits) {
		const id = String(hit?.category?.id || 'other');
		if (byId.has(id)) continue;
		byId.set(id, {
			id,
			title: String(hit?.category?.title || 'Other Torah Results'),
			order: Number.MAX_SAFE_INTEGER,
			count: 0
		});
	}
	return [...byId.values()].sort((left, right) => {
		return Number(left.order || 0) - Number(right.order || 0);
	});
}

/** Groups hits by authoritative category and sorts only inside each category. */
export function groupedHits(search = {}, hits = []) {
	const buckets = new Map();
	for (const hit of hits) {
		const id = String(hit?.category?.id || 'other');
		if (!buckets.has(id)) buckets.set(id, []);
		buckets.get(id).push(hit);
	}
	return categoryDefinitions(search, hits)
		.map(category => ({
			category,
			hits: (buckets.get(category.id) || []).sort((left, right) => {
				return Number(left?.category?.rank || Number.MAX_SAFE_INTEGER)
					- Number(right?.category?.rank || Number.MAX_SAFE_INTEGER);
			})
		}))
		.filter(group => group.hits.length > 0);
}
