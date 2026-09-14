//B"H
//Boruch Hashem
//Blessed be He

{
const { matchesNth, parseNthExpression } = (typeof module === "object" && module.exports ? require("./CssNthExpression.js") : globalThis.Merkava);
const { findTopLevelWord } = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);
const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
/** Matches one pseudo-class against current DOM state and structural context. */
function matchesCssPseudo(element, name, argument, matchesSelector) {
	if (name === "focus") return element.ownerDocument?.activeElement === element;
	if (name === "root") return element.ownerDocument?.documentElement === element;
	if (name === "checked") return Boolean(element.checked || element.selected);
	if (name === "disabled") return Boolean(element.disabled);
	if (name === "enabled") return !element.disabled;
	if (name === "empty") return isEmpty(element);
	if (name === "first-child") return childIndex(element) === 1;
	if (name === "last-child") return childIndexFromEnd(element) === 1;
	if (name === "only-child") return elementSiblings(element).length === 1;
	if (name === "first-of-type") return typeIndex(element) === 1;
	if (name === "last-of-type") return typeIndexFromEnd(element) === 1;
	if (name === "only-of-type") return typeSiblings(element).length === 1;
	if (name === "is" || name === "where") return matchesAny(element, argument, matchesSelector);
	if (name === "not") return !matchesAny(element, argument, matchesSelector);
	if (name === "has") return matchesHas(element, argument, matchesSelector);
	if (name.startsWith("nth-")) return matchesStructuralNth(element, name, argument, matchesSelector);
	return false;
}

function matchesStructuralNth(element, name, argument, matchesSelector) {
	const split = findTopLevelWord(argument, "of");
	const expressionText = split < 0 ? argument : argument.slice(0, split);
	const filter = split < 0 ? "" : argument.slice(split + 2).trim();
	let siblings = name.includes("of-type") ? typeSiblings(element) : elementSiblings(element);
	if (filter) siblings = siblings.filter(item => matchesSelector(item, filter));
	const rawIndex = siblings.indexOf(element);
	if (rawIndex < 0) return false;
	const reverse = name === "nth-last-child" || name === "nth-last-of-type";
	const index = reverse ? siblings.length - rawIndex : rawIndex + 1;
	return matchesNth(index, parseNthExpression(expressionText));
}

function matchesAny(element, argument, matchesSelector) {
	return splitSelectorList(argument).some(selector => matchesSelector(element, selector));
}

function matchesHas(element, argument, matchesSelector) {
	for (const selector of splitSelectorList(argument)) {
		const clean = selector.trim();
		if (clean.startsWith(">")) {
			if (elementSiblingsOf(element).some(child => matchesSelector(child, clean.slice(1).trim()))) return true;
			continue;
		}
		if (clean.startsWith("+")) return Boolean(element.nextSibling && matchesSelector(element.nextSibling, clean.slice(1).trim()));
		if (clean.startsWith("~")) {
			for (let sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
				if (matchesSelector(sibling, clean.slice(1).trim())) return true;
			}
			continue;
		}
		if (descendants(element).some(child => matchesSelector(child, clean))) return true;
	}
	return false;
}

function descendants(element) {
	const result = [];
	const visit = node => {
		for (const child of node.children || []) {
			if (child.nodeType === 1) result.push(child);
			visit(child);
		}
	};
	visit(element);
	return result;
}

function isEmpty(element) {
	return !(element.children || []).some(child => child.nodeType === 1 || child.nodeType === 3 && child.textContent);
}

function elementSiblings(element) {
	return (element.parentNode?.children || []).filter(child => child.nodeType === 1);
}

function elementSiblingsOf(element) {
	return (element.children || []).filter(child => child.nodeType === 1);
}

function typeSiblings(element) {
	return elementSiblings(element).filter(child => child.localName === element.localName);
}

function childIndex(element) {
	return elementSiblings(element).indexOf(element) + 1;
}

function childIndexFromEnd(element) {
	const siblings = elementSiblings(element);
	return siblings.length - siblings.indexOf(element);
}

function typeIndex(element) {
	return typeSiblings(element).indexOf(element) + 1;
}

function typeIndexFromEnd(element) {
	const siblings = typeSiblings(element);
	return siblings.length - siblings.indexOf(element);
}

const AwtsExports = { matchesCssPseudo };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
