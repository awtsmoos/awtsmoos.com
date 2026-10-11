//B"H
//Boruch Hashem
//Blessed be He

{
const { parseAttributeSelector, matchParsedAttributeSelector } = (typeof module === "object" && module.exports ? require("./CssAttributeSelector.js") : globalThis.Merkava);
const { matchesCssPseudo } = (typeof module === "object" && module.exports ? require("./CssPseudoMatcher.js") : globalThis.Merkava);
const { splitSelectorList, tokenizeSelectorSequence, isCombinator } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
const scanner = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);

/**
 * B"H 2026-10-09 — compiled selector matching.
 *
 * The old path re-parsed every compound selector string on EVERY match:
 * per element x per candidate rule it re-scanned characters, rebuilt
 * identifier strings char-by-char, re-balanced brackets, re-parsed
 * attribute bodies, and Object.freeze()d a pseudo record. This module
 * parses each unique compound ONCE into a small structured record and
 * matches against the record. Bounded caches keep RAM flat.
 *
 * Bloom pre-check: each element's tag/id/classes hash into a 32-bit
 * signature; each compiled compound carries the required bits. One integer
 * AND rejects compounds whose key conjunction can't match, before any
 * string compares. No false negatives by construction (every required key
 * sets its bit; the element sets bits for all its keys).
 */

/** Matches a selector list using executor-owned DOM state and selector algorithms. */
function matchesCssSelector(element, selectorList) {
	if (!element || element.nodeType !== 1) return false;
	return matchesCompiledSelectorList(element, compileSelectorList(selectorList));
}

/** Matches one compound selector string (parse-once via the compound cache). */
function matchesCompoundSelector(element, compound) {
	return matchesCompiledCompound(element, compileCompoundSelector(String(compound || "")), undefined);
}

/**
 * Matches a pre-tokenized selector list (kept for compatibility).
 * `tokenizedList` is an array of token arrays as produced by
 * tokenizeSelectorSequence, one per selector in the list.
 */
function matchesTokenizedSelectorList(element, tokenizedList) {
	if (!element || element.nodeType !== 1) return false;
	for (const tokens of tokenizedList || []) {
		if (!tokens || !tokens.length || tokens.length % 2 === 0) continue;
		if (matchCompiledTokens(element, compileTokenArray(tokens), undefined)) return true;
	}
	return false;
}

/**
 * Matches a compiled selector list. `elKeys` is an optional precomputed
 * elementKeys(element) — the cascade builds one per element so the key
 * signature AND the class words amortize over every candidate rule.
 */
function matchesCompiledSelectorList(element, compiledList, elKeys) {
	if (!element || element.nodeType !== 1) return false;
	let sig, words;
	if (elKeys !== undefined) {
		sig = elKeys.sig;
		words = elKeys.words;
	} else if (compiledList && (compiledList.bloom || compiledList.needsClasses)) {
		const keys = elementKeys(element);
		sig = keys.sig;
		words = keys.words;
	}
	for (let i = 0; i < compiledList.length; i++) {
		if (matchCompiledTokens(element, compiledList[i], sig, words)) return true;
	}
	return false;
}

/** Matches one compiled token array (compounds + string combinators), right to left. */
function matchCompiledTokens(element, tokens, sig, words) {
	const n = tokens.length;
	if (!n || n % 2 === 0) return false;
	if (!matchesCompiledCompound(element, tokens[n - 1], sig, words)) return false;
	if (n === 1) return true;
	return matchCompiledRest(element, tokens, n - 3);
}

/** Walks leftward through combinators; `at` indexes the next compound to test. */
function matchCompiledRest(element, tokens, at) {
	const compound = tokens[at];
	const combinator = tokens[at + 1];
	if (combinator === ">") {
		const parent = parentElement(element);
		if (!parent || !matchesCompiledCompound(parent, compound, undefined, undefined)) return false;
		return at === 0 || matchCompiledRest(parent, tokens, at - 2);
	}
	if (combinator === "+") {
		const prev = previousElement(element);
		if (!prev || !matchesCompiledCompound(prev, compound, undefined, undefined)) return false;
		return at === 0 || matchCompiledRest(prev, tokens, at - 2);
	}
	if (combinator === "~") {
		for (let sibling = previousElement(element); sibling; sibling = previousElement(sibling)) {
			if (matchesCompiledCompound(sibling, compound, undefined, undefined) &&
				(at === 0 || matchCompiledRest(sibling, tokens, at - 2))) return true;
		}
		return false;
	}
	for (let parent = parentElement(element); parent; parent = parentElement(parent)) {
		if (matchesCompiledCompound(parent, compound, undefined, undefined) &&
			(at === 0 || matchCompiledRest(parent, tokens, at - 2))) return true;
	}
	return false;
}

