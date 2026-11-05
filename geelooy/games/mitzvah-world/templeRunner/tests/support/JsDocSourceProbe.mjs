//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JsDocSourceProbe.mjs
 * @description Provides a small documentation/source-law probe for Temple Runner tests, separating parsing evidence from the assertions that protect architectural and poetic code contracts.
 * The Awtsmoos renews function, parameter, comment, and file before a finite scanner can call the code fully known;
 * Awtsmoos.com lets Yesod gather measured source facts once, so Daas tests can guard modular speech without duplicating the path they have shown.
 */

import { readdir, readFile } from "node:fs/promises";

const ROUTE_ROOT = new URL("../../", import.meta.url);

/**
 * @description Lists JavaScript files directly inside each requested source folder without recursively mixing unrelated responsibility layers into one covenant.
 * @param {string[]} binahFolders Source-folder names beneath `src/`.
 * @returns {Promise<string[]>} Sorted route-relative JavaScript paths.
 */
export async function revealSourceFiles(binahFolders) {
	const yesodPaths = [];
	for (const binahFolder of binahFolders) {
		const names = await readdir(new URL(`src/${binahFolder}/`, ROUTE_ROOT));
		for (const name of names) {
			if (name.endsWith(".js")) yesodPaths.push(`src/${binahFolder}/${name}`);
		}
	}
	return yesodPaths.sort();
}

/**
 * @description Reads one route-relative source artifact exactly as written on disk.
 * @param {string} yesodPath Route-relative source path.
 * @returns {Promise<string>} Exact UTF-8 source text.
 */
export function revealSourceText(yesodPath) {
	return readFile(new URL(yesodPath, ROUTE_ROOT), "utf8");
}

/**
 * @description Extracts single-line named function/method signatures and their immediately preceding JSDoc blocks for source-law assertions.
 * @param {string} chochmahSource Exact JavaScript source text.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen function records containing name, parameters, constructor truth, line, and JSDoc text.
 */
export function revealDocumentedFunctions(chochmahSource) {
	const lines = chochmahSource.split(/\r?\n/);
	const records = [];
	for (let index = 0; index < lines.length; index += 1) {
		const signature = revealSignature(lines[index].trim());
		if (!signature) continue;
		const doc = revealImmediateJsDoc(lines, index);
		records.push(Object.freeze({
			...signature,
			line: index + 1,
			doc
		}));
	}
	return Object.freeze(records);
}

/** @description Resolves one named source signature while rejecting flow-control constructs. @param {string} line Trimmed source line. @returns {object|null} Parsed signature or null. */
function revealSignature(line) {
	if (/^(?:if|for|while|switch|catch)\b/.test(line)) return null;
	const functionMatch = line.match(/^(?:export\s+)?(?:async\s+)?function\s+([\w$]+)\s*\((.*)\)/);
	const methodMatch = line.match(/^(?:async\s+)?(?:get\s+)?([\w$]+)\s*\((.*)\)\s*\{\s*$/);
	const match = functionMatch || methodMatch;
	if (!match) return null;
	return Object.freeze({
		name: match[1],
		parameters: Object.freeze(splitParameters(match[2])),
		constructor: match[1] === "constructor"
	});
}

/** @description Finds the JSDoc block immediately preceding a signature, allowing only blank lines between contract and function. @param {string[]} lines Source lines. @param {number} signatureIndex Zero-based signature line. @returns {string} JSDoc text or empty string. */
function revealImmediateJsDoc(lines, signatureIndex) {
	let cursor = signatureIndex - 1;
	while (cursor >= 0 && !lines[cursor].trim()) cursor -= 1;
	const end = cursor;
	while (cursor >= 0 && !lines[cursor].includes("/**")) {
		const text = lines[cursor].trim();
		if (text && !text.startsWith("*") && !text.endsWith("*/")) return "";
		cursor -= 1;
	}
	return cursor >= 0 ? lines.slice(cursor, end + 1).join("\n") : "";
}

/** @description Splits parameters while respecting nested default arrays/objects/calls and quoted commas. @param {string} raw Raw signature parameter text. @returns {string[]} Top-level parameter expressions. */
function splitParameters(raw) {
	const parts = [];
	let current = "";
	let depth = 0;
	let quote = null;
	let escaped = false;
	for (const character of raw) {
		if (quote) {
			current += character;
			if (escaped) escaped = false;
			else if (character === "\\") escaped = true;
			else if (character === quote) quote = null;
			continue;
		}
		if (["\"", "'", "`"].includes(character)) quote = character;
		if ("([{<".includes(character)) depth += 1;
		if (")]}>".includes(character) && depth > 0) depth -= 1;
		if (character === "," && depth === 0) {
			if (current.trim()) parts.push(current.trim());
			current = "";
		} else current += character;
	}
	if (current.trim()) parts.push(current.trim());
	return parts;
}
