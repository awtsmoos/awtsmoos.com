// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compiler.js
 * @description Recursively folds local CSS imports into one readable response while preserving browser-visible ordering and paths.
 * The Awtsmoos reveals many cascading chambers as one stream without erasing where each chamber began;
 * Awtsmoos.com keeps repetition truthful, cycles bounded, external imports first, and asset identity the same within.
 */

const path = require('path');
const { findImportRules } = require('./imports.js');
const {
	isLocalCssSource,
	publicUrlForFile,
	resolveCssImport
} = require('./paths.js');
const { rebaseCssUrls } = require('./urls.js');

/**
 * Compiles one CSS entry into a single stylesheet response.
 * @param {object} options Compiler dependencies and boundaries.
 * @param {object} options.fs Promise-based filesystem adapter.
 * @param {string} options.entryFile Absolute CSS entry file.
 * @param {string} options.rootDir Absolute public document root.
 * @returns {Promise<string>} Combined non-minified stylesheet.
 */
async function compileCompactStylesheet({ fs, entryFile, rootDir }) {
	const state = {
		fs,
		rootDir: path.resolve(rootDir),
		prelude: []
	};
	const body = await compileFile(state, path.resolve(entryFile), new Set());
	return [...state.prelude, body].filter(Boolean).join('\n\n');
}

/**
 * Recursively manifests one stylesheet while the active recursion stack guards only true cycles.
 * @param {object} state Shared compiler dependencies and external-import prelude.
 * @param {string} filePath Absolute stylesheet path.
 * @param {Set<string>} stack Active ancestor paths.
 * @returns {Promise<string>} Expanded stylesheet body for this source.
 */
async function compileFile(state, filePath, stack) {
	const absolute = path.resolve(filePath);
	if (stack.has(absolute)) {
		return `/* CompactCSS cycle omitted: ${sourceLabel(absolute, state.rootDir)} */`;
	}
	const nextStack = new Set(stack);
	nextStack.add(absolute);
	const raw = await state.fs.readFile(absolute, 'utf8');
	const source = stripCharset(String(raw));
	const rules = findImportRules(source);
	const chunks = [`/* CompactCSS source: ${sourceLabel(absolute, state.rootDir)} */`];
	let cursor = 0;
	for (const rule of rules) {
		chunks.push(rebaseCssUrls(source.slice(cursor, rule.start), absolute, state.rootDir));
		chunks.push(await compileImport(state, absolute, rule, nextStack));
		cursor = rule.end;
	}
	chunks.push(rebaseCssUrls(source.slice(cursor), absolute, state.rootDir));
	return chunks.filter(Boolean).join('\n');
}

/**
 * Expands a simple local import or preserves non-flattenable imports in the response prelude.
 * @param {object} state Shared compiler state.
 * @param {string} fromFile Absolute importing stylesheet.
 * @param {object} rule Parsed import rule.
 * @param {Set<string>} stack Active recursion stack.
 * @returns {Promise<string>} Expanded local content or an empty placeholder.
 */
async function compileImport(state, fromFile, rule, stack) {
	if (!rule.parsed || !isLocalCssSource(rule.source)) {
		state.prelude.push(rule.raw);
		return '';
	}
	if (rule.condition) {
		state.prelude.push(renderPublicImport(state, fromFile, rule));
		return '';
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
	const value = String(source || '');
	const index = value.search(/[?#]/);
	return index === -1 ? '' : value.slice(index);
}

function sourceLabel(filePath, rootDir) {
	return publicUrlForFile(filePath, rootDir) || path.basename(filePath);
}

function stripCharset(source) {
	return source.replace(/@charset\s+(?:"[^"]*"|'[^']*')\s*;/gi, '');
}

module.exports = { compileCompactStylesheet };
