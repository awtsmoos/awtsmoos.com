// B"H
// Boruch Hashem
// Blessed is He

import { STD_LIBS } from "../std/index.js";
import { defineMacro, expandText } from "./expansion.js";
import { includeError, preprocessorError } from "./errors.js";
import { evalIfExpression } from "./ifExpr.js";

/**
 * Preprocessing directive execution. The Awtsmoos tracks conditional nesting
 * even inside skipped regions; every other directive acts only when active.
 */

export function processLines(lines, state, condStack, output) {
	for (const line of lines) {
		const directive = parseDirective(line);
		if (directive) {
			handleDirective(directive, line, state, condStack, output);
			continue;
		}
		if (!isActive(condStack)) continue;
		output.push(expandText(line, state.macros, new Set()));
	}
}

/** Recognizes a preprocessing directive; the `#` must lead the logical line. */
function parseDirective(line) {
	const match = line.match(/^\s*#\s*([A-Za-z_]\w*)?(.*)$/);
	if (!match) return null;
	return { name: match[1] || "", rest: match[2] || "" };
}

function isActive(condStack) {
	return condStack.length === 0 || condStack[condStack.length - 1].active;
}

function handleDirective(directive, line, state, condStack, output) {
	const { name, rest } = directive;
	const active = isActive(condStack);
	// Conditional directives and #error are always tracked, even in
	// skipped regions, so nesting stays correct.
	if (name === "if" || name === "ifdef" || name === "ifndef") {
		const parentActive = active;
		let branchActive = false;
		if (parentActive) {
			if (name === "ifdef") branchActive = state.macros.has(firstWord(rest));
			else if (name === "ifndef") branchActive = !state.macros.has(firstWord(rest));
			else branchActive = evalIfExpression(rest, state.macros) !== 0n;
		}
		condStack.push({ parentActive, taken: branchActive, active: branchActive, elseSeen: false });
		return;
	}
	if (name === "elif") {
		const frame = condStack[condStack.length - 1];
		if (!frame) throw preprocessorError(line, "stray #elif");
		if (frame.elseSeen) throw preprocessorError(line, "#elif after #else");
		if (!frame.parentActive || frame.taken) {
			frame.active = false;
		} else {
			frame.active = evalIfExpression(rest, state.macros) !== 0n;
			frame.taken = frame.taken || frame.active;
		}
		return;
	}
	if (name === "else") {
		const frame = condStack[condStack.length - 1];
		if (!frame) throw preprocessorError(line, "stray #else");
		if (frame.elseSeen) throw preprocessorError(line, "duplicate #else");
		frame.elseSeen = true;
		frame.active = frame.parentActive && !frame.taken;
		frame.taken = frame.taken || frame.active;
		return;
	}
	if (name === "endif") {
		if (condStack.length === 0) throw preprocessorError(line, "stray #endif");
		condStack.pop();
		return;
	}
	if (name === "error") {
		throw preprocessorError(line, `#error ${rest.trim()}`);
	}
	// Every other directive only acts inside an active region.
	if (!active) return;
	switch (name) {
		case "define":
			defineMacro(rest, state.macros, line);
			return;
		case "undef": {
			const target = firstWord(rest);
			if (!/^[A-Za-z_]\w*$/.test(target)) throw preprocessorError(line, "malformed #undef");
			state.macros.delete(target);
			return;
		}
		case "include": {
			const expanded = expandText(rest, state.macros, new Set()).trim();
			const inc = expanded.match(/^[<"]([^>"]+)[>"]$/);
			if (!inc) throw preprocessorError(line, "malformed #include");
			expandInclude(inc[1], state, condStack, output);
			return;
		}
		case "warning":
		case "pragma":
		case "line":
		case "":
			return; // Explicitly tolerated no-ops.
		default:
			throw preprocessorError(line, `Unsupported C preprocessor directive: ${line.trim()}`);
	}
}

function firstWord(text) {
	const match = String(text).trim().match(/^[A-Za-z_]\w*/);
	return match ? match[0] : "";
}

function expandInclude(name, state, condStack, output) {
	const header = STD_LIBS[name];
	if (!header) throw includeError(name);
	if (state.included.has(name)) return;
	state.included.add(name);
	output.push(`// BEGIN AWTSMOOS HEADER ${name}`);
	processLines(String(header).replace(/\\\r?\n/g, "").split("\n"), state, condStack, output);
	output.push(`// END AWTSMOOS HEADER ${name}`);
}
