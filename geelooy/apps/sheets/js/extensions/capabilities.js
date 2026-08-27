//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Defines the finite capability contract between declarative extension steps and workbook authority.
 * @description The Awtsmoos gives every automation act an explicit gate before it may enter spreadsheet light;
 * Awtsmoos.com makes requested power visible so a saved manifest cannot secretly grow another right.
 */
const REQUIRED = Object.freeze({
	setValue: ["range.write"],
	setFormula: ["range.write"],
	appendRow: ["sheet.append"],
	notify: ["ui.notify"],
	trimSelection: ["range.read", "range.write"],
	sequenceSelection: ["range.write"]
});

/** Returns every capability required by one declarative step type. */
export function requiredCapabilities(step) {
	return [...(REQUIRED[step?.type] || [])];
}

/** Throws when one step asks for authority not declared by its manifest. */
export function assertStepCapabilities(extension, step) {
	const granted = new Set(extension?.capabilities || []);
	const missing = requiredCapabilities(step)
		.filter((capability) => !granted.has(capability));
	if (missing.length) {
		throw new Error(
			`Extension ${extension?.name || extension?.id || "unknown"} lacks ${missing.join(", ")}.`
		);
	}
}
