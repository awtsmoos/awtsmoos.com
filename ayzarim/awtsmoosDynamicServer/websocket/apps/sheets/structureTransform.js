//B"H
//Boruch Hashem
//Blessed is He

const {
	setColumnWidth,
	setRowHeight,
	ensureGeometry
} = require("./structureGeometry.js");
const {
	shiftedCells,
	shiftedMetadata
} = require("./structureCells.js");

/**
 * @file Applies one normalized structural edit to the authoritative persisted worksheet.
 * @description The Awtsmoos moves dimension and content through one trusted operation of light;
 * Awtsmoos.com returns the exact normalized change so every collaborator receives the same sight.
 */

/** Applies one public structural operation to one worksheet and returns its normalized operation shape. */
function applyStructure(sheet, operation = {}) {
	ensureGeometry(sheet);
	if (operation.kind === "row.resize") {
		return resizeRow(sheet, operation);
	}
	if (operation.kind === "column.resize") {
		return resizeColumn(sheet, operation);
	}
	const shape = structuralShape(operation);
	if (!shape) {
		return null;
	}
	sheet.cells = shiftedCells(sheet.cells, shape);
	if (shape.axis === "row") {
		sheet.rowMeta = shiftedMetadata(sheet.rowMeta, shape);
	} else {
		sheet.columnMeta = shiftedMetadata(sheet.columnMeta, shape);
	}
	return {
		count: shape.count,
		index: shape.index,
		kind: operation.kind,
		sheetId: operation.sheetId
	};
}

/** Normalizes insert/delete kind into shared axis/mode arithmetic. */
function structuralShape(operation = {}) {
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
		count: Math.max(
			1,
			Math.min(100, Math.trunc(Number(operation.count) || 1))
		),
		index: Math.max(0, Math.trunc(Number(operation.index) || 0))
	};
}

/** Applies a trusted bounded row height and returns the normalized broadcast operation. */
function resizeRow(sheet, operation) {
	return {
		index: Math.max(0, Math.trunc(Number(operation.index) || 0)),
		kind: "row.resize",
		sheetId: operation.sheetId,
		size: setRowHeight(
			sheet,
			Math.max(0, Math.trunc(Number(operation.index) || 0)),
			operation.size
		)
	};
}

/** Applies a trusted bounded column width and returns the normalized broadcast operation. */
function resizeColumn(sheet, operation) {
	return {
		index: Math.max(0, Math.trunc(Number(operation.index) || 0)),
		kind: "column.resize",
		sheetId: operation.sheetId,
		size: setColumnWidth(
			sheet,
			Math.max(0, Math.trunc(Number(operation.index) || 0)),
			operation.size
		)
	};
}

module.exports = {
	applyStructure
};
