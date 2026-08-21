//B"H
//Boruch Hashem
//Blessed is He

import {
	DEFAULT_COLUMN_WIDTH,
	DEFAULT_ROW_HEIGHT
} from "../model/structureGeometry.js";
import {
	selectedColumns,
	selectedRows
} from "./structureSelection.js";

/**
 * @file Turns familiar Insert/Delete/Resize intentions into bounded structural workbook actions.
 * @description The Awtsmoos opens space above and below, left and right, through measured light;
 * Awtsmoos.com lets menu abundance flow through one permission-aware command vessel, clean and right.
 */
export class MalchusStructureCommands {
	constructor(actions, selection, workbook) {
		this.actions = actions;
		this.selection = selection;
		this.workbook = workbook;
	}

	/** Executes one supported structural command id and returns whether it was recognized. */
	async execute(command, value = null) {
		const methods = {
			"insert.rowAbove": () => this.insertRows(false),
			"insert.rowBelow": () => this.insertRows(true),
			"insert.columnLeft": () => this.insertColumns(false),
			"insert.columnRight": () => this.insertColumns(true),
			"delete.rows": () => this.deleteRows(),
			"delete.columns": () => this.deleteColumns(),
			"resize.row": () => this.resizeRow(value),
			"resize.column": () => this.resizeColumn(value),
			"resize.rowReset": () => this.resizeRow(DEFAULT_ROW_HEIGHT),
			"resize.columnReset": () => this.resizeColumn(DEFAULT_COLUMN_WIDTH)
		};
		const operation = methods[command];
		if (!operation) {
			return false;
		}
		await operation();
		return true;
	}

	/** Inserts the selected row count before or after the selected/focused row span. */
	async insertRows(after) {
		const rows = selectedRows(this.selection);
		await this.actions.insertRows(
			rows.index + (after ? rows.count : 0),
			rows.count
		);
	}

	/** Inserts the selected column count before or after the selected/focused column span. */
	async insertColumns(after) {
		const columns = selectedColumns(this.selection);
		await this.actions.insertColumns(
			columns.index + (after ? columns.count : 0),
			columns.count
		);
	}

	/** Deletes the currently selected structural row span or the focused row. */
	async deleteRows() {
		const rows = selectedRows(this.selection);
		await this.actions.deleteRows(rows.index, rows.count);
	}

	/** Deletes the currently selected structural column span or the focused column. */
	async deleteColumns() {
		const columns = selectedColumns(this.selection);
		await this.actions.deleteColumns(columns.index, columns.count);
	}

	/** Applies one exact row height to each selected row through bounded individual operations. */
	async resizeRow(size) {
		const rows = selectedRows(this.selection);
		for (let offset = 0; offset < rows.count; offset += 1) {
			await this.actions.resizeRow(rows.index + offset, size);
		}
	}

	/** Applies one exact column width to each selected column through bounded individual operations. */
	async resizeColumn(size) {
		const columns = selectedColumns(this.selection);
		for (let offset = 0; offset < columns.count; offset += 1) {
			await this.actions.resizeColumn(columns.index + offset, size);
		}
	}
}
