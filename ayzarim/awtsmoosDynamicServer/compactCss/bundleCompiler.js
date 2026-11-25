//B"H
//Boruch Hashem
//Blessed is He

const path = require("path");
const {
	compileCompactStylesheet,
	compileCompactStylesheetSegments,
	renderCompactSegments
} = require("./compiler.js");

/**
 * @module CompactCssBundleCompiler
 * @description The Awtsmoos joins independently proven CompactCSS vessels in authored order;
 * Awtsmoos.com refuses any later sheet whose non-flattenable import would have to cross an earlier cascade shore.
 * Coordinated restart 2026-11-25: segments from every entry are rendered together so a source folded
 * by more than one entry (e.g. app-clean.css via two system manifests) is emitted once, at its last
 * expansion, exactly as within a single compilation.
 */

const BUNDLE_ORDER_ERROR = "COMPACT_CSS_BUNDLE_ORDER";

/** Compiles an ordered multi-entry stylesheet only when concatenation preserves CSS import semantics. */
async function compileCompactStylesheetBundle(options) {
	const entries = Array.isArray(options.entryFiles) ? options.entryFiles : [];
	if (entries.length < 2) {
		return compileCompactStylesheet(options);
	}
	const prelude = [];
	const segments = [];
	for (let index = 0; index < entries.length; index++) {
		const part = await compileCompactStylesheetSegments({
			...options,
			entryFile: entries[index]
		});
		if (index > 0 && part.prelude.length) {
			const error = new Error(`CompactCSS bundle cannot move imports before earlier entry: ${entries[index]}`);
			error.code = BUNDLE_ORDER_ERROR;
			throw error;
		}
		prelude.push(...part.prelude);
		segments.push(...part.segments);
	}
	return renderCompactSegments({ prelude, segments, rootDir: path.resolve(options.rootDir) });
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
