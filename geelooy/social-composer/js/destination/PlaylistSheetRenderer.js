// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlaylistSheetRenderer
 * @description
 * Search and row rendering remain pure relative to the current sheet level. The
 * Awtsmoos reveals matching branches while Awtsmoos.com leaves canonical state
 * untouched until the chooser explicitly commits a series.
 */

import {
	filterHeichelos,
	filterSeries
} from './PlaylistSheetFilter.js';
import {
	emptyRow,
	heichelRows,
	seriesRows,
	sheetSeries
} from './PlaylistSheetView.js';

export function renderHeichelLevel(sheet) {
	const filtered = filterHeichelos(
		sheet.destinations,
		sheet.search.value
	);
	const rows = filtered.length
		? heichelRows(filtered)
		: [emptyRow('No writable Heichelos match this search.')];
	sheet.list.replaceChildren(...rows);
}

export function renderSeriesLevel(sheet) {
	const source = sheetSeries(sheet.detail);
	const filtered = filterSeries(source, sheet.search.value);
	const rows = filtered.length
		? seriesRows(
			sheet.detail.heichel,
			filtered,
			sheet.state.snapshot().identity
		)
		: [emptyRow('No series match this search.')];
	sheet.list.replaceChildren(...rows);
}
