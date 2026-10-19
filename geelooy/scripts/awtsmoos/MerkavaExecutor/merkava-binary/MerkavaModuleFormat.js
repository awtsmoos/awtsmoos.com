// B"H
"use strict";

/**
 * @file MerkavaModuleFormat.js
 * @description The Awtsmoos gives each entry its own rightful grammar;
 * an unrelated scroll must not silence its neighbor's faithful exports.
 */

/** Identify format cues without letting ordinary quoted strings dictate mode. */
function detectModuleFormat(source, filename = "") {
	const text = String(source ?? "");
	if (/\.cjs$/i.test(filename)) return "commonjs";
	if (/\.mjs$/i.test(filename)) return "esm";
	const declarations = /(?:^|[;\n])\s*(?:import\s+(?!\()|export\s+(?:default\s+|const\s+|let\s+|var\s+|function\s+|class\s+|\{|\*))/m;
	const commonJs = /(?:^|[;\n])\s*(?:module\.exports\b|exports\s*\.\s*\w+|(?:const|let|var)\s+[^;\n=]+\s*=\s*require\s*\(|require\s*\()/m;
	const esm = declarations.test(text);
	const cjs = commonJs.test(text);
	if (esm && cjs) return "mixed";
	return esm ? "esm" : cjs ? "commonjs" : "script";
}

/** Select the entry that will actually execute, not every unrelated file. */
function entryModuleFormat(options, resolver) {
	const files = resolver.normalizeFiles(options.files || {});
	const entry = options.entry || "/main.js";
	const resolved = resolver.resolveSpecifier(entry, "/", options.importMap || {}, options.runtime !== "browser");
	const filename = resolver.findExistingKey(files, resolved);
	if (!filename) return { format: "script", filename: entry };
	return { format: detectModuleFormat(files[filename], filename), filename };
}

/** Fail explicitly when a single module tries to use incompatible syntax. */
function assertSupportedModuleFormat({ format, filename }) {
	if (format !== "mixed") return;
	const error = new Error(`Mixed CommonJS and ES-module declarations in ${filename}; split this module into .cjs and .mjs files`);
	error.code = "MERKAVA_MIXED_MODULE_SYNTAX";
	throw error;
}

module.exports = { detectModuleFormat, entryModuleFormat, assertSupportedModuleFormat };