/**
 * Matches one compiled compound. Field checks run cheapest-first:
 * bloom key conjunction, tag, id, classes, attributes, pseudos.
 * `sig` is the element's key signature (or undefined to skip the bloom
 * check); `words` is the element's pre-split class words (or undefined to
 * split on demand). Ancestor/sibling levels pass undefined for both.
 */
function matchesCompiledCompound(element, c, sig, words) {
	if (c.never) return false;
	if (sig !== undefined && c.keySig !== 0 && ((c.keySig & ~sig) | 0) !== 0) return false;
	if (c.tag !== null && element.localName !== c.tag) return false;
	const ids = c.ids;
	if (ids !== null) {
		const elementId = element.id;
		for (let i = 0; i < ids.length; i++) {
			if (elementId !== ids[i]) return false;
		}
	}
	const classes = c.classes;
	if (classes !== null) {
		// B"H 2026-10-09: the classList presence check preserves the old
		// `?.` no-match semantics; the words themselves come from the
		// pre-split className (same derivation both classList
		// implementations use), so one split serves every class.
		if (!element.classList) return false;
		const w = words !== undefined ? words : classWords(element);
		for (let i = 0; i < classes.length; i++) {
			if (w.indexOf(classes[i]) < 0) return false;
		}
	}
	const attrs = c.attrs;
	if (attrs !== null) {
		for (let i = 0; i < attrs.length; i++) {
			if (!matchParsedAttributeSelector(element, attrs[i])) return false;
		}
	}
	const pseudos = c.pseudos;
	if (pseudos !== null) {
		for (let i = 0; i < pseudos.length; i++) {
			const pseudo = pseudos[i];
			if (pseudo.compiled !== null) {
				const hit = matchesCompiledSelectorList(element, pseudo.compiled);
				if (pseudo.negated ? hit : !hit) return false;
			} else if (!matchesCssPseudo(element, pseudo.name, pseudo.argument, compiledSelectorCallback)) {
				return false;
			}
		}
	}
	return true;
}

/** Callback for functional pseudo-classes: compiles selector strings once via the list cache. */
function compiledSelectorCallback(element, selector) {
	return matchesCompiledSelectorList(element, compileSelectorList(selector));
}

// ---------------------------------------------------------------------------
// Compilation (parse once, match many)
// ---------------------------------------------------------------------------

const SELECTOR_LIST_CACHE = new Map();
const SELECTOR_LIST_CACHE_MAX = 2048;
const COMPOUND_CACHE = new Map();
const COMPOUND_CACHE_MAX = 4096;

/**
 * Compiles a selector list string into an array of compiled token arrays.
 * Cached by source string (bounded). The returned array carries a `bloom`
 * flag: whether building an element key signature is worthwhile.
 */
function compileSelectorList(source) {
	const key = String(source || "");
	let compiled = SELECTOR_LIST_CACHE.get(key);
	if (compiled === undefined) {
		compiled = splitSelectorList(key).map(compileTokenArray);
		compiled.bloom = compiled.length > 1 ||
			compiled.some(tokens => tokens.length > 0 && tokens[tokens.length - 1].keyCount >= 3);
		compiled.needsClasses = compiled.some(tokens =>
			tokens.length > 0 && tokens[tokens.length - 1].classes !== null);
		if (SELECTOR_LIST_CACHE.size >= SELECTOR_LIST_CACHE_MAX) {
			SELECTOR_LIST_CACHE.delete(SELECTOR_LIST_CACHE.keys().next().value);
		}
		SELECTOR_LIST_CACHE.set(key, compiled);
	}
	return compiled;
}

/** Compiles one complex selector string into compounds + combinator strings. */
function compileTokenArray(selector) {
	const tokens = tokenizeSelectorSequence(selector);
	const out = new Array(tokens.length);
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		out[i] = isCombinator(token) ? token : compileCompoundSelector(token);
	}
	return out;
}

/** Compiles one compound selector string into a match record (bounded cache). */
function compileCompoundSelector(compound) {
	const key = String(compound || "");
	let compiled = COMPOUND_CACHE.get(key);
	if (compiled === undefined) {
		compiled = compileCompoundUncached(key);
		if (COMPOUND_CACHE.size >= COMPOUND_CACHE_MAX) {
			COMPOUND_CACHE.delete(COMPOUND_CACHE.keys().next().value);
		}
		COMPOUND_CACHE.set(key, compiled);
	}
	return compiled;
}

/**
 * Parses a compound into { tag, ids, classes, attrs, pseudos, keySig,
 * keyCount, never }. Mirrors the old matchesCompoundSelector semantics
 * exactly: type selector lowercased, id/class case-sensitive, attribute
 * bodies pre-parsed, pseudo-elements and malformed compounds mark `never`.
 */
