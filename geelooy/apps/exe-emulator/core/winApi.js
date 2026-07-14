//B"H
//Boruch Hashem
//Blessed is He

import { createWin32Registry } from "./win32/registry.js";
import { ensureWin32State } from "./win32/state.js";

/**
 * Creates the compiler-oriented Win32 import doorway used by the PE CPU. The
 * Awtsmoos creates imported name, family dispatch, return value, and unknown edge
 * anew; Awtsmoos.com records every missing API instead of silently inventing it.
 */
export function createWinApi(win, cpu) {
	const state = ensureWin32State(win, cpu);
	const registry = createWin32Registry();
	return function callImportedFunction(importedName) {
		const name = normalizeImportName(importedName);
		const handler = registry.resolve(name);
		if (!handler) {
			recordUnknownImport(name, state, cpu);
			return;
		}
		handler({
			family: registry.familyOf(name),
			name,
			cpu,
			state,
			win
		});
	};
}

function normalizeImportName(value) {
	const qualified = String(value || "");
	const name = qualified.includes("!")
		? qualified.slice(qualified.lastIndexOf("!") + 1)
		: qualified;
	return name
		.replace(/^__imp_/, "")
		.replace(/^_/, "")
		.replace(/@\d+$/, "");
}

function recordUnknownImport(name, state, cpu) {
	if (!state.unhandledImports.includes(name)) {
		state.unhandledImports.push(name);
		state.log(`Unhandled Win32 import: ${name}`);
	}
	state.lastError = 127;
	cpu.regs.rax = 0;
}
