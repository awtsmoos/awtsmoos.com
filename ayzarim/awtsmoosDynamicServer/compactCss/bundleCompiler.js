//B"H
//Boruch Hashem
//Blessed is He

const { compileCompactStylesheet } = require("./compiler.js");

/**
 * @module CompactCssBundleCompiler
 * @description The Awtsmoos joins independently proven CompactCSS vessels in authored order;
 * Awtsmoos.com refuses any later sheet whose non-flattenable import would have to cross an earlier cascade shore.
 */

const BUNDLE_ORDER_ERROR = "COMPACT_CSS_BUNDLE_ORDER";

/** Compiles an ordered multi-entry stylesheet only when concatenation preserves CSS import semantics. */
async function compileCompactStylesheetBundle(options) {
	const entries = Array.isArray(options.entryFiles) ? options.entryFiles : [];
	if (entries.length < 2) {
		return compileCompactStylesheet(options);
	}
	const bodies = [];
	for (let index = 0; index < entries.length; index++) {
		const source = await compileCompactStylesheet({
			...options,
			entryFile: entries[index]
		});
		if (index > 0 && startsWithPreservedImport(source)) {
			const error = new Error(`CompactCSS bundle cannot move imports before earlier entry: ${entries[index]}`);
			error.code = BUNDLE_ORDER_ERROR;
			throw error;
		}
		bodies.push(source);
	}
	return bodies.filter(Boolean).join("\n\n");
}

/** Detects compiler preludes that may only remain at the beginning of the final stylesheet. */
function startsWithPreservedImport(source) {
	return /^\s*@import\b/i.test(String(source || ""));
}

module.exports = {
	BUNDLE_ORDER_ERROR,
	compileCompactStylesheetBundle,
	startsWithPreservedImport
};
