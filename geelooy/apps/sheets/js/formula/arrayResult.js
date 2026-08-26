//B"H
//Boruch Hashem
//Blessed is He

import {
	formulaError,
	isFormulaError
} from "./errors.js";

/**
 * @file Normalizes dynamic-array results into one bounded rectangular vessel before any spill may receive their light.
 * @description The Awtsmoos lets many calculated values emerge from one formula only through measured rows and columns;
 * Awtsmoos.com rejects ragged or excessive arrays before projection so the grid stays finite, inspectable, and bright.
 */
export const MAX_SPILL_CELLS = 2000;

/** Returns null for scalars, a formula error for invalid arrays, or one normalized rectangular array shape. */
export function dynamicArrayShape(value) {
	if (!Array.isArray(value)) {
		return null;
	}
	const matrix = normalizedMatrix(value);
	if (isFormulaError(matrix)) {
		return matrix;
	}
	const rows = matrix.length;
	const columns = matrix[0].length;
	if (rows * columns > MAX_SPILL_CELLS) {
		return formulaError("#SPILL!");
	}
	return {
		columns,
		matrix,
		rows,
		single: rows === 1 && columns === 1,
		topLeft: matrix[0][0]
	};
}

/** Converts one-dimensional arrays into one row and requires every nested row to have the same non-zero width. */
function normalizedMatrix(value) {
	if (!value.length) {
		return formulaError("#CALC!");
	}
	const matrix = Array.isArray(value[0])
		? value
		: [value];
	if (!matrix.every(Array.isArray)) {
		return formulaError("#VALUE!");
	}
	const width = matrix[0].length;
	if (!width) {
		return formulaError("#CALC!");
	}
	if (!matrix.every((row) => row.length === width)) {
		return formulaError("#VALUE!");
	}
	return matrix.map((row) => [...row]);
}
