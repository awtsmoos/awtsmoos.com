// B"H
// Boruch Hashem
// Blessed is He

import { scanQuoted } from "./tokenizer.js";
import { expandText } from "./expansion.js";

/**
 * `#if` / `#elif` integer constant expression evaluation. The Awtsmoos
 * weighs every operator anew; undefined identifiers count as zero and
 * division by zero fails closed.
 */

export function evalIfExpression(text, macros) {
	let expanded = text.replace(/\bdefined\s*\(\s*([A-Za-z_]\w*)\s*\)/g, (_, name) =>
		macros.has(name) ? "1" : "0");
	expanded = expanded.replace(/\bdefined\s+([A-Za-z_]\w*)/g, (_, name) =>
		macros.has(name) ? "1" : "0");
	expanded = expandText(expanded, macros, new Set());
	const tokens = tokenizeIfExpr(expanded);
	const parser = { tokens, pos: 0 };
	const value = parseIfConditional(parser);
	if (parser.pos < tokens.length) {
		throw new Error(`Malformed #if expression: ${text.trim()}`);
	}
	return value;
}

function tokenizeIfExpr(text) {
	const tokens = [];
	let i = 0;
	while (i < text.length) {
		const ch = text[i];
		if (/\s/.test(ch)) { i++; continue; }
		if (ch === "'") {
			const end = scanQuoted(text, i);
			tokens.push({ type: "num", value: evalCharLiteral(text.slice(i, end)) });
			i = end;
			continue;
		}
		const two = text.slice(i, i + 2);
		if (["==", "!=", "<=", ">=", "&&", "||", "<<", ">>"].includes(two)) {
			tokens.push({ type: "op", value: two });
			i += 2;
			continue;
		}
		if ("+-*/%<>&^|!~?:()".includes(ch)) {
			tokens.push({ type: "op", value: ch });
			i++;
			continue;
		}
		const num = text.slice(i).match(/^(0[xX][0-9A-Fa-f]+|0[0-7]*|[0-9]+)/);
		if (num) {
			tokens.push({ type: "num", value: parseIfNumber(num[1]) });
			i += num[1].length;
			continue;
		}
		const word = text.slice(i).match(/^[A-Za-z_]\w*/);
		if (word) {
			tokens.push({ type: "num", value: 0n }); // Undefined identifiers are 0.
			i += word[0].length;
			continue;
		}
		throw new Error(`Bad #if character '${ch}'`);
	}
	return tokens;
}

function parseIfNumber(raw) {
	if (/^0[xX]/.test(raw)) return BigInt(raw);
	if (/^0/.test(raw) && raw.length > 1) return BigInt("0o" + raw.slice(1));
	return BigInt(raw);
}

function evalCharLiteral(raw) {
	const inner = raw.slice(1, -1);
	if (inner.startsWith("\\")) {
		const table = { n: 10n, r: 13n, t: 9n, "0": 0n, "'": 39n, '"': 34n, "\\": 92n };
		if (table[inner[1]] !== undefined) return table[inner[1]];
	}
	return BigInt(inner.codePointAt(0));
}

function ifPeek(p) { return p.tokens[p.pos] || { type: "eof" }; }
function ifNext(p) { return p.tokens[p.pos++]; }

function parseIfConditional(p) {
	const cond = parseIfOr(p);
	if (ifPeek(p).value === "?") {
		ifNext(p);
		const then = parseIfConditional(p);
		if (ifPeek(p).value !== ":") throw new Error("Malformed #if ternary");
		ifNext(p);
		const els = parseIfConditional(p);
		return cond !== 0n ? then : els;
	}
	return cond;
}

function parseIfBinary(p, next, ops) {
	let left = next(p);
	while (ifPeek(p).type === "op" && ops.includes(ifPeek(p).value)) {
		const op = ifNext(p).value;
		const right = next(p);
		left = applyIfOp(op, left, right);
	}
	return left;
}

const parseIfOr = p => parseIfBinary(p, parseIfAnd, ["||"]);
const parseIfAnd = p => parseIfBinary(p, parseIfBitOr, ["&&"]);
const parseIfBitOr = p => parseIfBinary(p, parseIfBitXor, ["|"]);
const parseIfBitXor = p => parseIfBinary(p, parseIfBitAnd, ["^"]);
const parseIfBitAnd = p => parseIfBinary(p, parseIfEquality, ["&"]);
const parseIfEquality = p => parseIfBinary(p, parseIfRelational, ["==", "!="]);
const parseIfRelational = p => parseIfBinary(p, parseIfShift, ["<", "<=", ">", ">="]);
const parseIfShift = p => parseIfBinary(p, parseIfAdditive, ["<<", ">>"]);
const parseIfAdditive = p => parseIfBinary(p, parseIfMultiplicative, ["+", "-"]);
const parseIfMultiplicative = p => parseIfBinary(p, parseIfUnary, ["*", "/", "%"]);

function parseIfUnary(p) {
	const tok = ifPeek(p);
	if (tok.type === "op" && ["+", "-", "!", "~"].includes(tok.value)) {
		ifNext(p);
		const value = parseIfUnary(p);
		if (tok.value === "-") return -value;
		if (tok.value === "!") return value === 0n ? 1n : 0n;
		if (tok.value === "~") return ~value;
		return value;
	}
	if (tok.type === "op" && tok.value === "(") {
		ifNext(p);
		const value = parseIfConditional(p);
		if (ifPeek(p).value !== ")") throw new Error("Malformed #if parentheses");
		ifNext(p);
		return value;
	}
	if (tok.type === "num") { ifNext(p); return tok.value; }
	throw new Error("Malformed #if expression");
}

function applyIfOp(op, left, right) {
	switch (op) {
		case "||": return (left !== 0n || right !== 0n) ? 1n : 0n;
		case "&&": return (left !== 0n && right !== 0n) ? 1n : 0n;
		case "|": return left | right;
		case "^": return left ^ right;
		case "&": return left & right;
		case "==": return left === right ? 1n : 0n;
		case "!=": return left !== right ? 1n : 0n;
		case "<": return left < right ? 1n : 0n;
		case "<=": return left <= right ? 1n : 0n;
		case ">": return left > right ? 1n : 0n;
		case ">=": return left >= right ? 1n : 0n;
		case "<<": return left << right;
		case ">>": return left >> right;
		case "+": return left + right;
		case "-": return left - right;
		case "*": return left * right;
		case "/":
			if (right === 0n) throw new Error("#if division by zero");
			return left / right;
		case "%":
			if (right === 0n) throw new Error("#if division by zero");
			return left % right;
		default: throw new Error(`Bad #if operator ${op}`);
	}
}
