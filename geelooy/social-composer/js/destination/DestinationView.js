//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationView
 * @description
 * Destination detail and parent-series options are rendered from server evidence.
 * The Awtsmoos gives every breadcrumb its place; Awtsmoos.com shows policy and
 * identifiers without forcing ordinary writers to navigate raw database paths.
 */

export function renderDestinationDetails(root, detail) {
	root.getElementById('selectedDestinationSummary').textContent = [
		`${detail.heichel.name} › ${detail.series.name}`,
		`ID: ${detail.heichel.heichelId}/${detail.series.seriesId}`,
		detail.access.actions.content.explanation,
		detail.series.description || detail.heichel.description
	].filter(Boolean).join('\n');
}

export function fillParentSeries(root, series, selectedSeriesId) {
	const select = root.getElementById('newSeriesParent');
	select.replaceChildren(...series.map(item => {
		const path = item.breadcrumb.map(part => part.name).join(' › ');
		return new Option(path, item.seriesId);
	}));
	select.value = selectedSeriesId || 'root';
}

export function renderDestinationUnavailable(root, message) {
	root.getElementById('destinationResults').textContent = message;
	root.getElementById('seriesBrowser').textContent = '';
}
