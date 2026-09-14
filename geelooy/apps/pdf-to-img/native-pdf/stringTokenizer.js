//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file stringTokenizer.js
 * @description
 * Decodes PDF lexical literal and hexadecimal strings into Latin-1 byte strings.
 * Nested parentheses, escaped delimiters, octal escapes, and escaped line endings
 * are handled before any later font/text interpretation occurs.
 */

/**
 * Reads a PDF literal string after its opening parenthesis.
 *
 * @param {string} source Latin-1 PDF syntax.
 * @param {number} index Cursor after `(`.
 * @returns {{value:string,index:number}} Decoded byte string and next cursor.
 */
export function readLiteralString(source, index) {
	let depth = 1;
	let value = "";
	while (index < source.length && depth > 0) {
		const char = source[index++];
		if (char === "\\") {
			const escaped = readEscape(source, index);
			value += escaped.value;
			index = escaped.index;
			continue;
		}
		if (char === "(") {
			depth += 1;
			value += char;
			continue;
		}
		if (char === ")") {
			depth -= 1;
			if (depth > 0) value += char;
			continue;
		}
		value += char;
	}
	if (depth !== 0) throw new Error("unterminated_pdf_string");
	return { value, index };
}

/**
 * Reads a hexadecimal PDF string after `<` and converts pairs to bytes.
 *
 * @param {string} source Latin-1 source.
 * @param {number} index Cursor after `<`.
 * @returns {{value:string,index:number}} Byte string and next cursor.
 */
export function readHexString(source, index) {
	let hex = "";
	while (index < source.length && source[index] !== ">") {
		if (!/\s/.test(source[index])) hex += source[index];
		index += 1;
	}
	if (source[index] !== ">") throw new Error("unterminated_pdf_hex_string");
	index += 1;
	if (hex.length % 2) hex += "0";
	let value = "";
	for (let offset = 0; offset < hex.length; offset += 2) {
		value += String.fromCharCode(parseInt(hex.slice(offset, offset + 2), 16) || 0);
	}
	return { value, index };
}

/** @param {string} source Source. @param {number} index Cursor after slash. @returns {{value:string,index:number}} */
function readEscape(source, index) {
	const char = source[index++] || "";
	const named = {
		n: "\n",
		r: "\r",
		t: "\t",
		b: "\b",
		f: "\f",
		"(": "(",
		")": ")",
		"\\": "\\"
	};
	if (Object.prototype.hasOwnProperty.call(named, char)) {
		return { value: named[char], index };
	}
	if (char === "\r" || char === "\n") {
		if (char === "\r" && source[index] === "\n") index += 1;
		return { value: "", index };
	}
	if (/[0-7]/.test(char)) {
		let octal = char;
		while (octal.length < 3 && /[0-7]/.test(source[index] || "")) {
			octal += source[index++];
		}
		return { value: String.fromCharCode(parseInt(octal, 8)), index };
	}
	return { value: char, index };
}
