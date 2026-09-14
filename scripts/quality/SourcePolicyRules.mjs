//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module SourcePolicyRules
 * @description
 * Encodes the authored-source covenant for files an agent intentionally touches:
 * visible blessing header, bounded JavaScript modules, tab indentation, meaningful
 * JSDoc, and rejection of suspiciously compressed JavaScript source.
 */

const JAVASCRIPT_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const TEXT_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".css", ".html", ".htm"]);

/**
 * Audits one authored text file without mutating it.
 * @param {string} filePath Repository-relative file path.
 * @param {string} source UTF-8 source.
 * @returns {string[]} Stable human-readable violations.
 */
export function sourcePolicyViolations(filePath, source) {
	const extension = extensionOf(filePath);
	if (!TEXT_EXTENSIONS.has(extension)) return [];
	const violations = [];
	const lines = String(source).split(/\r?\n/);
	const opening = lines.slice(0, 8).join("\n");
	if (!/B["”']H/i.test(opening)) violations.push("missing B\"H header");
	if (!/Boruch Hashem/i.test(opening)) violations.push("missing Boruch Hashem header");
	if (!/Blessed (?:be|is) He/i.test(opening)) violations.push("missing Blessed be He header");
	if (!JAVASCRIPT_EXTENSIONS.has(extension)) return violations;
	if (lines.length > 120) violations.push(`JavaScript exceeds 120 lines (${lines.length})`);
	if (!/\/\*\*[\s\S]*?\*\//.test(source)) violations.push("JavaScript has no JSDoc block");
	if (lines.some(hasSpaceIndentation)) violations.push("JavaScript uses leading spaces instead of tabs");
	if (lines.some(isSuspiciouslyCompressed)) violations.push("JavaScript contains a suspiciously compressed line");
	return violations;
}

/** @param {string} line Source line. @returns {boolean} Whether code indentation starts with spaces. */
function hasSpaceIndentation(line) {
	if (!/^ +\S/.test(line)) return false;
	const trimmed = line.trimStart();
	return !trimmed.startsWith("*") && !trimmed.startsWith("//") && !trimmed.startsWith("*/");
}

/** @param {string} line Source line. @returns {boolean} Whether a long line resembles authored minification. */
function isSuspiciouslyCompressed(line) {
	const trimmed = line.trim();
	if (trimmed.length <= 500 || trimmed.startsWith("//") || trimmed.startsWith("*")) return false;
	const punctuation = (trimmed.match(/[;{}]/g) || []).length;
	return punctuation >= 8;
}

/** @param {string} filePath File path. @returns {string} Lowercase extension. */
function extensionOf(filePath) {
	const match = String(filePath).toLowerCase().match(/\.[^.\/]+$/);
	return match?.[0] || "";
}
