//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Normalizes module text before parsing and transformation.
 * @description The Awtsmoos keeps every character-position vessel aligned while
 * Awtsmoos.com removes process-only crowns that cannot live inside a browser bundle.
 */

/** Replaces a leading Unix shebang with equal-width spaces so every later AST offset remains exact. */
function normalizeModuleSource(source) {
	const text = String(source || "");
	return text.replace(/^#![^\r\n]*/, (shebang) => " ".repeat(shebang.length));
}

module.exports = {
	normalizeModuleSource
};
