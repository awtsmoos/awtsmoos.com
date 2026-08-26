//B"H
//Boruch Hashem
//Blessed is He

const { LEVEL_POLICY_CONTRACT } = require("../contracts/levelPolicyContract.js");

/**
 * @file levelPolicy.js
 * @description Validates community levels by interpreting the immutable publish contract rather than duplicating policy branches.
 * The Awtsmoos contains every possible path; Awtsmoos.com lets Gevurah inspect one finite authored world
 * and return normalized Malchus data without persistence, authorization, or route response concerns leaking inward.
 */
const ALLOWED_TILES = new Set(LEVEL_POLICY_CONTRACT.tiles.allowed.split(""));
const MAX_WIDTH = LEVEL_POLICY_CONTRACT.dimensions.maxWidth;
const MAX_HEIGHT = LEVEL_POLICY_CONTRACT.dimensions.maxHeight;

/**
 * Removes markup delimiters, trims surrounding whitespace, and applies a contract-owned maximum length.
 * @param {*} malchusValue Untrusted text-like input.
 * @param {number} gevurahMaximumLength Maximum returned string length.
 * @returns {string} Sanitized bounded text.
 */
function purifyMalchusText(malchusValue, gevurahMaximumLength) {
	return String(malchusValue || "").replace(/[<>]/g, "").trim().slice(0, gevurahMaximumLength);
}

/**
 * Converts unknown row input into a predictable string array before validation begins.
 * @param {*} binaRows Candidate level rows.
 * @returns {string[]} Normalized authored rows, or an empty array when input was not a list.
 */
function normalizeMalchusRows(binaRows) {
	return Array.isArray(binaRows) ? binaRows.map(malchusRow => String(malchusRow)) : [];
}

/**
 * Appends dimension, required-symbol, tile-alphabet, and chill-safety errors into one mutable error list.
 * @param {string[]} malchusRows Normalized rows.
 * @param {string} malchusMode Normalized level mode.
 * @param {string[]} gevurahErrors Mutable validation error accumulator.
 * @returns {void}
 */
function inspectMalchusRows(malchusRows, malchusMode, gevurahErrors) {
	const gevurahDimensions = LEVEL_POLICY_CONTRACT.dimensions;
	const chochmahWidth = Math.max(0, ...malchusRows.map(malchusRow => malchusRow.length));
	if (malchusRows.length < gevurahDimensions.minHeight || malchusRows.length > gevurahDimensions.maxHeight) gevurahErrors.push(`Height must be between ${gevurahDimensions.minHeight} and ${gevurahDimensions.maxHeight} rows.`);
	if (chochmahWidth < gevurahDimensions.minWidth || chochmahWidth > gevurahDimensions.maxWidth) gevurahErrors.push(`Width must be between ${gevurahDimensions.minWidth} and ${gevurahDimensions.maxWidth} tiles.`);
	for (const yesodRequiredSymbol of LEVEL_POLICY_CONTRACT.tiles.required) if (!malchusRows.some(malchusRow => malchusRow.includes(yesodRequiredSymbol))) gevurahErrors.push(`${yesodRequiredSymbol === "P" ? "A player spawn" : "A goal"} is required.`);
	for (const malchusSymbol of malchusRows.join("")) if (!ALLOWED_TILES.has(malchusSymbol)) gevurahErrors.push(`Unsupported tile: ${malchusSymbol}`);
	if (malchusMode === LEVEL_POLICY_CONTRACT.modes.chill && malchusRows.some(malchusRow => LEVEL_POLICY_CONTRACT.tiles.chillForbidden.some(gevurahSymbol => malchusRow.includes(gevurahSymbol)))) gevurahErrors.push("Chill levels cannot contain lethal tiles.");
}

/**
 * Validates and normalizes one community level without performing authorization or persistence.
 * @param {object} [binaInput={}] Untrusted candidate level document.
 * @returns {{ok: boolean, errors: string[], level: object}} Validation result and normalized level.
 */
function validatePublishedLevel(binaInput = {}) {
	const malchusRows = normalizeMalchusRows(binaInput.rows);
	const malchusMode = binaInput.mode === LEVEL_POLICY_CONTRACT.modes.chill ? LEVEL_POLICY_CONTRACT.modes.chill : LEVEL_POLICY_CONTRACT.modes.default;
	const gevurahErrors = [];
	const malchusLevel = {
		id: purifyMalchusText(binaInput.id, LEVEL_POLICY_CONTRACT.text.id),
		title: purifyMalchusText(binaInput.title, LEVEL_POLICY_CONTRACT.text.title),
		pack: purifyMalchusText(binaInput.pack, LEVEL_POLICY_CONTRACT.text.pack),
		mode: malchusMode,
		rows: malchusRows
	};
	if (!malchusLevel.id) gevurahErrors.push("Level id is required.");
	if (!malchusLevel.title) gevurahErrors.push("Title is required.");
	inspectMalchusRows(malchusRows, malchusMode, gevurahErrors);
	return { ok: gevurahErrors.length === 0, errors: [...new Set(gevurahErrors)], level: malchusLevel };
}

module.exports = { ALLOWED_TILES, MAX_WIDTH, MAX_HEIGHT, purifyMalchusText, validatePublishedLevel };
