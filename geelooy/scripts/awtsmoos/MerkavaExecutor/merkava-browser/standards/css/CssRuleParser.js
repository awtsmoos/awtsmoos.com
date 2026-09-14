//B"H
//Boruch Hashem
//Blessed be He

{
const { tokenizeCss } = (typeof module === "object" && module.exports ? require("./CssSyntaxTokenizer.js") : globalThis.Merkava);

/**
 * Parses top-level CSS rules from tokenizer output while respecting nested blocks.
 * At-rules are preserved as structured rules instead of being blindly unwrapped.
 */
function parseCssRules(source) {
	const text = String(source || "");
	const tokens = tokenizeCss(text);
	const rules = [];
	let at = skipWhitespace(tokens, 0);
	while (at < tokens.length) {
		const parsed = tokens[at].type === "at-keyword"
			? consumeAtRule(text, tokens, at)
			: consumeQualifiedRule(text, tokens, at);
		if (!parsed) break;
		if (parsed.rule) rules.push(parsed.rule);
		at = skipWhitespace(tokens, parsed.next);
	}
	return rules;
}

/** Parses one ordinary selector rule through its balanced declaration block. */
function consumeQualifiedRule(text, tokens, start) {
	const open = findTopLevelDelimiter(tokens, start, "{");
	if (open < 0) return { next: tokens.length, rule: null };
	const close = findMatchingBrace(tokens, open);
	const prelude = sliceTokens(text, tokens, start, open).trim();
	const block = sliceTokens(text, tokens, open + 1, close).trim();
	return {
		next: close < tokens.length ? close + 1 : tokens.length,
		rule: prelude ? Object.freeze({ block, kind: "qualified", prelude }) : null
	};
}

/** Parses one at-rule, preserving both its prelude and optional balanced block. */
function consumeAtRule(text, tokens, start) {
	const name = String(tokens[start].value || "").toLowerCase();
	const boundary = findAtRuleBoundary(tokens, start + 1);
	if (boundary < 0) return { next: tokens.length, rule: null };
	const marker = tokens[boundary];
	const prelude = sliceTokens(text, tokens, start + 1, boundary).trim();
	if (marker.value === ";") {
		return {
			next: boundary + 1,
			rule: Object.freeze({ block: "", kind: "at", name, prelude })
		};
	}
	const close = findMatchingBrace(tokens, boundary);
	const block = sliceTokens(text, tokens, boundary + 1, close).trim();
	return {
		next: close < tokens.length ? close + 1 : tokens.length,
		rule: Object.freeze({ block, kind: "at", name, prelude })
	};
}

function findAtRuleBoundary(tokens, start) {
	let depth = 0;
	for (let index = start; index < tokens.length; index += 1) {
		const value = tokens[index].value;
		if (value === "(" || value === "[") depth += 1;
		if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
		if (depth === 0 && (value === ";" || value === "{")) return index;
	}
	return -1;
}

function findTopLevelDelimiter(tokens, start, wanted) {
	let depth = 0;
	for (let index = start; index < tokens.length; index += 1) {
		const value = tokens[index].value;
		if (value === "(" || value === "[") depth += 1;
		if (value === ")" || value === "]") depth = Math.max(0, depth - 1);
		if (depth === 0 && value === wanted) return index;
	}
	return -1;
}

function findMatchingBrace(tokens, open) {
	let depth = 0;
	for (let index = open; index < tokens.length; index += 1) {
		if (tokens[index].value === "{") depth += 1;
		if (tokens[index].value === "}") depth -= 1;
		if (depth === 0) return index;
	}
	return tokens.length;
}

function sliceTokens(text, tokens, start, end) {
	if (start >= end || start >= tokens.length) return "";
	const first = tokens[start].start;
	const last = tokens[Math.min(end, tokens.length) - 1].end;
	return text.slice(first, last);
}

function skipWhitespace(tokens, at) {
	let index = at;
	while (tokens[index]?.type === "whitespace") index += 1;
	return index;
}

const AwtsExports = { parseCssRules };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
