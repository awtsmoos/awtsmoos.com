//B"H
//Boruch Hashem
//Blessed be He

{
const { splitSelectorList, tokenizeSelectorSequence, isCombinator } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const { readSelectorIdentifier, readBalancedSelector } = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);
const { compileSelectorList, matchesCompiledSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorMatcher.js") : globalThis.Merkava);

/**
 * Chrome-style CSS rule index (B"H 2026-10-09).
 *
 * Each selector is filed under its SINGLE most selective key (id > class >
 * tag) from its rightmost compound, so per-element matching only tests
 * rules that could possibly match instead of scanning every rule. Rules
 * whose rightmost compound carries no indexable key (universal, bare
 * attribute, bare pseudo) live in the universal bucket, always checked.
 *
 * Correctness: a rule can only match an element whose id/tag/classes
 * include the rightmost compound's keys, so the element's own id/tag/class
 * lookups always find the rule's best key. Iteration order never affects
 * cascade results — winners are picked by specificity/source order, never
 * by bucket order. A selector list matches when ANY of its selectors
 * matches, so a rule is filed under every selector's best key; nothing
 * that could match is ever skipped.
 *
 * Single-key filing removes all duplicates, so candidate collection is
 * plain bucket concatenation — no per-element Set/dedup. Rule matching
 * goes through the matcher's global bounded compile cache (parse once per
 * unique selector, shared across stylesheets), so the index holds only
 * buckets — no per-rule token storage.
 */

/** Builds the index for one rules array. Rules are referenced, never copied. */
function buildCssRuleIndex(rules) {
	const index = {
		byId: Object.create(null),
		byClass: Object.create(null),
		byTag: Object.create(null),
		universal: [],
	};
	for (const rule of rules || []) {
		if (!rule || typeof rule.selector !== "string") {
			index.universal.push(rule);
			continue;
		}
		let filed = false;
		for (const selector of splitSelectorList(rule.selector)) {
			if (fileCssRule(index, rule, selector)) filed = true;
		}
		if (!filed) index.universal.push(rule);
	}
	return index;
}

function fileCssRule(index, rule, selector) {
	const compound = rightmostCompound(selector);
	if (!compound) return false;
	const key = bestKeyForCompound(compound);
	if (!key) return false;
	const table = key.kind === "id" ? index.byId : key.kind === "class" ? index.byClass : index.byTag;
	let bucket = table[key.value];
	if (!bucket) {
		bucket = table[key.value] = [];
	} else if (bucket.indexOf(rule) >= 0) {
		return true; // same rule, same key via another selector — already filed
	}
	bucket.push(rule);
	return true;
}

/**
 * Most selective index key of a compound: id beats class beats tag.
 * Reads only the top level — anything inside functional pseudo-class
 * arguments (:not(), :is(), :where(), :has()) is skipped, so a negated or
 * scoped key never narrows the candidate set. Returns null when the
 * compound carries no id/class/type constraint.
 */
function bestKeyForCompound(compound) {
	let id = null, cls = null, tag = null;
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
			if (id === null) id = name.value;
			i = name.end;
		} else if (ch === ".") {
			const name = readSelectorIdentifier(compound, i + 1);
			if (!name.value) return null;
			if (cls === null) cls = name.value;
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
	if (id !== null) return { kind: "id", value: id };
	if (cls !== null) return { kind: "class", value: cls };
	if (tag !== null) return { kind: "tag", value: tag };
	return null;
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
 * Collects candidate rules for one element: universal bucket plus the
 * element's own id/tag/class buckets. Single-key filing guarantees no
 * duplicates, so this is plain concatenation — no Set, no dedup.
 */
function cssRuleCandidates(index, node) {
	const out = [];
	const universal = index.universal;
	for (let i = 0; i < universal.length; i++) out.push(universal[i]);
	const id = node.id;
	if (id) {
		const bucket = index.byId[id];
		if (bucket) for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
	}
	const tag = node.localName;
	if (tag) {
		const bucket = index.byTag[tag];
		if (bucket) for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
	}
	const classAttr = node.className != null ? String(node.className) : String((node.attributes && node.attributes.class) || "");
	if (classAttr) {
		const classes = classAttr.split(/\s+/);
		for (let i = 0; i < classes.length; i++) {
			const cls = classes[i];
			if (!cls) continue;
			const bucket = index.byClass[cls];
			if (bucket) for (let j = 0; j < bucket.length; j++) out.push(bucket[j]);
		}
	}
	return out;
}

/**
 * Tests one indexed rule against a compiled selector (parse-once via the
 * matcher's global cache). `elKeys` is an optional precomputed
 * elementKeys(node) so the bloom pre-check and class words amortize over
 * rules. Identical result to matchesCssSelector(node, rule.selector).
 */
function matchesIndexedCssRule(node, rule, index, elKeys) {
	return matchesCompiledSelectorList(node, compileSelectorList(rule.selector), elKeys);
}

const AwtsExports = { buildCssRuleIndex, cssRuleCandidates, matchesIndexedCssRule };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
