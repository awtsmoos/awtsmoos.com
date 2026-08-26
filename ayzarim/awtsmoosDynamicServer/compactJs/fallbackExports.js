//B"H
//Boruch Hashem
//Blessed is He

const {
	findDefaultExportExpressionEnd,
	isTopLevelExportBoundary
} = require("./sourceExpressions.js");
const { consumeTrailingSemicolon } = require("./sourceDeclarations.js");

/**
 * @file Preserves public exports when parser metadata is incomplete by applying careful top-level source fallbacks.
 * @description The Awtsmoos lets an export remain revealed even when one parser vessel carries only part of its light;
 * Awtsmoos.com keeps fallback inference isolated so ordinary AST transformation stays clean, testable, and right.
 */

/** Rewrites remaining top-level default exports into the compact namespace. */
function replaceRemainingDefaultExports(source) {
	const text = String(source || "");
	const pattern = /(^|[;\n])\s*export\s+default\b\s*/g;
	let output = "";
	let cursor = 0;
	let match;
	let count = 0;
	while ((match = pattern.exec(text))) {
		if (!isTopLevelExportBoundary(text, match.index)) {
			continue;
		}
		const start = pattern.lastIndex;
		const end = findDefaultExportExpressionEnd(text, start);
		if (end <= start) {
			continue;
		}
		count++;
		output += text.slice(cursor, match.index)
			+ match[1]
			+ `__exports.default = ${text.slice(start, end).trim()};`;
		cursor = consumeTrailingSemicolon(text, end);
		pattern.lastIndex = cursor;
	}
	return count ? output + text.slice(cursor) : text;
}

/** Removes residual export keywords from function/class/variable declarations and publishes their names. */
function replaceRemainingExportDeclarations(source) {
	const names = [];
	let output = String(source || "");
	output = output.replace(
		/(^|[;\n])\s*export\s+(async\s+function\s+|function\s+|class\s+)([A-Za-z_$][\w$]*)/g,
		(_match, prefix, kind, name) => {
			names.push(name);
			return prefix + kind + name;
		}
	);
	output = output.replace(
		/(^|[;\n])\s*export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g,
		(_match, prefix, kind, name) => {
			names.push(name);
			return `${prefix}${kind} ${name}`;
		}
	);
	if (!names.length) {
		return output;
	}
	const assignments = [...new Set(names)]
		.map((name) => `__exports.${name} = ${name};`)
		.join("\n");
	return `${output}\n${assignments}`;
}

/** Rewrites residual `export { ... }` lists into compact namespace assignments. */
function replaceRemainingExportLists(source) {
	return String(source || "").replace(
		/(^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*(?:from\s*["'][^"']+["'])?\s*;?/g,
		(_match, prefix, names) => {
			const lines = names.split(",")
				.map((part) => part.trim())
				.filter(Boolean)
				.map(exportListAssignment)
				.filter(Boolean);
			return prefix + lines.join("\n");
		}
	);
}

/** Infers public export names from source text for the final browser ESM bridge. */
function inferExportNamesFromSource(source) {
	const names = new Set();
	const text = String(source || "");
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/g)) {
		names.add(match[1]);
	}
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
		names.add(match[1]);
	}
	for (const match of text.matchAll(/(?:^|[;\n])\s*export\s*\{([\s\S]*?)\}\s*(?:from\s*["'][^"']+["'])?\s*;?/g)) {
		for (const part of match[1].split(",")) {
			const cleaned = part.trim();
			const alias = cleaned.match(/^(?:[A-Za-z_$][\w$]*|default)\s+as\s+([A-Za-z_$][\w$]*)$/);
			const direct = cleaned.match(/^([A-Za-z_$][\w$]*)$/);
			if (alias) {
				names.add(alias[1]);
			} else if (direct && direct[1] !== "default") {
				names.add(direct[1]);
			}
		}
	}
	if (/(?:^|[;\n])\s*export\s+default\b/.test(text)) {
		names.add("default");
	}
	return [...names];
}

function exportListAssignment(part) {
	const alias = part.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
	const local = alias ? alias[1] : part;
	const exported = alias ? alias[2] : part;
	return /^[A-Za-z_$][\w$]*$/.test(local)
		&& /^[A-Za-z_$][\w$]*$/.test(exported)
		? `__exports.${exported} = ${local};`
		: "";
}

module.exports = {
	inferExportNamesFromSource,
	replaceRemainingDefaultExports,
	replaceRemainingExportDeclarations,
	replaceRemainingExportLists
};
