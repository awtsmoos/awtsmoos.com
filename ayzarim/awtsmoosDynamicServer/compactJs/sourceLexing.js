//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Walks strings, comments, templates, and whitespace for CompactJS source-boundary discovery.
 * @description The Awtsmoos lets syntax shadows be crossed without mistaking quoted words for structural law in light;
 * Awtsmoos.com keeps lexical stepping in one vessel so export transformation can remain precise, modular, and right.
 */

/** Skips one quoted JavaScript string while respecting escaped characters. */
function skipQuotedString(source, start, quote) {
	for (let index = start + 1; index < source.length; index++) {
		if (source[index] === "\\") {
			index++;
			continue;
		}
		if (source[index] === quote) {
			return index;
		}
	}
	return source.length - 1;
}

/** Skips one line or block comment and returns its terminal character index. */
function skipComment(source, start, kind) {
	if (kind === "/") {
		const end = source.indexOf("\n", start + 2);
		return end < 0 ? source.length - 1 : end;
	}
	const end = source.indexOf("*/", start + 2);
	return end < 0 ? source.length - 1 : end + 1;
}

/** Advances through whitespace only. */
function skipWhitespace(source, start) {
	let index = start;
	while (/\s/.test(source[index] || "")) {
		index++;
	}
	return index;
}

/** Finds the end of one template literal, recursively skipping interpolation expressions. */
function findTemplateLiteralEnd(source, start) {
	if (source[start] !== "`") {
		return -1;
	}
	for (let index = start + 1; index < source.length; index++) {
		const char = source[index];
		if (char === "\\") {
			index++;
			continue;
		}
		if (char === "`") {
			return index + 1;
		}
		if (char === "$" && source[index + 1] === "{") {
			index = skipTemplateExpression(source, index + 2);
			if (index < 0) {
				return -1;
			}
		}
	}
	return -1;
}

/** Walks a template interpolation until its matching closing brace. */
function skipTemplateExpression(source, start) {
	let depth = 1;
	for (let index = start; index < source.length; index++) {
		const char = source[index];
		const next = source[index + 1];
		if (char === "'" || char === '"') {
			index = skipQuotedString(source, index, char);
		} else if (char === "`") {
			const end = findTemplateLiteralEnd(source, index);
			if (end < 0) {
				return -1;
			}
			index = end - 1;
		} else if (char === "/" && (next === "/" || next === "*")) {
			index = skipComment(source, index, next);
		} else if (char === "{") {
			depth++;
		} else if (char === "}" && --depth === 0) {
			return index;
		} else if (char === "\\") {
			index++;
		}
	}
	return -1;
}

module.exports = {
	findTemplateLiteralEnd,
	skipComment,
	skipQuotedString,
	skipTemplateExpression,
	skipWhitespace
};
