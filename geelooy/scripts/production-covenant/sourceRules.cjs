//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file sourceRules.cjs
 * @description
 * Validates the source covenant requested for actively touched Awtsmoos files.
 * Legacy debt may be audited separately; explicit files can be failed immediately
 * for missing blessing testimony, oversized modules, weak JS docs, or space indents.
 */

const fs = require("fs");
const path = require("path");

const JS_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);
const FORMATTED_EXTENSIONS = new Set([
	...JS_EXTENSIONS,
	".css",
	".html"
]);

/**
 * Audits one source file without modifying it.
 *
 * @param {string} filePath Absolute or process-relative source path.
 * @returns {{file:string,ok:boolean,lineCount:number,violations:object[]}}
 * 	Machine-readable source covenant result.
 */
function auditSourceFile(filePath) {
	const resolved = path.resolve(filePath);
	const text = fs.readFileSync(resolved, "utf8").replace(/\r\n/g, "\n");
	const lines = text.endsWith("\n")
		? text.slice(0, -1).split("\n")
		: text.split("\n");
	const extension = path.extname(resolved).toLowerCase();
	const violations = [];

	if (!hasBlessing(lines)) {
		violations.push(issue("missing_blessing_header"));
	}
	if (lines.length >= 120) {
		violations.push(issue("source_file_not_under_120_lines", lines.length));
	}
	if (JS_EXTENSIONS.has(extension)) {
		auditJavaScript(text, violations);
	}
	if (FORMATTED_EXTENSIONS.has(extension)) {
		auditReadableFormatting(lines, violations);
	}

	return {
		file: resolved,
		ok: violations.length === 0,
		lineCount: lines.length,
		violations
	};
}

/** @param {string[]} lines Source lines. @returns {boolean} Whether the required opening testimony exists. */
function hasBlessing(lines) {
	const opening = lines.slice(0, 6).join("\n").toLowerCase();
	return /b["'”]h/.test(opening)
		&& opening.includes("boruch hashem")
		&& (opening.includes("blessed be he") || opening.includes("blessed is he"));
}

/** @param {string} text Full JS source. @param {object[]} violations Output. */
function auditJavaScript(text, violations) {
	if (!text.includes("/**") || !text.includes("@file") || !text.includes("@description")) {
		violations.push(issue("insufficient_jsdoc_contract"));
	}
}

/** @param {string[]} lines Source lines. @param {object[]} violations Output. */
function auditReadableFormatting(lines, violations) {
	const spaceIndent = lines.findIndex((line) => {
		return /^ {2,}\S/.test(line) && !/^ +\*/.test(line) && !/^ +\/\//.test(line);
	});
	if (spaceIndent >= 0) {
		violations.push(issue("space_indentation_detected", spaceIndent + 1));
	}
	const compressed = lines.findIndex((line) => line.length > 220);
	if (compressed >= 0) {
		violations.push(issue("compressed_line_risk", compressed + 1));
	}
}

/** @param {string} code Stable violation code. @param {number} [line] Optional line/count detail. @returns {object} */
function issue(code, line) {
	return line
		? { code, line }
		: { code };
}

/** @param {string[]} paths Source paths. @returns {{ok:boolean,files:object[],violations:number}} */
function auditSourceFiles(paths) {
	const files = paths.map(auditSourceFile);
	const violations = files.reduce((total, file) => total + file.violations.length, 0);
	return {
		ok: violations === 0,
		files,
		violations
	};
}

module.exports = {
	auditSourceFile,
	auditSourceFiles
};