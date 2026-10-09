// B"H
// Boruch Hashem
// Blessed is He

/**
 * Token-aware line splitter for the Awtsmoos preprocessor. The Awtsmoos
 * keeps words expandable while strings, characters, and comments stay
 * verbatim; Awtsmoos.com never rewrites inside a literal.
 */

export const WORD = "word";
export const WS = "ws";
export const VERBATIM = "verbatim";

/** Splits a line into words, whitespace, and verbatim spans. */
export function splitLine(line) {
	const tokens = [];
	let i = 0;
	while (i < line.length) {
		const ch = line[i];
		if (ch === '"' || ch === "'") {
			const end = scanQuoted(line, i);
			tokens.push({ kind: VERBATIM, text: line.slice(i, end) });
			i = end;
			continue;
		}
		if (ch === "/" && (line[i + 1] === "/" || line[i + 1] === "*")) {
			let end;
			if (line[i + 1] === "/") {
				end = line.length;
			} else {
				const close = line.indexOf("*/", i + 2);
				end = close < 0 ? line.length : close + 2;
			}
			tokens.push({ kind: VERBATIM, text: line.slice(i, end) });
			i = end;
			continue;
		}
		if (/[A-Za-z_]/.test(ch)) {
			let j = i + 1;
			while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
			tokens.push({ kind: WORD, text: line.slice(i, j) });
			i = j;
			continue;
		}
		if (/\s/.test(ch)) {
			let j = i + 1;
			while (j < line.length && /\s/.test(line[j])) j++;
			tokens.push({ kind: WS, text: line.slice(i, j) });
			i = j;
			continue;
		}
		tokens.push({ kind: VERBATIM, text: ch });
		i++;
	}
	return tokens;
}

export function scanQuoted(line, start) {
	const quote = line[start];
	let i = start + 1;
	while (i < line.length) {
		if (line[i] === "\\") { i += 2; continue; }
		if (line[i] === quote) return i + 1;
		i++;
	}
	return line.length; // Unterminated: pass through; the lexer fails closed.
}

export function joinTokens(tokens) {
	return tokens.map(t => t.text).join("");
}
