//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Normalizes sparse row and column geometry at the trusted realtime server boundary.
 * @description The Awtsmoos gives every dimension a bounded vessel before collaborators share its light;
 * Awtsmoos.com stores only geometry exceptions so old and new workbooks remain sparse and right.
 */
const DEFAULT_ROW_HEIGHT = 30;
const DEFAULT_COLUMN_WIDTH = 104;
const MIN_ROW_HEIGHT = 20;
const MAX_ROW_HEIGHT = 240;
const MIN_COLUMN_WIDTH = 48;
const MAX_COLUMN_WIDTH = 640;

/** Ensures one persisted worksheet contains sparse geometry maps. */
function ensureGeometry(sheet) {
	if (!sheet.rowMeta || typeof sheet.rowMeta !== "object") {
		sheet.rowMeta = {};
	}
	if (!sheet.columnMeta || typeof sheet.columnMeta !== "object") {
		sheet.columnMeta = {};
	}
	return sheet;
}

/** Persists one normalized row height sparsely. */
function setRowHeight(sheet, index, size) {
	ensureGeometry(sheet);
	const height = clamp(
		size,
		MIN_ROW_HEIGHT,
		MAX_ROW_HEIGHT,
		DEFAULT_ROW_HEIGHT
	);
	if (height === DEFAULT_ROW_HEIGHT) {
		delete sheet.rowMeta[index];
	} else {
		sheet.rowMeta[index] = {
			...(sheet.rowMeta[index] || {}),
			height
		};
	}
	return height;
}

/** Persists one normalized column width sparsely. */
function setColumnWidth(sheet, index, size) {
	ensureGeometry(sheet);
	const width = clamp(
		size,
		MIN_COLUMN_WIDTH,
		MAX_COLUMN_WIDTH,
		DEFAULT_COLUMN_WIDTH
	);
	if (width === DEFAULT_COLUMN_WIDTH) {
		delete sheet.columnMeta[index];
	} else {
		sheet.columnMeta[index] = {
			...(sheet.columnMeta[index] || {}),
			width
		};
	}
	return width;
}

/** Clamps one numeric dimension to its trusted supported range. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(
		minimum,
		Math.min(maximum, Math.round(number))
	);
}

module.exports = {
	ensureGeometry,
	setColumnWidth,
	setRowHeight
};
