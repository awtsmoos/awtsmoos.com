//B"H
//Boruch Hashem
//Blessed be He

{
/** Returns whether a character is CSS whitespace. */
function isCssWhitespace(character) {
	return character === " " || character === "\n" || character === "\r" || character === "\t" || character === "\f";
}

/** Returns whether a character may participate in an identifier name. */
function isCssNameCharacter(character) {
	if (!character) return false;
	const code = character.codePointAt(0);
	return character === "-" || character === "_" || code >= 0x80 || isAsciiLetter(code) || isDigit(code);
}

/** Returns whether a source position begins an identifier-like name. */
function startsCssName(text, at) {
	const character = text[at] || "";
	if (character === "\\") return Boolean(text[at + 1]);
	if (character === "-" || character === "_") return true;
	return isCssNameCharacter(character) && !isDigit(character.codePointAt(0));
}

/** Returns whether a source position begins a CSS number. */
function startsCssNumber(text, at) {
	const first = text[at] || "";
	const second = text[at + 1] || "";
	const third = text[at + 2] || "";
	if (first === "+" || first === "-") {
		return isDigitCharacter(second) || second === "." && isDigitCharacter(third);
	}
	return isDigitCharacter(first) || first === "." && isDigitCharacter(second);
}

/** Consumes a CSS number and returns its numeric value plus ending offset. */
function consumeCssNumber(text, at) {
	let index = at;
	if (text[index] === "+" || text[index] === "-") index += 1;
	while (isDigitCharacter(text[index])) index += 1;
	if (text[index] === "." && isDigitCharacter(text[index + 1])) {
		index += 1;
		while (isDigitCharacter(text[index])) index += 1;
	}
	const marker = text[index];
	const sign = text[index + 1];
	const digitAt = sign === "+" || sign === "-" ? index + 2 : index + 1;
	if ((marker === "e" || marker === "E") && isDigitCharacter(text[digitAt])) {
		index = digitAt;
		while (isDigitCharacter(text[index])) index += 1;
	}
	return { end: index, value: Number(text.slice(at, index)) };
}

function isDigitCharacter(character) {
	return Boolean(character) && isDigit(character.codePointAt(0));
}

function isDigit(code) {
	return code >= 48 && code <= 57;
}

function isAsciiLetter(code) {
	return code >= 65 && code <= 90 || code >= 97 && code <= 122;
}

const AwtsExports = {
	consumeCssNumber,
	isCssNameCharacter,
	isCssWhitespace,
	startsCssName,
	startsCssNumber
};
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
