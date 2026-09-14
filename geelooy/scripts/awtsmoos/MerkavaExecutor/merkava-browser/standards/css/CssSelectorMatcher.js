//B"H
//Boruch Hashem
//Blessed be He

{
const { matchesAttributeSelector } = (typeof module === "object" && module.exports ? require("./CssAttributeSelector.js") : globalThis.Merkava);
const { matchesCssPseudo } = (typeof module === "object" && module.exports ? require("./CssPseudoMatcher.js") : globalThis.Merkava);
const { splitSelectorList, tokenizeSelectorSequence } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const scanner = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);

/** Matches a selector list using executor-owned DOM state and selector algorithms. */
function matchesCssSelector(element, selectorList) {
	if (!element || element.nodeType !== 1) return false;
	return splitSelectorList(selectorList).some(selector => matchesComplexSelector(element, selector));
}

/** Matches one complex selector from the rightmost compound toward its ancestry. */
function matchesComplexSelector(element, selector) {
	const tokens = tokenizeSelectorSequence(selector);
	if (!tokens.length || tokens.length % 2 === 0) return false;
	return matchFromRight(element, tokens, tokens.length - 1);
}

function matchFromRight(element, tokens, at) {
	if (!element || !matchesCompoundSelector(element, tokens[at])) return false;
	if (at === 0) return true;
	const combinator = tokens[at - 1];
	if (combinator === ">") return matchFromRight(parentElement(element), tokens, at - 2);
	if (combinator === "+") return matchFromRight(previousElement(element), tokens, at - 2);
	if (combinator === "~") {
		for (let sibling = previousElement(element); sibling; sibling = previousElement(sibling)) {
			if (matchFromRight(sibling, tokens, at - 2)) return true;
		}
		return false;
	}
	for (let parent = parentElement(element); parent; parent = parentElement(parent)) {
		if (matchFromRight(parent, tokens, at - 2)) return true;
	}
	return false;
}

/** Matches one compound selector with type, id, class, attributes, and pseudos. */
function matchesCompoundSelector(element, compound) {
	const source = String(compound || "");
	let at = 0;
	if (source[at] === "*") at += 1;
	else if (isTypeStart(source[at])) {
		const type = scanner.readSelectorIdentifier(source, at);
		if (element.localName !== type.value.toLowerCase()) return false;
		at = type.end;
	}
	while (at < source.length) {
		const marker = source[at];
		if (marker === "#" || marker === ".") {
			const name = scanner.readSelectorIdentifier(source, at + 1);
			if (!name.value) return false;
			if (marker === "#" && element.id !== name.value) return false;
			if (marker === "." && !element.classList?.contains(name.value)) return false;
			at = name.end;
			continue;
		}
		if (marker === "[") {
			const attribute = scanner.readBalancedSelector(source, at, "[", "]");
			if (!matchesAttributeSelector(element, attribute.body)) return false;
			at = attribute.end;
			continue;
		}
		if (marker === ":") {
			const pseudo = readPseudo(source, at);
			if (pseudo.element || !matchesCssPseudo(element, pseudo.name, pseudo.argument, matchesCssSelector)) return false;
			at = pseudo.end;
			continue;
		}
		return false;
	}
	return true;
}

function readPseudo(source, at) {
	const element = source[at + 1] === ":";
	const nameStart = at + (element ? 2 : 1);
	const name = scanner.readSelectorIdentifier(source, nameStart);
	if (source[name.end] !== "(") {
		return Object.freeze({ argument: "", element, end: name.end, name: name.value.toLowerCase() });
	}
	const argument = scanner.readBalancedSelector(source, name.end, "(", ")");
	return Object.freeze({ argument: argument.body, element, end: argument.end, name: name.value.toLowerCase() });
}

function parentElement(element) {
	let parent = element.parentNode;
	while (parent && parent.nodeType !== 1) parent = parent.parentNode;
	return parent || null;
}

function previousElement(element) {
	let sibling = element.previousSibling;
	while (sibling && sibling.nodeType !== 1) sibling = sibling.previousSibling;
	return sibling || null;
}

function isTypeStart(character) {
	if (!character) return false;
	const code = character.codePointAt(0);
	return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 0x80;
}

const AwtsExports = { matchesCompoundSelector, matchesCssSelector };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
