//B"H
//Boruch Hashem
//Blessed be He

{
const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const scanner = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);

/** Computes Selectors specificity as the tuple [ids, classes, types]. */
function cssSpecificity(selector) {
	const total = [0, 0, 0];
	const source = String(selector || "");
	for (let at = 0; at < source.length;) {
		const character = source[at];
		if (character === "#") {
			total[0] += 1;
			at = scanner.readSelectorIdentifier(source, at + 1).end;
			continue;
		}
		if (character === "." || character === "[") {
			total[1] += 1;
			at = character === "[" ? scanner.readBalancedSelector(source, at, "[", "]").end : scanner.readSelectorIdentifier(source, at + 1).end;
			continue;
		}
		if (character === ":") {
			const pseudo = consumePseudo(source, at);
			addPseudoSpecificity(total, pseudo);
			at = pseudo.end;
			continue;
		}
		if (isTypeStart(source, at)) {
			total[2] += 1;
			at = scanner.readSelectorIdentifier(source, at).end;
			continue;
		}
		at += 1;
	}
	return Object.freeze(total);
}

/** Compares two specificity tuples using lexicographic CSS ordering. */
function compareSpecificity(left, right) {
	for (let index = 0; index < 3; index += 1) {
		if (left[index] !== right[index]) return left[index] - right[index];
	}
	return 0;
}

function consumePseudo(source, at) {
	const element = source[at + 1] === ":";
	const nameStart = at + (element ? 2 : 1);
	const name = scanner.readSelectorIdentifier(source, nameStart);
	if (source[name.end] !== "(") {
		return Object.freeze({ argument: "", element, end: name.end, name: name.value.toLowerCase() });
	}
	const body = scanner.readBalancedSelector(source, name.end, "(", ")");
	return Object.freeze({ argument: body.body, element, end: body.end, name: name.value.toLowerCase() });
}

function addPseudoSpecificity(total, pseudo) {
	if (pseudo.element) {
		total[2] += 1;
		return;
	}
	if (pseudo.name === "where") return;
	if (pseudo.name === "is" || pseudo.name === "not" || pseudo.name === "has") {
		addTuple(total, maximumSpecificity(pseudo.argument));
		return;
	}
	total[1] += 1;
	if ((pseudo.name === "nth-child" || pseudo.name === "nth-last-child") && pseudo.argument) {
		const of = scanner.findTopLevelWord(pseudo.argument, "of");
		if (of >= 0) addTuple(total, maximumSpecificity(pseudo.argument.slice(of + 2)));
	}
}

function maximumSpecificity(selectorList) {
	let maximum = [0, 0, 0];
	for (const selector of splitSelectorList(selectorList)) {
		const current = cssSpecificity(selector);
		if (compareSpecificity(current, maximum) > 0) maximum = [...current];
	}
	return maximum;
}

function addTuple(target, value) {
	for (let index = 0; index < 3; index += 1) target[index] += value[index];
}

function isTypeStart(source, at) {
	const character = source[at] || "";
	if (character === "*" || character === "|" || character === "&") return false;
	const before = source[at - 1] || " ";
	if (before === "#" || before === "." || before === ":") return false;
	const code = character.codePointAt(0);
	return code >= 65 && code <= 90 || code >= 97 && code <= 122 || code >= 0x80;
}

const AwtsExports = { compareSpecificity, cssSpecificity };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
