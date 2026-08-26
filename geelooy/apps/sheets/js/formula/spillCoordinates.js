//B"H
//Boruch Hashem
//Blessed is He

import {
	addressFrom,
	parseAddress
} from "../model/coordinates.js";
import { formulaError } from "./errors.js";

/**
 * @file Gives dynamic-array projection deterministic A1 coordinates without teaching the evaluator geometry details.
 * @description The Awtsmoos lets one anchor pour row by row and column by column through names measured in light;
 * Awtsmoos.com orders every candidate by real coordinates so overlapping spills resolve predictably and right.
 */

/** Returns every projected address for one anchor/shape or an explicit spill error when projection escapes A1 bounds. */
export function spillAddresses(anchor, rows, columns) {
	const origin = parseAddress(anchor);
	if (!origin) {
		return formulaError("#REF!");
	}
	const addresses = [];
	for (let rowOffset = 0; rowOffset < rows; rowOffset += 1) {
		for (let columnOffset = 0; columnOffset < columns; columnOffset += 1) {
			const address = addressFrom(
				origin.row + rowOffset,
				origin.column + columnOffset
			);
			if (!parseAddress(address)) {
				return formulaError("#SPILL!");
			}
			addresses.push(address);
		}
	}
	return addresses;
}

/** Returns persisted formula anchors in numeric row/column order rather than object insertion order. */
export function sortedFormulaAnchors(workbook, sheetId) {
	const sheet = workbook?.data?.sheets?.find(
		(item) => item.id === sheetId
	);
	return Object.entries(sheet?.cells || {})
		.filter(([, cell]) =>
			typeof cell?.value === "string"
			&& cell.value.startsWith("=")
		)
		.map(([address]) => parseAddress(address))
		.filter(Boolean)
		.sort((left, right) =>
			left.row - right.row
			|| left.column - right.column
		)
		.map((entry) => entry.address);
}

/** Returns whether one persisted cell value meaningfully occupies a spill target. */
export function storedValueBlocksSpill(workbook, sheetId, address) {
	const sheet = workbook?.data?.sheets?.find(
		(item) => item.id === sheetId
	);
	const value = sheet?.cells?.[address]?.value;
	return value !== undefined
		&& value !== null
		&& value !== "";
}
