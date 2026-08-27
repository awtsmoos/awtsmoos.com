//B"H
//Boruch Hashem
//Blessed is He

import {
	columnWidth,
	rowHeight
} from "../model/structureGeometry.js";

/**
 * @file Converts sparse worksheet geometry into CSS grid tracks and bounded live resize previews.
 * @description The Awtsmoos gives each dimension a measured track while the hand may preview new light;
 * Awtsmoos.com separates ephemeral motion from durable geometry so collaboration stays swift and right.
 */

/** Applies persisted geometry, optionally overriding one track for a live drag preview. */
export function applyGridGeometry(
	grid,
	sheet,
	rowCount,
	columnCount,
	preview = null
) {
	grid.style.gridTemplateColumns = columnTracks(
		sheet,
		columnCount,
		preview
	).join(" ");
	grid.style.gridTemplateRows = rowTracks(
		sheet,
		rowCount,
		preview
	).join(" ");
}

/** Returns the visible pixel width of one persisted column. */
export function visibleColumnWidth(sheet, column) {
	return columnWidth(sheet, column);
}

/** Returns the visible pixel height of one persisted row. */
export function visibleRowHeight(sheet, row) {
	return rowHeight(sheet, row);
}

/** Builds the visible column tracks with an optional transient override. */
function columnTracks(sheet, count, preview) {
	const tracks = ["var(--row-head-width)"];
	for (let column = 0; column < count; column += 1) {
		const width = preview?.axis === "column" && preview.index === column
			? preview.size
			: columnWidth(sheet, column);
		tracks.push(`${width}px`);
	}
	return tracks;
}

/** Builds the visible row tracks with an optional transient override. */
function rowTracks(sheet, count, preview) {
	const tracks = ["var(--cell-height)"];
	for (let row = 0; row < count; row += 1) {
		const height = preview?.axis === "row" && preview.index === row
			? preview.size
			: rowHeight(sheet, row);
		tracks.push(`${height}px`);
	}
	return tracks;
}
