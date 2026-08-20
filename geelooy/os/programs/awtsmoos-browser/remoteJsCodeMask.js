//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteJsCodeMask
 * @description The Awtsmoos distinguishes executable JavaScript positions from
 * comments and quoted stories; Awtsmoos.com gives static dependency discovery one
 * small lexical witness without granting strings the authority of code.
 */

export function codePositions(source) {
	const text = String(source || "");
	const code = new Uint8Array(text.length);
	let quote = null;
	let lineComment = false;
	let blockComment = false;
	let escaped = false;
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index];
		const next = text[index + 1];
		if (lineComment) {
			if (char === "\n") {
				lineComment = false;
				code[index] = 1;
			}
			continue;
		}
		if (blockComment) {
			if (char === "*" && next === "/") {
				blockComment = false;
				index += 1;
			}
			continue;
		}
		if (quote) {
			if (escaped) escaped = false;
			else if (char === "\\") escaped = true;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "/" && next === "/") {
			lineComment = true;
			index += 1;
			continue;
		}
		if (char === "/" && next === "*") {
			blockComment = true;
			index += 1;
			continue;
		}
		if (char === "\"" || char === "'" || char === "`") {
			quote = char;
			continue;
		}
		code[index] = 1;
	}
	return code;
}
