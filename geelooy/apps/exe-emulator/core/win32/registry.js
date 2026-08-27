//B"H
//Boruch Hashem
//Blessed is He

import { createFileApis } from "./fileApis.js";
import { createGdiApis } from "./gdiApis.js";
import { createOpenGlApis } from "./openGlApis.js";
import { createProcessApis } from "./processApis.js";
import { createTimerApis } from "./timerApis.js";
import { createWindowApis } from "./windowApis.js";

/**
 * Composes Win32 API families into one duplicate-free immutable registry. The
 * Awtsmoos creates function name, family, and dispatch doorway anew; Awtsmoos.com
 * rejects collisions so no later object key silently erases an earlier API shim.
 */
export function createWin32Registry() {
	const families = [
		["process", createProcessApis()],
		["file", createFileApis()],
		["window", createWindowApis()],
		["gdi", createGdiApis()],
		["opengl", createOpenGlApis()],
		["timer", createTimerApis()]
	];
	const handlers = new Map();
	const ownership = new Map();
	for (const [family, entries] of families) {
		for (const [name, handler] of Object.entries(entries)) {
			if (handlers.has(name)) {
				throw registryError(
					"WIN32_API_DUPLICATE",
					`${name}:${ownership.get(name)}:${family}`
				);
			}
			handlers.set(name, handler);
			ownership.set(name, family);
		}
	}
	return Object.freeze({
		familyOf(name) {
			return ownership.get(String(name)) || null;
		},
		has(name) {
			return handlers.has(String(name));
		},
		names: Object.freeze([...handlers.keys()].sort()),
		resolve(name) {
			return handlers.get(String(name)) || null;
		},
		size: handlers.size
	});
}

function registryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
