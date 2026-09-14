//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file config.mjs
 * @description Defines the Games source covenant without coupling validation to any one title.
 * The limits intentionally reward small documented modules, readable physical lines, and
 * language-correct B"H headers while leaving pure data and untouched legacy debt separate.
 */

import { extname } from 'node:path';

export const MAX_JS_LINES = 119;
export const MAX_JS_LINE_LENGTH = 220;
export const JS_EXTENSIONS = Object.freeze(new Set(['.js', '.mjs', '.cjs']));
export const SOURCE_EXTENSIONS = Object.freeze(new Set([
	...JS_EXTENSIONS,
	'.css',
	'.html',
	'.htm',
	'.py',
	'.sh'
]));
export const HEADER_BY_EXTENSION = Object.freeze({
	'.js': ['//B"H', '//Boruch Hashem', '//Blessed be He'],
	'.mjs': ['//B"H', '//Boruch Hashem', '//Blessed be He'],
	'.cjs': ['//B"H', '//Boruch Hashem', '//Blessed be He'],
	'.css': ['/*B"H*/', '/*Boruch Hashem*/', '/*Blessed be He*/'],
	'.html': ['<!--B"H-->', '<!--Boruch Hashem-->', '<!--Blessed be He-->'],
	'.htm': ['<!--B"H-->', '<!--Boruch Hashem-->', '<!--Blessed be He-->'],
	'.py': ['#B"H', '#Boruch Hashem', '#Blessed be He'],
	'.sh': ['#B"H', '#Boruch Hashem', '#Blessed be He']
});

/**
 * Returns the exact opening covenant required for a source pathname.
 * @param {string} pathname Absolute or repository-relative source path.
 * @returns {ReadonlyArray<string>|null} Required lines, or null for an unknown extension.
 */
export function headerForPath(pathname) {
	return HEADER_BY_EXTENSION[extname(pathname).toLowerCase()] || null;
}

/**
 * Tells validators whether JavaScript-specific structure laws apply.
 * @param {string} pathname Source path under inspection.
 * @returns {boolean} True only for JS, MJS, or CJS sources.
 */
export function isJavaScriptPath(pathname) {
	return JS_EXTENSIONS.has(extname(pathname).toLowerCase());
}
