//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CssSourcePolicy.cjs
 * @description Audits the real imported CSS source vessels before concatenation hides their individual boundaries.
 * The Awtsmoos renews every garment before the cascade can weave it into one sheet; Awtsmoos.com lets this Gevurah-like gate
 * protect modular line limits, honest specificity, and unforced declarations while readable source remains the primary truth.
 */

const fs = require('node:fs');
const path = require('node:path');

const MAXIMUM_SOURCE_LINES = 120;
const ROOT_SELECTOR = '#mitzvah-world-root';

/**
 * @description Audits every imported source file against the project-local CSS constitution.
 * @param {string[]} filePaths Absolute imported source paths in resolved graph order.
 * @param {string} rootDir Repository or game root used to make diagnostics readable.
 * @returns {{errors: object[], files: object[]}} Immutable-ready policy evidence for the compiler manifest.
 */
function auditCssSources(filePaths, rootDir) {
	const errors = [];
	const files = [];
	for (const filePath of filePaths) {
		const source = fs.readFileSync(filePath, 'utf8');
		const relativePath = path.relative(rootDir, filePath);
		const lines = source.split(/\r?\n/u).length;
		files.push({ bytes: Buffer.byteLength(source), lines, path: relativePath });
		if (lines > MAXIMUM_SOURCE_LINES) {
			errors.push(issue(relativePath, 'line-limit', `${lines} lines exceeds ${MAXIMUM_SOURCE_LINES}.`));
		}
		if (/!important\b/iu.test(source)) {
			errors.push(issue(relativePath, 'important', '`!important` is forbidden in active localized source.'));
		}
		if (source.includes(`${ROOT_SELECTOR} ${ROOT_SELECTOR}`)) {
			errors.push(issue(relativePath, 'double-root', 'Doubled root specificity is forbidden.'));
		}
	}
	return { errors, files };
}

/**
 * @description Creates one stable source-policy diagnostic record for manifest and release-gate consumption.
 * @param {string} filePath Repository-relative source path that violated policy.
 * @param {string} code Stable machine-readable policy code.
 * @param {string} detail Human-readable evidence describing the violation.
 * @returns {{code: string, detail: string, path: string}} Policy issue record.
 */
function issue(filePath, code, detail) {
	return { code, detail, path: filePath };
}

module.exports = {
	auditCssSources
};
