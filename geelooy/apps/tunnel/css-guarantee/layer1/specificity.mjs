//B"H
//Boruch Hashem
//Blessed is He

import { qualityFinding } from "../../../../apps/tests/quality/finding.mjs";

/**
 * @file W3C specificity calculator for the Airtight CSS Guarantee System (Layer 1, check 3).
 * @description Awtsmoos.com suffered specificity wars where the old reader's styles beat the
 * new sefer reader's styles unpredictably. This module computes W3C selector specificity at
 * build time so a maximum budget (default 0,2,1) can cap every selector before deploy.
 *
 * Specificity is a triple {a, b, c}:
 *   a = ID selectors (#id)
 *   b = class selectors (.class), attribute selectors ([attr]), pseudo-classes (:hover)
 *   c = type selectors (div) and pseudo-elements (::before)
 *
 * Universal selector (*) and combinators contribute nothing. :where() contributes 0 (and its
 * arguments contribute nothing); :not(), :is() and :has() take the specificity of their most
 * specific argument. Inline styles are (1,0,0,0) in the cascade but are not selectors, so
 * they are documented here and never produced by calculateSpecificity.
 */

/** Budget enforced by the guarantee system: no selector may exceed any column of this. */
export const DEFAULT_SPECIFICITY_BUDGET = Object.freeze({ a: 0, b: 2, c: 1 });

/** Legacy single-colon pseudo-elements, which count as type-level (c) per the W3C spec. */
const LEGACY_PSEUDO_ELEMENTS = new Set([
	"before",
	"after",
	"first-line",
	"first-letter"
]);

/** Functional pseudo-classes that take the specificity of their most specific argument. */
const MAX_ARGUMENT_PSEUDO_CLASSES = new Set(["not", "is", "has"]);

/**
 * Computes the W3C specificity of one selector string.
 * A comma-separated selector list returns an array of specificities, one per selector.
 * @param {string} selector Selector text (comments are masked before parsing).
 * @returns {{a:number,b:number,c:number}|Array<{a:number,b:number,c:number}>}
 */
export function calculateSpecificity(selector) {
	const parts = splitSelectorList(maskComments(String(selector)));
	const results = parts.map((part) => specificityOfSingle(part));
	return results.length === 1 ? results[0] : results;
}

/**
 * Reports whether a specificity exceeds the budget in ANY column.
 * @param {{a:number,b:number,c:number}} specificity Specificity triple to test.
 * @param {{a:number,b:number,c:number}} [budget] Maximum allowed triple.
 * @returns {boolean} True when any column of specificity is above the budget.
 */
export function exceedsBudget(specificity, budget = DEFAULT_SPECIFICITY_BUDGET) {
	return specificity.a > (budget.a ?? 0)
		|| specificity.b > (budget.b ?? 0)
		|| specificity.c > (budget.c ?? 0);
}

/**
 * Audits CSS sources for selectors whose specificity exceeds the budget.
 * Selector extraction reuses the cssScopeAudit.mjs approach: comments are masked without
 * changing offsets and rule bodies are found with /([^{}]+)\{/g; at-rules are skipped.
 * @param {Array<{path:string,content:string,app?:string}>} sources CSS sources to audit.
 * @param {{a:number,b:number,c:number}} [budget] Maximum allowed triple.
 * @returns {Array<object>} qualityFinding records in category "css-specificity-budget".
 */
