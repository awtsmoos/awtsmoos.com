//B"H
//Boruch Hashem
//Blessed is He

import { addressFrom, normalizeRange } from "../model/coordinates.js";
import { calculatedValue } from "../model/formula.js";

/**
 * @file Executes bounded data transformations through raw-cell movement and collaborative value batches.
 * @description The Awtsmoos orders rows by revealed value while every raw cell travels with its measured vessel;
 * Awtsmoos.com separates comparison from persistence so sorting remains deterministic, reversible in shape, and level.
 */
export class BinahDataCommands {
	constructor(actions, selection, workbook) {
		this.actions = actions;
		this.selection = selection;
		this.workbook = workbook;
	}

	/** Executes one supported data command and reports whether it owned the command id. */
	async execute(command) {
		if (command === "data.sortAscending") {
			await this.sort(false);
			return true;
		}
		if (command === "data.sortDescending") {
			await this.sort(true);
			return true;
		}
		return false;
	}

	/** Sorts selected rows by the calculated value in the selection's first column. */
	async sort(descending) {
		const range = normalizeRange(
			this.selection.anchor,
			this.selection.focus
		);
		if (!range || range.startRow === range.endRow) {
			return;
		}
		const rows = this.rows(range);
		rows.sort((left, right) => compareValues(
			left.key,
			right.key,
			descending
		));
		await this.actions.values(
			patchesForRows(rows, range)
		);
	}

	/** Captures raw row contents plus one calculated sort key before any write occurs. */
	rows(range) {
		const rows = [];
		for (let row = range.startRow; row <= range.endRow; row += 1) {
			const cells = [];
			for (let column = range.startColumn; column <= range.endColumn; column += 1) {
				cells.push(this.workbook.cell(addressFrom(row, column)).value ?? "");
			}
			rows.push({
				cells,
				key: calculatedValue(
					this.workbook,
					addressFrom(row, range.startColumn),
					this.workbook.activeSheetId
				)
			});
		}
		return rows;
	}
}

/** Produces row-major value patches that overwrite exactly the original selected rectangle. */
function patchesForRows(rows, range) {
	const patches = [];
	rows.forEach((row, rowOffset) => {
		row.cells.forEach((value, columnOffset) => {
			patches.push({
				address: addressFrom(
					range.startRow + rowOffset,
					range.startColumn + columnOffset
				),
				value
			});
		});
	});
	return patches;
}

/** Compares numbers numerically and all other values through locale-aware spreadsheet text ordering. */
function compareValues(left, right, descending) {
	const leftNumber = Number(left);
	const rightNumber = Number(right);
	const numeric = Number.isFinite(leftNumber) && Number.isFinite(rightNumber);
	const result = numeric
		? leftNumber - rightNumber
		: String(left ?? "").localeCompare(String(right ?? ""), undefined, {
			numeric: true,
			sensitivity: "base"
		});
	return descending ? -result : result;
}
