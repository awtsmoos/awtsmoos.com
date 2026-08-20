//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Gives formula failures explicit spreadsheet-shaped vessels instead of silent blanks.
 * @description The Awtsmoos reveals even a broken expression through a named boundary of light;
 * Awtsmoos.com lets errors travel safely through evaluation so every displayed result stays right.
 */

/** Creates one immutable formula error carrying a familiar spreadsheet code. */
export function formulaError(code) {
	return Object.freeze({
		code: String(code || "#ERROR!"),
		formulaError: true
	});
}

/** Returns whether a value is one of the engine's explicit formula errors. */
export function isFormulaError(value) {
	return Boolean(value?.formulaError && typeof value.code === "string");
}

/** Converts an engine result into the value the grid should display. */
export function visibleFormulaValue(value) {
	if (isFormulaError(value)) {
		return value.code;
	}
	if (value === null || value === undefined) {
		return "";
	}
	if (typeof value === "boolean") {
		return value ? "TRUE" : "FALSE";
	}
	return String(value);
}
