//B"H
//Boruch Hashem
//Blessed is He

import {
	ensureSheetGeometry,
	setColumnWidth,
	setRowHeight
} from "./structureGeometry.js";
import {
	shiftedCells,
	shiftedMetadata
} from "./structureCells.js";

/**
 * @file Applies one normalized structural operation to sparse client workbook state.
 * @description The Awtsmoos moves row and column through one measured operation of light;
 * Awtsmoos.com lets local drafts and remote revisions share the same deterministic structural rite.
 */

/** Applies insert, delete, or resize to one worksheet and emits one workbook change event. */
export function applyStructureOperation(
	workbook,
	operation = {},
	revision = null
) {
	const sheet = workbook.data.sheets.find(
		(item) => item.id === operation.sheetId
	);
	if (!sheet) {
		return false;
	}
	ensureSheetGeometry(sheet);
	if (operation.kind === "row.resize") {
		setRowHeight(sheet, operation.index, operation.size);
		return finish(workbook, operation.kind, revision);
	}
	if (operation.kind === "column.resize") {
		setColumnWidth(sheet, operation.index, operation.size);
		return finish(workbook, operation.kind, revision);
	}
	const structure = structuralShape(operation);
	if (!structure) {
		return false;
	}
	sheet.cells = shiftedCells(sheet.cells, structure);
	if (structure.axis === "row") {
		sheet.rowMeta = shiftedMetadata(sheet.rowMeta, structure);
	} else {
		sheet.columnMeta = shiftedMetadata(sheet.columnMeta, structure);
	}
	return finish(workbook, operation.kind, revision);
}

/** Converts one public operation kind into the shared axis/mode transformation shape. */
export function structuralShape(operation = {}) {
	const kinds = {
		"row.insert": { axis: "row", mode: "insert" },
		"row.delete": { axis: "row", mode: "delete" },
		"column.insert": { axis: "column", mode: "insert" },
		"column.delete": { axis: "column", mode: "delete" }
	};
	const shape = kinds[operation.kind];
	if (!shape) {
		return null;
	}
	return {
		...shape,
		count: Math.max(1, Math.trunc(Number(operation.count) || 1)),
		index: Math.max(0, Math.trunc(Number(operation.index) || 0))
	};
}

/** Commits one optional revision and emits a single structural model event. */
function finish(workbook, reason, revision) {
	if (Number.isSafeInteger(revision)) {
		workbook.data.revision = revision;
	}
	workbook.changed(`structure.${reason}`);
	return true;
}
