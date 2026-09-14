//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file validator.mjs
 * @description Applies the Games source covenant to one file at a time without rewriting it.
 * The validator protects exact headers, modular size, tabbed code indentation, visible JSDoc,
 * and obvious compressed formatting while returning plain issues for tests and CLI callers.
 */

import { readFileSync } from 'node:fs';
import { MAX_JS_LINES, MAX_JS_LINE_LENGTH, headerForPath, isJavaScriptPath } from './config.mjs';

/**
 * Finds whether a declaration is immediately preceded by a real JSDoc block.
 * @param {ReadonlyArray<string>} lines Physical source lines.
 * @param {number} index Zero-based declaration line index.
 * @returns {boolean} True when the nearest nonblank predecessor closes a JSDoc block.
 */
function hasLeadingJsDoc(lines, index) {
	let cursor = index - 1;
	while (cursor >= 0 && !lines[cursor].trim()) {
		cursor -= 1;
	}
	if (cursor < 0 || lines[cursor].trim() !== '*/') {
		return false;
	}
	while (cursor >= 0 && !lines[cursor].includes('/**')) {
		cursor -= 1;
	}
	return cursor >= 0;
}

/**
 * Validates the exact language-aware opening covenant.
 * @param {string} pathname Source path used to choose comment syntax.
 * @param {ReadonlyArray<string>} lines Physical source lines.
 * @param {Array<string>} issues Mutable local issue collector.
 * @returns {void}
 */
function validateHeader(pathname, lines, issues) {
	const required = headerForPath(pathname);
	if (!required) {
		return;
	}
	for (let index = 0; index < required.length; index += 1) {
		if (lines[index] !== required[index]) {
			issues.push(`line ${index + 1}: expected exact header ${required[index]}`);
		}
	}
}

/**
 * Detects code indentation that begins with spaces instead of tabs.
 * JSDoc continuation lines are intentionally excluded from this structural rule.
 * @param {string} line One physical JavaScript line.
 * @returns {boolean} True when the line visibly begins code with spaces.
 */
function hasLeadingSpaceCode(line) {
	if (!line.startsWith(' ')) {
		return false;
	}
	const trimmed = line.trimStart();
	if (trimmed.startsWith('*') || trimmed.startsWith('*/')) {
		return false;
	}
	return /^(?:const|let|var|if|for|while|return|throw|export|import|class|function|[\w$]+[.(\[])/.test(trimmed);
}
