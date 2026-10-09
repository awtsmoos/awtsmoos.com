//B"H
//Boruch Hashem
//Blessed be He

{
const { splitSelectorList, tokenizeSelectorSequence, isCombinator } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const { readSelectorIdentifier, readBalancedSelector } = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);
const { matchesTokenizedSelectorList, matchesCssSelector } = (typeof module === "object" && module.exports ? require("./CssSelectorMatcher.js") : globalThis.Merkava);

/**
 * Chrome-style CSS rule index (B"H 2026-10-09).
 *
 * Each rule is filed under the id/class/tag keys of its rightmost compound
 * selector, so per-element matching only tests rules that could possibly
 * match instead of scanning every rule. Rules whose rightmost compound
 * carries no indexable key (universal, bare attribute, bare pseudo) live in
 * the universal bucket, always checked.
 *
 * Correctness: iteration order never affects cascade results — winners are
 * picked by specificity/source order, never by bucket order. A selector list
 * matches when ANY of its selectors matches, so a rule is filed under every
 * selector's keys; nothing that could match is ever skipped.
 */

/** Builds the index for one rules array. Rules are referenced, never copied. */
function buildCssRuleIndex(rules) {
	const index = {
		byId: Object.create(null),
		byClass: Object.create(null),
		byTag: Object.create(null),
		universal: [],
		selectorTokens: new Map(),
	};
	for (const rule of rules || []) {
		if (!rule || typeof rule.selector !== "string") {
			index.universal.push(rule);
			continue;
		}
		const selectors = splitSelectorList(rule.selector);
		index.selectorTokens.set(rule, selectors.map(tokenizeSelectorSequence));
		let filed = false;
		for (const selector of selectors) {
			if (fileCssRule(index, rule, selector)) filed = true;
		}
		if (!filed) index.universal.push(rule);
	}
	return index;
}

function fileCssRule(index, rule, selector) {
	const compound = rightmostCompound(selector);
	if (!compound) return false;
	const keys = indexKeysForCompound(compound);
	if (!keys) return false;
	let filed = false;
	for (const id of keys.ids) {
		(index.byId[id] || (index.byId[id] = [])).push(rule);
		filed = true;
	}
	for (const cls of keys.classes) {
		(index.byClass[cls] || (index.byClass[cls] = [])).push(rule);
		filed = true;
	}
	if (keys.tag) {
		(index.byTag[keys.tag] || (index.byTag[keys.tag] = [])).push(rule);
		filed = true;
	}
	return filed;
}

/** Rightmost compound of a complex selector: the part matched against the element itself. */
function rightmostCompound(selector) {
	const tokens = tokenizeSelectorSequence(selector);
	for (let i = tokens.length - 1; i >= 0; i--) {
		const token = tokens[i];
		if (token && !isCombinator(token)) return token;
	}
	return "";
}

/**
 * Extracts index keys from a compound selector, reading only the top level.
 * Anything inside functional pseudo-class arguments (:not(), :is(),
 * :where(), :has()) is skipped: a negated or scoped key must NOT narrow the
 * candidate set, or matching elements would be missed. Returns null when the
 * compound carries no id/class/type constraint.
 */
function indexKeysForCompound(compound) {
	const ids = [];
	const classes = [];
	let tag = null;
	let i = 0;
	const n = compound.length;
	if (n > 0 && compound[0] === "*") {
		i = 1;
	} else if (n > 0 && isCompoundNameStart(compound[0])) {
		const name = readSelectorIdentifier(compound, 0);
		if (!name.value) return null;
		tag = name.value.toLowerCase();
		i = name.end;
	}
	while (i < n) {
		const ch = compound[i];
		if (ch === "#") {
			const name = readSelectorIdentifier(compound, i + 1);
			if (!name.value) return null;
			ids.push(name.value);
			i = name.end;
		} else if (ch === ".") {
			const name = readSelectorIdentifier(compound, i + 1);
			if (!name.value) return null;
			classes.push(name.value);
			i = name.end;
		} else if (ch === "[") {
			i = readBalancedSelector(compound, i, "[", "]").end;
		} else if (ch === ":") {
			i = skipCompoundPseudo(compound, i);
			if (i < 0) return null;
		} else {
			return null;
		}
	}
	if (!ids.length && !classes.length && !tag) return null;
	return { classes, ids, tag };
}

/** Skips one pseudo-class/element including any parenthesized argument. Returns -1 on malformed input. */
function skipCompoundPseudo(compound, at) {
	let i = at + (compound[at + 1] === ":" ? 2 : 1);
	const name = readSelectorIdentifier(compound, i);
	if (!name.value) return -1;
	i = name.end;
	if (compound[i] === "(") i = readBalancedSelector(compound, i, "(", ")").end;
	return i;
}

function isCompoundNameStart(ch) {
	if (!ch) return false;
	const code = ch.codePointAt(0);
	return (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code >= 0x80 || ch === "_";
}

/**
 * Collects candidate rules for one element: union of its id/class/tag
 * buckets plus the universal bucket, deduplicated.
 */
function cssRuleCandidates(index, node) {
	const seen = new Set();
	const out = [];
	const add = (rule) => {
		if (!seen.has(rule)) {
			seen.add(rule);
			out.push(rule);
		}
	};
	for (const rule of index.universal) add(rule);
	const id = node.id;
	if (id) {
		const bucket = index.byId[id];
		if (bucket) for (const rule of bucket) add(rule);
	}
	const tag = node.localName;
	if (tag) {
		const bucket = index.byTag[tag];
		if (bucket) for (const rule of bucket) add(rule);
	}
	const classAttr = node.className != null ? String(node.className) : String((node.attributes && node.attributes.class) || "");
	if (classAttr) {
		const classes = classAttr.split(/\s+/);
		for (const cls of classes) {
			if (!cls) continue;
			const bucket = index.byClass[cls];
			if (bucket) for (const rule of bucket) add(rule);
		}
	}
	return out;
}

/**
 * Tests one indexed rule using its pre-tokenized selectors.
 * Identical result to matchesCssSelector(node, rule.selector).
 */
function matchesIndexedCssRule(node, rule, index) {
	const tokenized = index.selectorTokens.get(rule);
	if (tokenized) return matchesTokenizedSelectorList(node, tokenized);
	return matchesCssSelector(node, rule.selector);
}

const AwtsExports = { buildCssRuleIndex, cssRuleCandidates, matchesIndexedCssRule };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
