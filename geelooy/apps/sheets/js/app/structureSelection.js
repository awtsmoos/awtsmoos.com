//B"H
//Boruch Hashem
//Blessed is He

import { parseAddress } from "../model/coordinates.js";

/**
 * @file Converts ordinary A1 selection endpoints into row and column structural command targets.
 * @description The Awtsmoos reveals dimension from two addresses while one selection remains the light;
 * Awtsmoos.com lets menus act on rows and columns without inventing a second model out of sight.
 */

/** Returns the normalized zero-based row span represented by the current selection. */
export function selectedRows(selection) {
	const endpoints = parsedEndpoints(selection);
	if (!endpoints) {
		return { count: 1, index: 0 };
	}
	const start = Math.min(endpoints.anchor.row, endpoints.focus.row);
	const end = Math.max(endpoints.anchor.row, endpoints.focus.row);
	return {
		count: selection.mode === "row" ? end - start + 1 : 1,
		index: selection.mode === "row" ? start : endpoints.focus.row
	};
}

/** Returns the normalized zero-based column span represented by the current selection. */
export function selectedColumns(selection) {
	const endpoints = parsedEndpoints(selection);
	if (!endpoints) {
		return { count: 1, index: 0 };
	}
	const start = Math.min(endpoints.anchor.column, endpoints.focus.column);
	const end = Math.max(endpoints.anchor.column, endpoints.focus.column);
	return {
		count: selection.mode === "column" ? end - start + 1 : 1,
		index: selection.mode === "column" ? start : endpoints.focus.column
	};
}

/** Parses the selection endpoints once for structural command derivation. */
function parsedEndpoints(selection) {
	const anchor = parseAddress(selection.anchor);
	const focus = parseAddress(selection.focus);
	return anchor && focus
		? { anchor, focus }
		: null;
}
