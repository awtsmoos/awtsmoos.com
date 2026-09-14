//B"H
//Boruch Hashem
//Blessed be He

import { collectNativeGlesUniformDeclarations, resolveNativeGlesUniformName } from "./nativeGlesUniformDeclarations.js";
import { queryNativeGlesUniform, resolveNativeGlesCurrentProgram } from "./nativeGlesUniformQueryState.js";

const STATES = new WeakMap();

/**
 * Returns one persistent program/location/value namespace for a native runtime.
 *
 * The namespace is keyed by runtime identity so every Flutter engine preserves
 * its own guest GLint locations and values without leaking browser-side objects.
 *
 * @param {object} runtimeState Native runtime identity owning GLES state.
 * @param {object} objects Shader/program object-state facade.
 * @returns {object} Persistent immutable uniform-state API.
 */
export function getNativeGlesUniformState(runtimeState, objects) {
	if (!STATES.has(runtimeState)) {
		STATES.set(runtimeState, createNativeGlesUniformState(objects));
	}
	return STATES.get(runtimeState);
}

/**
 * Creates synthetic GLint uniform locations and retains their current GLES values.
 *
 * Locations remain program-owned. Setters accept only the owning program while it
 * is current on the active context; queries preserve typed zero defaults for values
 * that have never been set. All guest-visible errors flow through the GLES domain.
 *
 * @param {object} objects Native shader/program object-state facade.
 * @returns {object} Frozen uniform state used by native GLES handlers.
 */
export function createNativeGlesUniformState(objects) {
	const byKey = new Map();
	const byLocation = new Map();
	const valuesByLocation = new Map();
	let nextLocation = 1;
	return Object.freeze({
		domain: objects.domain,
		location(program, name, thread) {
			const outcome = objects.program(program, thread);
			if (!outcome.success) {
				return -1;
			}
			if (!outcome.record.linked) {
				objects.domain.invalidOperation(thread);
				return -1;
			}
			const declarations = collectNativeGlesUniformDeclarations(
				outcome.record,
				objects,
				thread
			);
			const canonical = resolveNativeGlesUniformName(declarations, name);
			if (!canonical) {
				return -1;
			}
			const key = `${outcome.record.handle}:${canonical}`;
			if (!byKey.has(key)) {
				const location = nextLocation++;
				byKey.set(key, location);
				byLocation.set(location, Object.freeze({
					name: canonical,
					program: outcome.record.handle
				}));
				objects.record(outcome.context, "get-uniform-location", {
					location,
					name: canonical,
					program: outcome.record.handle
				});
			}
			return byKey.get(key);
		},
		query(program, locationValue, thread) {
			return queryNativeGlesUniform({
				byLocation,
				locationValue,
				objects,
				program,
				thread,
				valuesByLocation
			});
		},
		set(locationValue, method, values, options, thread) {
			const location = Number(locationValue);
			if (location === -1) {
				return true;
			}
			const query = objects.domain.prepare(thread);
			if (!query.valid) {
				return false;
			}
			const record = byLocation.get(location);
			const current = resolveNativeGlesCurrentProgram(
				objects,
				query.context
			);
			if (!record || current !== record.program) {
				objects.domain.invalidOperation(thread);
				return false;
			}
			const normalized = Object.freeze(Array.from(values, Number));
			valuesByLocation.set(location, normalized);
			objects.record(query.context, "uniform-value", {
				array: Boolean(options?.array),
				location,
				matrix: Boolean(options?.matrix),
				method: String(method),
				valueKind: String(options?.kind || "f32"),
				values: normalized
			});
			return true;
		}
	});
}
