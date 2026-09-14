//B"H
//Boruch Hashem
//Blessed be He

{
/** Matches one attribute-selector body against a virtual element. */
function matchesAttributeSelector(element, source) {
	const parsed = parseAttributeSelector(source);
	if (!parsed) return false;
	const value = element.getAttribute?.(parsed.name);
	if (value == null) return !parsed.operator ? element.hasAttribute?.(parsed.name) === true : false;
	if (!parsed.operator) return true;
	const actual = parsed.insensitive ? String(value).toLowerCase() : String(value);
	const expected = parsed.insensitive ? parsed.value.toLowerCase() : parsed.value;
	if (parsed.operator === "=") return actual === expected;
	if (parsed.operator === "~=") return actual.splitCssWhitespace?.().includes(expected) || splitWhitespace(actual).includes(expected);
	if (parsed.operator === "|=") return actual === expected || actual.startsWith(`${expected}-`);
	if (parsed.operator === "^=") return expected !== "" && actual.startsWith(expected);
	if (parsed.operator === "$=") return expected !== "" && actual.endsWith(expected);
	if (parsed.operator === "*=") return expected !== "" && actual.includes(expected);
	return false;
}

/** Parses namespace-free CSS attribute selector syntax and comparison flags. */
function parseAttributeSelector(source) {
	const text = String(source || "").trim();
	let at = 0;
	const name = readName(text, at);
	if (!name.value) return null;
	at = skipSpace(text, name.end);
	const operator = readOperator(text, at);
	if (!operator.value) {
		return Object.freeze({ insensitive: false, name: name.value.toLowerCase(), operator: "", value: "" });
	}
	at = skipSpace(text, operator.end);
	const value = readValue(text, at);
	at = skipSpace(text, value.end);
	const flag = String(text[at] || "").toLowerCase();
	return Object.freeze({
		insensitive: flag === "i",
		name: name.value.toLowerCase(),
		operator: operator.value,
		value: value.value
	});
}

function readOperator(text, at) {
	for (const operator of ["~=", "|=", "^=", "$=", "*=", "="]) {
		if (text.startsWith(operator, at)) return { end: at + operator.length, value: operator };
	}
	return { end: at, value: "" };
}

function readValue(text, at) {
	const quote = text[at];
	if (quote === '"' || quote === "'") {
		let value = "";
		for (let index = at + 1; index < text.length; index += 1) {
			if (text[index] === quote) return { end: index + 1, value };
			if (text[index] === "\\" && index + 1 < text.length) index += 1;
			value += text[index];
		}
		return { end: text.length, value };
	}
	const result = readName(text, at);
	return { end: result.end, value: result.value };
}

function readName(text, at) {
	let index = at;
	while (index < text.length && !isSpace(text[index]) && !"~=|^$*".includes(text[index])) index += 1;
	return { end: index, value: text.slice(at, index) };
}

function skipSpace(text, at) {
	let index = at;
	while (isSpace(text[index])) index += 1;
	return index;
}

function splitWhitespace(text) {
	const result = [];
	let word = "";
	for (const character of text) {
		if (isSpace(character)) {
			if (word) result.push(word);
			word = "";
		} else word += character;
	}
	if (word) result.push(word);
	return result;
}

function isSpace(character) {
	return character === " " || character === "\n" || character === "\r" || character === "\t" || character === "\f";
}

const AwtsExports = { matchesAttributeSelector, parseAttributeSelector };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
