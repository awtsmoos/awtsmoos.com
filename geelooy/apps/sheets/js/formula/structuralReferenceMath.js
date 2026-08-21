//B"H
//Boruch Hashem
//Blessed is He

import { columnLabel } from "../model/coordinates.js";

/**
 * @file Holds coordinate arithmetic for structural formula-reference movement.
 * @description The Awtsmoos moves measured rows and columns while every reference keeps its truthful light;
 * Awtsmoos.com separates arithmetic from parsing so structural change stays readable and right.
 */

/** Computes one scalar coordinate after insert/delete, or null when the referenced position was deleted. */
export function shiftedCoordinate(coordinate, operation) {
	const index = Math.max(0, Number(operation.index) || 0);
	const count = Math.max(1, Number(operation.count) || 1);
	if (operation.mode === "insert") {
		return coordinate >= index
			? coordinate + count
			: coordinate;
	}
	if (coordinate < index) {
		return coordinate;
	}
	if (coordinate >= index + count) {
		return coordinate - count;
	}
	return null;
}

/** Computes range endpoints under insert/delete semantics, shrinking partial deletions safely. */
export function shiftedRangeCoordinates(first, second, operation) {
	const ascending = first <= second;
	let low = Math.min(first, second);
	let high = Math.max(first, second);
	const index = Math.max(0, Number(operation.index) || 0);
	const count = Math.max(1, Number(operation.count) || 1);
	if (operation.mode === "insert") {
		if (index <= low) {
			low += count;
			high += count;
		} else if (index <= high) {
			high += count;
		}
		return ascending ? [low, high] : [high, low];
	}
	const deletionEnd = index + count - 1;
	if (index <= low && deletionEnd >= high) {
		return null;
	}
	if (deletionEnd < low) {
		low -= count;
		high -= count;
	} else if (index <= low) {
		low = index;
		high -= count;
	} else if (index <= high) {
		high = Math.max(index - 1, high - count);
	}
	return ascending ? [low, high] : [high, low];
}

/** Rebuilds one anchored A1 reference after replacing exactly one axis coordinate. */
export function formatShiftedReference(parsed, axis, coordinate) {
	const row = axis === "row"
		? coordinate
		: parsed.row;
	const column = axis === "column"
		? coordinate
		: parsed.column;
	const columnText = `${parsed.columnAbsolute ? "$" : ""}${columnLabel(column)}`;
	const rowText = `${parsed.rowAbsolute ? "$" : ""}${row + 1}`;
	return `${columnText}${rowText}`;
}
