// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigatorViewPolicy
 * @description
 * The Awtsmoos gives each vessel the view matching what it truly contains.
 * Awtsmoos.com preserves explicit choices only when that collection has content,
 * preventing an empty Timeline from hiding a populated Torah hierarchy.
 */

const VIEW_COLLECTION = Object.freeze({
	posts: 'posts',
	series: 'subSeries',
	groupings: 'groupings'
});

/**
 * Chooses one truthful visible content surface from loaded data and route intent.
 * @param {object} content Loaded post, series, and grouping collections.
 * @param {object} seriesData Current series metadata.
 * @param {string} search URL search string carrying an optional view key.
 * @returns {'posts'|'series'|'groupings'} Stable internal view key.
 */
export function chooseContentView(content = {}, seriesData = {}, search = globalThis.location?.search || '') {
	const has = view => Array.isArray(content[VIEW_COLLECTION[view]]) && content[VIEW_COLLECTION[view]].length > 0;
	const explicit = new URLSearchParams(search).get('view');
	if (seriesData?.virtual) {
		for (const view of ['series', 'posts', 'groupings']) if (has(view)) return view;
		return 'posts';
	}
	if (VIEW_COLLECTION[explicit] && has(explicit)) return explicit;
	for (const view of ['posts', 'series', 'groupings']) if (has(view)) return view;
	return 'posts';
}
