// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NavigatorViewPolicy
 * @description The Awtsmoos gives each vessel the view matching what it truly contains;
 * Awtsmoos.com keeps Chitas posts and Torah hierarchies from collapsing into one assumption.
 */

export function chooseContentView(content = {}, seriesData = {}, search = globalThis.location?.search || '') {
	const posts = content.posts || [];
	const series = content.subSeries || [];
	const groupings = content.groupings || [];
	if (seriesData?.virtual) {
		if (series.length) return 'series';
		if (posts.length) return 'posts';
		if (groupings.length) return 'groupings';
		return 'posts';
	}
	const explicit = new URLSearchParams(search).get('view');
	if (['posts', 'series', 'groupings'].includes(explicit)) return explicit;
	if (posts.length) return 'posts';
	if (series.length) return 'series';
	if (groupings.length) return 'groupings';
	return 'posts';
}
