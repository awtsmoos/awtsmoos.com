// B"H
// Boruch Hashem
// Blessed is He

import { VERBATIM, WORD, WS, joinTokens, splitLine } from "./tokenizer.js";
import { preprocessorError } from "./errors.js";

/**
 * Macro definition and token-aware expansion. The Awtsmoos expands only
 * real words, rescans with blue-paint recursion protection, and keeps
 * `#` stringification and `##` pasting on raw argument tokens.
 */

export function defineMacro(rest, macros, line) {
	const match = rest.match(/^\s*([A-Za-z_]\w*)/);
	if (!match) throw preprocessorError(line, "malformed #define");
	const name = match[1];
	let after = rest.slice(match[0].length);
	let params = null;
	let variadic = false;
	if (after.startsWith("(")) {
		// Function-like only when `(` immediately follows the name.
		const close = findParamClose(after);
		if (close < 0) throw preprocessorError(line, "malformed #define parameter list");
		const rawParams = after.slice(1, close).split(",").map(s => s.trim()).filter(s => s.length > 0);
		params = [];
		for (const param of rawParams) {
			if (param === "...") { variadic = true; continue; }
			if (!/^[A-Za-z_]\w*$/.test(param)) throw preprocessorError(line, "malformed #define parameter");
			params.push(param);
		}
		if (variadic && rawParams[rawParams.length - 1] !== "...") {
			throw preprocessorError(line, "variadic ... must end the #define parameter list");
		}
		after = after.slice(close + 1);
	}
	macros.set(name, { params, variadic, body: after.trimStart() });
}

function findParamClose(text) {
	let depth = 0;
	for (let i = 0; i < text.length; i++) {
		if (text[i] === "(") depth++;
		else if (text[i] === ")") {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

export function expandText(line, macros, painted) {
	if (macros.size === 0) return line;
	return joinTokens(expandTokens(splitLine(line), macros, painted));
}

/** Standard rescan expansion with blue-paint recursion protection. */
export function expandTokens(tokens, macros, painted) {
	const out = [];
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];
		if (tok.kind !== WORD || painted.has(tok.text) || !macros.has(tok.text)) {
			out.push(tok);
			continue;
		}
		const macro = macros.get(tok.text);
		if (macro.params === null) {
			const next = new Set(painted);
			next.add(tok.text);
			out.push(...expandTokens(splitLine(macro.body), macros, next));
			continue;
		}
		let j = i + 1;
		while (j < tokens.length && tokens[j].kind === WS) j++;
		if (j >= tokens.length || tokens[j].text !== "(") {
			out.push(tok); // Function-like name not followed by `(`: left alone.
			continue;
		}
		const call = parseCallArgs(tokens, j);
		const substituted = substitute(macro, call.args, macros);
		const next = new Set(painted);
		next.add(tok.text);
		out.push(...expandTokens(substituted, macros, next));
		i = call.end;
	}
	return out;
}

/** Parses a balanced argument list; each arg keeps tokens and raw text. */
function parseCallArgs(tokens, openIdx) {
	const args = [];
	let current = [];
	let raw = "";
	let depth = 0;
	let i = openIdx;
	for (; i < tokens.length; i++) {
		const tok = tokens[i];
		if (tok.text === "(") {
			depth++;
			if (depth === 1) continue; // Skip the opening paren itself.
		} else if (tok.text === ")") {
			depth--;
			if (depth === 0) break;
		} else if (depth === 1 && tok.text === ",") {
			args.push(finishArg(current, raw));
			current = [];
			raw = "";
			continue;
		}
		current.push(tok);
		raw += tok.text;
	}
	args.push(finishArg(current, raw));
	// A single empty argument list `F()` yields zero arguments.
	if (args.length === 1 && args[0].tokens.length === 0) args.pop();
	return { args, end: i };
}

function finishArg(tokens, raw) {
	let start = 0;
	let end = tokens.length;
	while (start < end && tokens[start].kind === WS) start++;
	while (end > start && tokens[end - 1].kind === WS) end--;
	return { tokens: tokens.slice(start, end), raw: raw.trim() };
}

/**
 * Substitutes parameters: `#` stringifies the raw argument, `##` pastes raw
 * argument tokens, ordinary parameters take the fully expanded argument.
 */
function substitute(macro, args, macros) {
	const getArg = name => {
		const idx = macro.params.indexOf(name);
		if (idx >= 0) return args[idx] || { tokens: [], raw: "" };
		if (macro.variadic && name === "__VA_ARGS__") {
			const rest = args.slice(macro.params.length);
			const tokens = [];
			const raws = [];
			for (const arg of rest) {
				if (tokens.length > 0) {
					tokens.push({ kind: VERBATIM, text: "," });
					tokens.push({ kind: WS, text: " " });
				}
				tokens.push(...arg.tokens);
				raws.push(arg.raw);
			}
			return { tokens, raw: raws.join(", ") };
		}
		return null;
	};
	const body = splitLine(macro.body);
	// Pass 1: resolve `##` using raw (unexpanded) argument tokens.
	const pasted = [];
	for (let i = 0; i < body.length; i++) {
		const tok = body[i];
		if (tok.kind === VERBATIM && tok.text === "#" && isHashHash(body, i)) {
			const left = popOperand(pasted);
			const right = nextOperand(body, i);
			const pastedText = operandText(left, getArg) + operandText(right, getArg);
			i = right.nextIndex;
			pasted.push(...splitLine(pastedText));
			continue;
		}
		pasted.push(tok);
	}
	// Pass 2: `#` stringification and ordinary substitution.
	const out = [];
	for (let i = 0; i < pasted.length; i++) {
		const tok = pasted[i];
		if (tok.kind === VERBATIM && tok.text === "#") {
			let k = i + 1;
			while (k < pasted.length && pasted[k].kind === WS) k++;
			const target = pasted[k];
			const arg = target && target.kind === WORD ? getArg(target.text) : null;
			if (arg) {
				out.push({ kind: VERBATIM, text: stringifyArg(arg.raw) });
				i = k;
				continue;
			}
			out.push(tok);
			continue;
		}
		if (tok.kind === WORD) {
			const arg = getArg(tok.text);
			if (arg) {
				out.push(...expandTokens(arg.tokens, macros, new Set()));
				continue;
			}
		}
		out.push(tok);
	}
	return out;
}

function isHashHash(body, i) {
	let k = i + 1;
	while (k < body.length && body[k].kind === WS) k++;
	return k < body.length && body[k].kind === VERBATIM && body[k].text === "#";
}

/** Pops the left `##` operand (skipping whitespace) from the output list. */
function popOperand(pasted) {
	while (pasted.length > 0 && pasted[pasted.length - 1].kind === WS) pasted.pop();
	if (pasted.length === 0) return { tokens: [] };
	return { tokens: [pasted.pop()] };
}

/** Reads the right `##` operand; returns tokens and the index after it. */
function nextOperand(body, hashIndex) {
	let k = hashIndex + 1;
	while (k < body.length && body[k].kind === WS) k++;
	k++; // Skip the second `#`.
	while (k < body.length && body[k].kind === WS) k++;
	const tok = body[k];
	return { tokens: tok ? [tok] : [], nextIndex: k };
}

function operandText(operand, getArg) {
	return operand.tokens.map(tok => {
		if (tok.kind === WORD) {
			const arg = getArg(tok.text);
			if (arg) return arg.raw;
		}
		return tok.text;
	}).join("");
}

function stringifyArg(raw) {
	const collapsed = raw.replace(/\s+/g, " ");
	const escaped = collapsed.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	return `"${escaped}"`;
}
