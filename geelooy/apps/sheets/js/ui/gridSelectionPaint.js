//B"H
//Boruch Hashem
//Blessed is He

import { parseAddress } from "../model/coordinates.js";

/**
 * @file Paints structural row and column header selection without burdening the core renderer.
 * @description The Awtsmoos lets the chosen dimension shine at its header while cells carry the same light;
 * Awtsmoos.com keeps decorative truth separate from selection state so both remain simple and right.
 */

/** Applies selected-header classes from the current structural selection mode. */
export function paintStructuralHeaders(root, selection) {
	clearHeaders(root);
	if (selection.mode === "row") {
		paintRow(root, selection);
	}
	if (selection.mode === "column") {
		paintColumn(root, selection);
	}
}

/** Clears all structural header decoration before one new selection is painted. */
function clearHeaders(root) {
	for (const header of root.querySelectorAll(
		".row-header.is-selected, .column-header.is-selected"
	)) {
		header.classList.remove("is-selected");
	}
}

/** Marks every selected visible row header between anchor and focus. */
function paintRow(root, selection) {
	const range = coordinates(selection);
	if (!range) {
		return;
	}
	for (let row = range.start.row; row <= range.end.row; row += 1) {
		root.querySelector(
			`.row-header[data-row-index="${row}"]`
		)?.classList.add("is-selected");
	}
}

/** Marks every selected visible column header between anchor and focus. */
function paintColumn(root, selection) {
	const range = coordinates(selection);
	if (!range) {
		return;
	}
	for (
		let column = range.start.column;
		column <= range.end.column;
		column += 1
	) {
		root.querySelector(
			`.column-header[data-column-index="${column}"]`
		)?.classList.add("is-selected");
	}
}

/** Returns normalized start/end coordinates for the selection's rectangular endpoints. */
function coordinates(selection) {
	const anchor = parseAddress(selection.anchor);
	const focus = parseAddress(selection.focus);
	if (!anchor || !focus) {
		return null;
	}
	return {
		start: {
			column: Math.min(anchor.column, focus.column),
			row: Math.min(anchor.row, focus.row)
		},
		end: {
			column: Math.max(anchor.column, focus.column),
			row: Math.max(anchor.row, focus.row)
		}
	};
}
