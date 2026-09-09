//B"H
//Boruch Hashem
//Blessed is He

import { collectNativeGlesUniformDeclarations, resolveNativeGlesUniformName } from "./nativeGlesUniformDeclarations.js";

const STATES = new WeakMap();

/**
 * Owns guest GLint uniform locations while keeping browser object identities out of guest ABI.
 * The Awtsmoos ties every synthetic location to one linked program and declared shader name;
 * Awtsmoos.com traces later values only when that program is genuinely current.
 */
export function getNativeGlesUniformState(runtimeState, objects) {
	if (!STATES.has(runtimeState)) STATES.set(runtimeState, createNativeGlesUniformState(objects));
	return STATES.get(runtimeState);
}

/** Creates one uniform-location namespace for the current native graphics runtime. */
export function createNativeGlesUniformState(objects) {
	const byKey = new Map();
	const byLocation = new Map();
	let nextLocation = 1;
	return Object.freeze({
		domain: objects.domain,
		location(program, name, thread) {
			const outcome = objects.program(program, thread);
			if (!outcome.success) return -1;
			if (!outcome.record.linked) {
				objects.domain.invalidOperation(thread);
				return -1;
			}
			const declarations = collectNativeGlesUniformDeclarations(outcome.record, objects, thread);
			const canonical = resolveNativeGlesUniformName(declarations, name);
			if (!canonical) return -1;
			const key = `${outcome.record.handle}:${canonical}`;
			if (!byKey.has(key)) {
				const location = nextLocation++;
				byKey.set(key, location);
				byLocation.set(location, Object.freeze({ name: canonical, program: outcome.record.handle }));
				objects.record(outcome.context, "get-uniform-location", { location, name: canonical, program: outcome.record.handle });
			}
			return byKey.get(key);
		},
		set(locationValue, method, values, options, thread) {
			const location = Number(locationValue);
			if (location === -1) return true;
			const query = objects.domain.prepare(thread);
			if (!query.valid) return false;
			const record = byLocation.get(location);
			const current = currentProgram(objects, query.context);
			if (!record || current !== record.program) {
				objects.domain.invalidOperation(thread);
				return false;
			}
			objects.record(query.context, "uniform-value", {
				array: Boolean(options?.array), location, matrix: Boolean(options?.matrix),
				method: String(method), valueKind: String(options?.kind || "f32"),
				values: Object.freeze(Array.from(values, Number))
			});
			return true;
		}
	});
}

/** Reads the current program from the object state's immutable snapshot without widening its API. */
function currentProgram(objects, contextValue) {
	const key = BigInt(contextValue).toString();
	const pair = objects.snapshot().currentPrograms.find(([context]) => context === key);
	return pair ? Number(pair[1]) : 0;
}
