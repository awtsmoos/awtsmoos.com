// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compiler.js
 * @description Recursively folds local CSS imports into one readable response while preserving browser-visible ordering and paths.
 * The Awtsmoos reveals many cascading chambers as one stream without erasing where each chamber began;
 * Awtsmoos.com keeps repetition truthful, cycles bounded, external imports first, and asset identity the same within.
 * Coordinated restart 2026-11-25: when the identical source file is folded more than once into one
 * compilation, only its LAST expansion is emitted. Earlier expansions collapse to a marker comment.
 * This is cascade-safe: for any pair of declarations, the surviving copies sit at the positions of the
 * original last copies, so every last-declaration-wins outcome is unchanged.
 */

const path = require("path");
const { findImportRules } = require("./imports.js");
const {
	isLocalCssSource,
	publicUrlForFile,
	resolveCssImport
} = require("./paths.js");
const { rebaseCssUrls } = require("./urls.js");

/**
 * Compiles one CSS entry into a single stylesheet response.
 * @param {object} options Compiler dependencies and boundaries.
 * @param {object} options.fs Promise-based filesystem adapter.
 * @param {string} options.entryFile Absolute CSS entry file.
 * @param {string} options.rootDir Absolute public document root.
 * @returns {Promise<string>} Combined non-minified stylesheet.
 */
async function compileCompactStylesheet({ fs, entryFile, rootDir }) {
	const { prelude, segments } = await compileCompactStylesheetSegments({ fs, entryFile, rootDir });
	return renderCompactSegments({ prelude, segments, rootDir });
}

/**
 * Compiles one CSS entry into ordered source-tagged segments plus the preserved-import prelude.
 * Bundle compilation uses this so duplicate sources can be deduped across entries, not only within one.
 * @param {object} options Compiler dependencies and boundaries.
 * @returns {Promise<{prelude: string[], segments: Array<{file: string, expansion: number, text: string}>}>}
 */
async function compileCompactStylesheetSegments({ fs, entryFile, rootDir }) {
	const state = {
		fs,
		rootDir: path.resolve(rootDir),
		prelude: [],
		nextExpansion: 0
	};
	const segments = await compileFile(state, path.resolve(entryFile), new Set());
	return { prelude: state.prelude, segments };
}

/**
 * Renders segments to one stylesheet string, omitting every expansion of a source
 * except its last (see header: the omission cannot change cascade outcomes).
 * @param {object} parts Prelude, segments and the public root for labels.
 * @returns {string} Combined non-minified stylesheet.
 */
function renderCompactSegments({ prelude, segments, rootDir }) {
	const lastExpansionByFile = new Map();
	for (const segment of segments) {
		if (segment.ephemeral) continue;
		if (segment.expansion > (lastExpansionByFile.get(segment.file) ?? -1)) {
			lastExpansionByFile.set(segment.file, segment.expansion);
		}
	}
	const announced = new Set();
	const kept = [];
	for (const segment of segments) {
		if (segment.ephemeral || segment.expansion === lastExpansionByFile.get(segment.file)) {
			kept.push(segment.text);
			continue;
		}
		if (!announced.has(segment.expansion)) {
			announced.add(segment.expansion);
			kept.push(`/* CompactCSS duplicate omitted: ${sourceLabel(segment.file, rootDir)} (identical source folded again later; last expansion kept) */`);
		}
	}
	const body = kept.filter(Boolean).join("\n");
	return [...(prelude || []), body].filter(Boolean).join("\n\n");
}

/**
 * Recursively manifests one stylesheet as source-tagged segments while the active
 * recursion stack guards only true cycles.
 * @param {object} state Shared compiler dependencies and external-import prelude.
 * @param {string} filePath Absolute stylesheet path.
 * @param {Set<string>} stack Active ancestor paths.
 * @returns {Promise<Array<{file: string, expansion: number, text: string}>>} Ordered segments for this source.
 */
async function compileFile(state, filePath, stack) {
	const absolute = path.resolve(filePath);
	const expansion = state.nextExpansion++;
	if (stack.has(absolute)) {
		return [{ file: absolute, expansion, ephemeral: true, text: `/* CompactCSS cycle omitted: ${sourceLabel(absolute, state.rootDir)} */` }];
	}
	const nextStack = new Set(stack);
	nextStack.add(absolute);
	const raw = await state.fs.readFile(absolute, "utf8");
	const source = stripCharset(String(raw));
	const rules = findImportRules(source);
	const segments = [{ file: absolute, expansion, text: `/* CompactCSS source: ${sourceLabel(absolute, state.rootDir)} */` }];
	let cursor = 0;
	for (const rule of rules) {
		segments.push({ file: absolute, expansion, text: rebaseCssUrls(source.slice(cursor, rule.start), absolute, state.rootDir) });
		segments.push(...await compileImport(state, absolute, rule, nextStack));
		cursor = rule.end;
	}
	segments.push({ file: absolute, expansion, text: rebaseCssUrls(source.slice(cursor), absolute, state.rootDir) });
	return segments;
}

/**
 * Expands a simple local import or preserves non-flattenable imports in the response prelude.
 * @param {object} state Shared compiler state.
 * @param {string} fromFile Absolute importing stylesheet.
 * @param {object} rule Parsed import rule.
 * @param {Set<string>} stack Active recursion stack.
 * @returns {Promise<Array>} Expanded local segments or an empty list.
 */
async function compileImport(state, fromFile, rule, stack) {
	if (!rule.parsed || !isLocalCssSource(rule.source)) {
		state.prelude.push(rule.raw);
		return [];
	}
	if (rule.condition) {
		state.prelude.push(renderPublicImport(state, fromFile, rule));
		return [];
	}
	const resolved = resolveCssImport({
		fromFile,
		source: rule.source,
		rootDir: state.rootDir
	});
	if (!resolved) {
		throw new Error(`CompactCSS rejected import outside public root: ${rule.source}`);
	}
	return compileFile(state, resolved, stack);
}

function renderPublicImport(state, fromFile, rule) {
	const resolved = resolveCssImport({ fromFile, source: rule.source, rootDir: state.rootDir });
	if (!resolved) throw new Error(`CompactCSS rejected conditional import: ${rule.source}`);
	const publicUrl = publicUrlForFile(resolved, state.rootDir);
	return `@import url("${publicUrl}${sourceDecoration(rule.source)}") ${rule.condition};`;
}

function sourceDecoration(source) {
	const value = String(source || "");
	const index = value.search(/[?#]/);
	return index === -1 ? "" : value.slice(index);
}

function sourceLabel(filePath, rootDir) {
	return publicUrlForFile(filePath, rootDir) || path.basename(filePath);
}

function stripCharset(source) {
	return source.replace(/@charset\s+(?:"[^"]*"|'[^']*')\s*;/gi, "");
}

module.exports = { compileCompactStylesheet, compileCompactStylesheetSegments, renderCompactSegments };
