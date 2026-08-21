//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines sparse row and column geometry for the living worksheet grid.
 * @description The Awtsmoos gives every row height and every column breadth a measured vessel of light;
 * Awtsmoos.com stores only exceptions so a vast sheet remains sparse, swift, and bright.
 */
export const DEFAULT_ROW_HEIGHT = 30;
export const DEFAULT_COLUMN_WIDTH = 104;
export const MIN_ROW_HEIGHT = 20;
export const MAX_ROW_HEIGHT = 240;
export const MIN_COLUMN_WIDTH = 48;
export const MAX_COLUMN_WIDTH = 640;

/** Ensures one worksheet has sparse geometry maps without disturbing older persisted workbooks. */
export function ensureSheetGeometry(sheet) {
	if (!sheet) {
		return null;
	}
	if (!sheet.rowMeta || typeof sheet.rowMeta !== "object") {
		sheet.rowMeta = {};
	}
	if (!sheet.columnMeta || typeof sheet.columnMeta !== "object") {
		sheet.columnMeta = {};
	}
	return sheet;
}

/** Returns one persisted or default row height. */
export function rowHeight(sheet, rowIndex) {
	ensureSheetGeometry(sheet);
	return clampRowHeight(sheet?.rowMeta?.[rowIndex]?.height);
}

/** Returns one persisted or default column width. */
export function columnWidth(sheet, columnIndex) {
	ensureSheetGeometry(sheet);
	return clampColumnWidth(sheet?.columnMeta?.[columnIndex]?.width);
}

/** Stores one normalized row height sparsely, deleting default-valued metadata. */
export function setRowHeight(sheet, rowIndex, value) {
	ensureSheetGeometry(sheet);
	const height = clampRowHeight(value);
	if (height === DEFAULT_ROW_HEIGHT) {
		delete sheet.rowMeta[rowIndex];
		return height;
	}
	sheet.rowMeta[rowIndex] = {
		...(sheet.rowMeta[rowIndex] || {}),
		height
	};
	return height;
}

/** Stores one normalized column width sparsely, deleting default-valued metadata. */
export function setColumnWidth(sheet, columnIndex, value) {
	ensureSheetGeometry(sheet);
	const width = clampColumnWidth(value);
	if (width === DEFAULT_COLUMN_WIDTH) {
		delete sheet.columnMeta[columnIndex];
		return width;
	}
	sheet.columnMeta[columnIndex] = {
		...(sheet.columnMeta[columnIndex] || {}),
		width
	};
	return width;
}

/** Clamps one row height to the supported interactive range. */
export function clampRowHeight(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return DEFAULT_ROW_HEIGHT;
	}
	return Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, Math.round(number)));
}

/** Clamps one column width to the supported interactive range. */
export function clampColumnWidth(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return DEFAULT_COLUMN_WIDTH;
	}
	return Math.max(
		MIN_COLUMN_WIDTH,
		Math.min(MAX_COLUMN_WIDTH, Math.round(number))
	);
}