export function auditSpecificity(sources, budget = DEFAULT_SPECIFICITY_BUDGET) {
	const findings = [];
	for (const source of sources || []) {
		if (!source || typeof source.content !== "string") {
			continue;
		}
		if (source.path && !/\.css$/i.test(source.path)) {
			continue;
		}
		const record = {
			app: source.app || "css-guarantee",
			relativePath: source.path || "(unknown)",
			content: source.content
		};
		const masked = maskComments(source.content);
		const rulePattern = /([^{}]+)\{/g;
		for (const match of masked.matchAll(rulePattern)) {
			const selectorText = match[1].trim();
			if (!selectorText || selectorText.startsWith("@")) {
				continue;
			}
			// Offset of the trimmed selector list within the raw match text, so the
			// finding line lands on the selector itself rather than preceding whitespace.
			const listOffset = match.index + (match[1].length - match[1].trimStart().length);
			let searchFrom = 0;
			for (const part of splitSelectorList(selectorText)) {
				const selector = part.trim();
				if (!selector || selector.startsWith("@")) {
					continue;
				}
				const relative = selectorText.indexOf(selector, searchFrom);
				const partOffset = relative === -1 ? 0 : relative;
				if (relative !== -1) {
					searchFrom = relative + selector.length;
				}
				const specificity = calculateSpecificity(selector);
				if (exceedsBudget(specificity, budget)) {
					findings.push(qualityFinding(record, {
						category: "css-specificity-budget",
						confidence: "high",
						message: "Selector specificity "
							+ `(${specificity.a},${specificity.b},${specificity.c}) `
							+ "exceeds the guarantee budget "
							+ `(${(budget.a ?? 0)},${(budget.b ?? 0)},${(budget.c ?? 0)}).`,
						offset: listOffset + partOffset,
						severity: "medium",
						snippet: selector
					}));
				}
			}
		}
	}
	return findings;
}

/** Computes specificity for one selector with no top-level commas. */
function specificityOfSingle(selector) {
	let a = 0;
	let b = 0;
	let c = 0;
	const add = (delta) => {
		a += delta.a;
		b += delta.b;
		c += delta.c;
	};
	const text = selector;
	const n = text.length;
	let i = 0;
	while (i < n) {
		while (i < n && /\s/.test(text[i])) {
			i++;
		}
		if (i >= n) {
			break;
		}
		const ch = text[i];
		if (ch === ">" || ch === "+" || ch === "~") {
			i++;
			continue;
		}
		if (ch === "|") {
			i += (text[i + 1] === "|" ? 2 : 1);
			continue;
		}
		if (ch === "#") {
			i = consumeName(text, i + 1);
			a += 1;
			continue;
		}
		if (ch === ".") {
			i = consumeName(text, i + 1);
			b += 1;
			continue;
		}
		if (ch === "[") {
			i = consumeBalanced(text, i, "[", "]");
			b += 1;
			continue;
		}
		if (ch === ":") {
			i = consumePseudo(text, i, add);
			continue;
		}
		if (ch === "*") {
			// Namespace prefix "*|name": the local name decides; "*|*" stays universal.
			if (text[i + 1] === "|" && text[i + 2] !== "|") {
				i += 2;
				if (text[i] === "*") {
					i++;
					continue;
				}
			} else {
				i++;
				continue;
			}
		}
		if (isNameChar(ch) || ch === "\\") {
			const end = consumeName(text, i);
			// Namespace prefix "ns|name": only the local name counts as a type selector.
			if (text[end] === "|" && text[end + 1] !== "|") {
				const after = end + 1;
				if (text[after] === "*") {
					i = after + 1;
					continue;
				}
				i = consumeName(text, after);
			} else {
				i = end;
			}
			c += 1;
			continue;
		}
		i++;
	}
	return { a, b, c };
}

/** Consumes a pseudo-class or pseudo-element at text[i] (text[i] === ":"), returns the next index. */
function consumePseudo(text, i, add) {
	const n = text.length;
	if (text[i + 1] === ":") {
		let j = consumeName(text, i + 2);
		const name = text.slice(i + 2, j).toLowerCase();
		if (text[j] === "(") {
			const end = consumeBalanced(text, j, "(", ")");
			if (name === "slotted") {
				// ::slotted() adds the specificity of its argument selector list.
				add(maxSpecificityOfList(text.slice(j + 1, end - 1)));
			}
			j = end;
		}
		add({ a: 0, b: 0, c: 1 });
		return j;
	}
	let j = consumeName(text, i + 1);
	const name = text.slice(i + 1, j).toLowerCase();
	if (LEGACY_PSEUDO_ELEMENTS.has(name) && text[j] !== "(") {
		add({ a: 0, b: 0, c: 1 });
		return j;
	}
	if (text[j] === "(") {
		const end = consumeBalanced(text, j, "(", ")");
		const inner = text.slice(j + 1, end - 1);
		if (MAX_ARGUMENT_PSEUDO_CLASSES.has(name)) {
			add(maxSpecificityOfList(inner));
		} else if (name !== "where") {
			// Ordinary functional pseudo-classes (:nth-child(), :lang(), ...) count once.
			add({ a: 0, b: 1, c: 0 });
		}
		// :where() contributes nothing, and its arguments contribute nothing.
		return end;
	}
	add({ a: 0, b: 1, c: 0 });
	return j;
}

/** Returns the highest specificity among the selectors of a comma-separated argument list. */
function maxSpecificityOfList(list) {
	const parts = splitSelectorList(list);
	let best = { a: 0, b: 0, c: 0 };
	for (const part of parts) {
		const candidate = specificityOfSingle(part);
		if (compareSpecificity(candidate, best) > 0) {
			best = candidate;
		}
	}
	return best;
}

/** Lexicographic comparison of two specificity triples. */
function compareSpecificity(left, right) {
	return (left.a - right.a)
		|| (left.b - right.b)
		|| (left.c - right.c);
}

/** Splits a selector list on top-level commas, ignoring commas inside (), [], and strings. */
function splitSelectorList(selector) {
	const parts = [];
	let depth = 0;
	let start = 0;
	let i = 0;
	const n = selector.length;
	while (i < n) {
		const ch = selector[i];
		if (ch === "\\") {
			i = consumeEscape(selector, i);
			continue;
		}
		if (ch === '"' || ch === "'") {
			i = consumeString(selector, i);
			continue;
		}
		if (ch === "(" || ch === "[") {
			depth++;
		} else if (ch === ")" || ch === "]") {
			depth--;
		} else if (ch === "," && depth === 0) {
			parts.push(selector.slice(start, i));
			start = i + 1;
		}
		i++;
	}
	parts.push(selector.slice(start));
	return parts;
}

/** Masks CSS comments without changing character offsets, reusing the cssScopeAudit approach. */
function maskComments(content) {
	return content.replace(
		/\/\*[\s\S]*?\*\//g,
		(comment) => comment.replace(/[^\n]/g, " ")
	);
}

/** Consumes text[i] === open through its matching close, respecting strings and escapes. */
function consumeBalanced(text, i, open, close) {
	const n = text.length;
	let depth = 0;
	let j = i;
	while (j < n) {
		const ch = text[j];
		if (ch === "\\") {
			j = consumeEscape(text, j);
			continue;
		}
		if (ch === '"' || ch === "'") {
			j = consumeString(text, j);
			continue;
		}
		if (ch === open) {
			depth++;
		} else if (ch === close) {
			depth--;
			if (depth === 0) {
				return j + 1;
			}
		}
		j++;
	}
	return j;
}

/** Consumes a quoted string starting at text[i], respecting backslash escapes. */
function consumeString(text, i) {
	const quote = text[i];
	const n = text.length;
	let j = i + 1;
	while (j < n) {
		const ch = text[j];
		if (ch === "\\") {
			j = consumeEscape(text, j);
			continue;
		}
		if (ch === quote) {
			return j + 1;
		}
		if (ch === "\n") {
			return j;
		}
		j++;
	}
	return j;
}

/** Consumes a CSS escape sequence starting at text[i] (text[i] === "\\"). */
function consumeEscape(text, i) {
	const n = text.length;
	let j = i + 1;
	if (j < n && isHexDigit(text[j])) {
		let count = 0;
		while (j < n && isHexDigit(text[j]) && count < 6) {
			j++;
			count++;
		}
		if (j < n && /\s/.test(text[j])) {
			j++;
		}
	} else if (j < n) {
		j++;
	}
	return j;
}

/** Consumes a CSS identifier starting at text[i], handling escapes (e.g. ".\31 23"). */
function consumeName(text, i) {
	const n = text.length;
	let j = i;
	while (j < n) {
		const ch = text[j];
		if (ch === "\\") {
			j = consumeEscape(text, j);
			continue;
		}
		if (!isNameChar(ch)) {
			break;
		}
		j++;
	}
	return j;
}

function isNameChar(ch) {
	if (ch === "-" || ch === "_") {
		return true;
	}
	const code = ch.codePointAt(0);
	return (code >= 0x30 && code <= 0x39)
		|| (code >= 0x41 && code <= 0x5A)
		|| (code >= 0x61 && code <= 0x7A)
		|| code >= 0x80;
}

function isHexDigit(ch) {
	const code = ch.codePointAt(0);
	return (code >= 0x30 && code <= 0x39)
		|| (code >= 0x41 && code <= 0x46)
		|| (code >= 0x61 && code <= 0x66);
}
