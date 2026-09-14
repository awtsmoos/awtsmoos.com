//B"H
//Boruch Hashem
//Blessed be He

const { parseCssRules } = require("../merkava-browser/standards/css/CssRuleParser.js");
const { readSourceFile, resolveSourcePath } = require("./SourcePathResolver.js");

/**
 * Resolves CSS @import statements through the in-memory project graph using the
 * balanced CSS rule parser. Imported bytes are never fetched by an external loader.
 *
 * @param {string} source Stylesheet source.
 * @param {object} files Project source dictionary.
 * @param {string} from Current stylesheet path.
 * @param {Set<string>} seen Cycle guard.
 * @returns {string} One recursively expanded stylesheet.
 */
function resolveCssImports(source = "", files = {}, from = "/index.html", seen = new Set()) {
	const output = [];
	for (const rule of parseCssRules(source)) {
		if (rule.kind === "at" && rule.name === "import") {
			const spec = importSpecifier(rule.prelude);
			if (!spec) continue;
			const key = resolveSourcePath(spec, from);
			if (seen.has(key)) continue;
			seen.add(key);
			output.push(resolveCssImports(readSourceFile(files, key, from), files, key, seen));
			continue;
		}
		output.push(serializeCssRule(rule));
	}
	return output.filter(Boolean).join("\n");
}

/** Extracts the URL/string portion of an @import prelude. */
function importSpecifier(prelude) {
	const text = String(prelude || "").trim();
	if (!text) return "";
	if (text.slice(0, 4).toLowerCase() === "url(") {
		const close = text.indexOf(")", 4);
		return unquote(text.slice(4, close < 0 ? text.length : close).trim());
	}
	if (text[0] === '"' || text[0] === "'") {
		const close = text.indexOf(text[0], 1);
		return text.slice(1, close < 0 ? text.length : close);
	}
	let end = 0;
	while (end < text.length && !" \t\r\n\f".includes(text[end])) end += 1;
	return text.slice(0, end);
}

function unquote(value) {
	if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
		return value.slice(1, -1);
	}
	return value;
}

/** Reconstructs one parsed CSS rule after import expansion. */
function serializeCssRule(rule) {
	if (rule.kind === "qualified") {
		return `${rule.prelude}{${rule.block}}`;
	}
	if (rule.kind === "at" && rule.block) {
		return `@${rule.name} ${rule.prelude}{${rule.block}}`;
	}
	if (rule.kind === "at") {
		return `@${rule.name} ${rule.prelude};`;
	}
	return "";
}

module.exports = { resolveCssImports };
