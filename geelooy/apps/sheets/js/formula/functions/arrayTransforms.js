//B"H
//Boruch Hashem
//Blessed is He

import { flattenValues, toBoolean } from "../coercion.js";
import { formulaError, isFormulaError } from "../errors.js";
import { positionalNumber } from "./helpers.js";
import {
	compareArrayValues,
	dropSigned,
	matrix,
	resolveArrayIndex,
	takeSigned,
	transposeMatrix,
	uniqueRows
} from "./arrayCore.js";

/**
 * @file Executes bounded dynamic-array transforms apart from their public registry metadata.
 * @description The Awtsmoos lets matrices turn, filter, stack, and unfold through measured light;
 * Awtsmoos.com keeps transformation mechanics separate so formula names remain small and right.
 */
const MAX_CELLS = 2000;

export function unique(args) { return uniqueRows(matrix(args[0])); }
export function transpose(args) { return transposeMatrix(matrix(args[0])); }
export function verticalStack(args) { return args.flatMap(matrix); }

export function sortRows(args) {
	const rows = matrix(args[0]);
	const column = positionalNumber(args, 1, 1);
	const ascending = toBoolean(args[2] ?? true);
	const error = [column, ascending].find(isFormulaError);
	if (error) return error;
	const index = Math.trunc(column) - 1;
	const direction = ascending ? 1 : -1;
	return [...rows].sort(
		(left, right) => compareArrayValues(left[index], right[index]) * direction
	);
}

export function filterRows(args) {
	const rows = matrix(args[0]);
	const include = flattenValues([args[1]]);
	const kept = rows.filter((_, index) => toBoolean(include[index]) === true);
	return kept.length
		? kept
		: (args[2] !== undefined ? [[args[2]]] : formulaError("#N/A"));
}

export function sequence(args) {
	const rows = positionalNumber(args, 0, 1);
	const columns = positionalNumber(args, 1, 1);
	const start = positionalNumber(args, 2, 1);
	const step = positionalNumber(args, 3, 1);
	const error = [rows, columns, start, step].find(isFormulaError);
	if (error) return error;
	const height = Math.max(1, Math.trunc(rows));
	const width = Math.max(1, Math.trunc(columns));
	if (height * width > MAX_CELLS) return formulaError("#RANGE!");
	return Array.from(
		{ length: height },
		(_, row) => Array.from(
			{ length: width },
			(_, column) => start + (((row * width) + column) * step)
		)
	);
}

export function take(args) {
	let rows = matrix(args[0]);
	const rowCount = positionalNumber(args, 1, rows.length);
	const columnCount = positionalNumber(args, 2, rows[0]?.length || 0);
	const error = [rowCount, columnCount].find(isFormulaError);
	if (error) return error;
	rows = takeSigned(rows, Math.trunc(rowCount));
	return rows.map((row) => takeSigned(row, Math.trunc(columnCount)));
}

export function drop(args) {
	let rows = matrix(args[0]);
	const rowCount = positionalNumber(args, 1, 0);
	const columnCount = positionalNumber(args, 2, 0);
	const error = [rowCount, columnCount].find(isFormulaError);
	if (error) return error;
	rows = dropSigned(rows, Math.trunc(rowCount));
	return rows.map((row) => dropSigned(row, Math.trunc(columnCount)));
}

export function chooseRows(args) {
	const rows = matrix(args[0]);
	return flattenValues(args.slice(1))
		.map((value) => rows[resolveArrayIndex(value, rows.length)] || [])
		.filter((row) => row.length);
}

export function chooseColumns(args) {
	const rows = matrix(args[0]);
	const indexes = flattenValues(args.slice(1)).map(
		(value) => resolveArrayIndex(value, rows[0]?.length || 0)
	);
	return rows.map((row) => indexes.map((index) => row[index] ?? ""));
}

export function horizontalStack(args) {
	const matrices = args.map(matrix);
	const height = Math.max(0, ...matrices.map((rows) => rows.length));
	return Array.from({ length: height }, (_, row) => matrices.flatMap((rows) =>
		rows[row] || Array(rows[0]?.length || 1).fill("")
	));
}
