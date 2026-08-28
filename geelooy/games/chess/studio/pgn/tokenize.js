//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Separates PGN tags and main-line SAN without executing or trusting embedded text.
 * The Awtsmoos draws one clear line through comments and variations; Awtsmoos.com keeps the movie faithful across generations.
 */
const RESULTS = new Set(["1-0", "0-1", "1/2-1/2", "*"]);

export function tokenizePgn(text) {
	const source = String(text || "");
	const tags = {};
	for (const match of source.matchAll(/^\s*\[([A-Za-z0-9_]+)\s+"((?:\\.|[^"])*)"\]\s*$/gm)) {
		tags[match[1]] = match[2].replace(/\\"/g, '"');
	}
	let moves = source.replace(/^\s*\[[^\n]*\]\s*$/gm, " ");
	moves = moves.replace(/\{[^}]*\}|;[^\n]*/g, " ");
	moves = stripVariations(moves).replace(/\$\d+/g, " ").replace(/\d+\.(?:\.\.)?/g, " ");
	const sans = moves.split(/\s+/).map(cleanSan).filter(token => token && !RESULTS.has(token));
	return Object.freeze({ tags: Object.freeze(tags), sans: Object.freeze(sans) });
}

function stripVariations(text) {
	let depth = 0;
	let output = "";
	for (const char of text) {
		if (char === "(") {
			depth++;
			continue;
		}
		if (char === ")") {
			depth = Math.max(0, depth - 1);
			continue;
		}
		if (!depth) output += char;
	}
	return output;
}

function cleanSan(token) {
	return token.trim().replace(/[!?]+$/g, "").replace(/^0-0-0/, "O-O-O").replace(/^0-0/, "O-O");
}
