//B"H
//Boruch Hashem
//Blessed is He

import { applyStructureOperation } from "../model/structureTransform.js";
import { Requests } from "../realtime/protocol.js";

/**
 * @file Gives UI surfaces one shared/local command vessel for row and column structural edits.
 * @description The Awtsmoos moves dimension through the same intention whether draft or shared light;
 * Awtsmoos.com lets menus and resize handles call one API while authority remains measured and right.
 */
export class GevurahStructureActions {
	constructor(workbook, session) {
		this.workbook = workbook;
		this.session = session;
	}

	/** Inserts one or more rows before the zero-based row index. */
	async insertRows(index, count = 1) {
		return await this.structure(
			Requests.rowInsert,
			"row.insert",
			{ index, count }
		);
	}

	/** Deletes one or more rows beginning at the zero-based row index. */
	async deleteRows(index, count = 1) {
		return await this.structure(
			Requests.rowDelete,
			"row.delete",
			{ index, count }
		);
	}

	/** Persists one row height after direct manipulation or exact sizing. */
	async resizeRow(index, size) {
		return await this.structure(
			Requests.rowResize,
			"row.resize",
			{ index, size }
		);
	}

	/** Inserts one or more columns before the zero-based column index. */
	async insertColumns(index, count = 1) {
		return await this.structure(
			Requests.columnInsert,
			"column.insert",
			{ index, count }
		);
	}

	/** Deletes one or more columns beginning at the zero-based column index. */
	async deleteColumns(index, count = 1) {
		return await this.structure(
			Requests.columnDelete,
			"column.delete",
			{ index, count }
		);
	}

	/** Persists one column width after direct manipulation or exact sizing. */
	async resizeColumn(index, size) {
		return await this.structure(
			Requests.columnResize,
			"column.resize",
			{ index, size }
		);
	}

	/** Applies a local operation immediately or sends one authoritative shared mutation. */
	async structure(requestType, kind, fields) {
		const operation = {
			...fields,
			kind,
			sheetId: this.workbook.activeSheetId
		};
		if (!this.workbook.data.id) {
			applyStructureOperation(
				this.workbook,
				operation
			);
			return operation;
		}
		return await this.session.mutate(
			requestType,
			{
				...fields,
				sheetId: this.workbook.activeSheetId
			}
		);
	}
}