function compileCompoundUncached(source) {
	const record = {
		tag: null, ids: null, classes: null, attrs: null, pseudos: null,
		keySig: 0, keyCount: 0, never: false
	};
	let ids = null, classes = null, attrs = null, pseudos = null;
	let at = 0;
	const n = source.length;
	if (at < n && source[at] === "*") {
		at += 1;
	} else if (at < n && isTypeStart(source[at])) {
		const type = scanner.readSelectorIdentifier(source, at);
		record.tag = type.value.toLowerCase();
		record.keySig |= keyBit(record.tag);
		record.keyCount += 1;
		at = type.end;
	}
	while (at < n && !record.never) {
		const marker = source[at];
		if (marker === "#" || marker === ".") {
			const name = scanner.readSelectorIdentifier(source, at + 1);
			if (!name.value) { record.never = true; break; }
			if (marker === "#") {
				(ids || (ids = [])).push(name.value);
			} else {
				(classes || (classes = [])).push(name.value);
			}
			record.keySig |= keyBit(name.value);
			record.keyCount += 1;
			at = name.end;
			continue;
		}
		if (marker === "[") {
			const attribute = scanner.readBalancedSelector(source, at, "[", "]");
			const parsed = parseAttributeSelector(attribute.body);
			if (!parsed) { record.never = true; break; }
			(attrs || (attrs = [])).push(parsed);
			at = attribute.end;
			continue;
		}
		if (marker === ":") {
			const pseudo = readPseudo(source, at);
			if (pseudo.element) { record.never = true; break; }
			let compiled = null, negated = false;
			if (pseudo.name === "is" || pseudo.name === "where" || pseudo.name === "not") {
				negated = pseudo.name === "not";
				compiled = compileSelectorList(pseudo.argument);
			}
			(pseudos || (pseudos = [])).push({
				name: pseudo.name, argument: pseudo.argument, compiled, negated
			});
			at = pseudo.end;
			continue;
		}
		record.never = true;
	}
	record.keySig |= 0;
	record.ids = ids;
	record.classes = classes;
	record.attrs = attrs;
	record.pseudos = pseudos;
	return record;
}

function readPseudo(source, at) {
	const element = source[at + 1] === ":";
	const nameStart = at + (element ? 2 : 1);
	const name = scanner.readSelectorIdentifier(source, nameStart);
	if (source[name.end] !== "(") {
		return { argument: "", element, end: name.end, name: name.value.toLowerCase() };
	}
	const argument = scanner.readBalancedSelector(source, name.end, "(", ")");
	return { argument: argument.body, element, end: argument.end, name: name.value.toLowerCase() };
}

// ---------------------------------------------------------------------------
// Bloom filter: element key signature
// ---------------------------------------------------------------------------

function fnv1a32(text) {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return hash >>> 0;
}

function keyBit(key) {
	return (1 << (fnv1a32(key) & 31)) | 0;
}

/**
 * Builds the 32-bit key signature AND the pre-split class words for one
 * element, from its live tag, id, and className — the same properties the
 * matcher reads, so a required key can never be missing (no false
 * negatives) and the words match what classList.contains() derives.
 * One call serves the bloom pre-check and every class test for the element.
 */
function elementKeys(element) {
	if (!element) return { sig: 0, words: [] };
	let sig = 0;
	const tag = element.localName;
	if (tag) sig |= keyBit(tag);
	const id = element.id;
	if (id) sig |= keyBit(id);
	let words = [];
	let classAttr = element.className;
	if (classAttr == null) classAttr = (element.attributes && element.attributes.class) || "";
	if (classAttr) {
		words = String(classAttr).split(/\s+/);
		for (let i = 0; i < words.length; i++) {
			if (words[i]) sig |= keyBit(words[i]);
		}
	}
	return { sig: sig | 0, words };
}

/** 32-bit key signature for one element (see elementKeys). */
function elementKeySignature(element) {
	return elementKeys(element).sig;
}

/**
 * Pre-split class words for one element (same split classList.contains()
 * derives from). Used when no precomputed words were threaded in.
 */
function classWords(element) {
	let classAttr = element.className;
	if (classAttr == null) classAttr = (element.attributes && element.attributes.class) || "";
	if (!classAttr) return [];
	return String(classAttr).split(/\s+/);
}

// ---------------------------------------------------------------------------
// DOM traversal helpers
// ---------------------------------------------------------------------------

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

const AwtsExports = {
	classWords,
	compileCompoundSelector,
	compileSelectorList,
	elementKeySignature,
	elementKeys,
	matchesCompiledCompound,
	matchesCompiledSelectorList,
	matchesCompoundSelector,
	matchesCssSelector,
	matchesTokenizedSelectorList
};
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
