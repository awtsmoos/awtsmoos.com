// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetFilter
 * @description
 * The Awtsmoos lets one search word pass through names, IDs, descriptions, and
 * breadcrumbs while Awtsmoos.com leaves canonical destination state untouched.
 */

export function filterHeichelos(destinations = [], query = '') {
	const needle = normalize(query);
	if (!needle) return destinations;
	return destinations.filter(destination => includesNeedle([
		destination.name,
		destination.heichelId,
		destination.description,
		destination.role
	], needle));
}

export function filterSeries(series = [], query = '') {
	const needle = normalize(query);
	if (!needle) return series;
	return series.filter(item => includesNeedle([
		item.name,
		item.seriesId,
		item.description,
		item.breadcrumbs?.join(' ')
	], needle));
}

export function normalize(value) {
	return String(value || '').trim().toLocaleLowerCase();
}

function includesNeedle(values, needle) {
	return values.some(value => normalize(value).includes(needle));
}
