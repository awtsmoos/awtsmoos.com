//B"H
//Boruch Hashem
//Blessed be He

import {
	collectNativeGlesUniformDeclarations
} from "./nativeGlesUniformDeclarations.js";
import { nativeGlesGlslTypeInfo } from "./nativeGlesGlslTypes.js";

/**
 * Resolves the program currently bound to one GLES context.
 *
 * Newer object-state implementations expose a direct current() accessor, while
 * older compatible facades expose the same immutable truth through snapshot().
 * Supporting both contracts keeps uniform validation independent of object-state
 * representation without fabricating any guest-visible program identity.
 *
 * @param {object} objects Native GLES object-state facade.
 * @param {bigint|number|string} contextValue Current EGL context identity.
 * @returns {number} Current guest program handle, or zero when none is bound.
 */
export function resolveNativeGlesCurrentProgram(objects, contextValue) {
	if (typeof objects.current === "function") {
		return Number(objects.current(contextValue)) || 0;
	}
	const key = BigInt(contextValue).toString();
	const pairs = objects.snapshot?.().currentPrograms;
	const pair = Array.isArray(pairs)
		? pairs.find(([context]) => context === key)
		: null;
	return pair ? Number(pair[1]) : 0;
}

/**
 * Queries one synthetic uniform location using its owning linked program.
 *
 * Stored values come only from successful guest setters. Untouched locations use
 * GLES zero defaults sized from the real linked shader declaration. Invalid
 * program/location/type combinations report GL_INVALID_OPERATION through the
 * shared query domain and return an immutable failed result.
 *
 * @param {object} options Query dependencies and persistent uniform maps.
 * @returns {object} Frozen typed query result consumed by glGetUniform handlers.
 */
export function queryNativeGlesUniform(options) {
	const { byLocation, locationValue, objects, program, thread, valuesByLocation } = options;
	const outcome = objects.program(program, thread);
	const location = Number(locationValue);
	const record = byLocation.get(location);
	if (!outcome.success) {
		return queryFailure();
	}
	if (!outcome.record.linked || !record || record.program !== Number(program)) {
		objects.domain.invalidOperation(thread);
		return queryFailure();
	}
	const info = declarationInfo(outcome.record, record.name, objects, thread);
	if (!info) {
		objects.domain.invalidOperation(thread);
		return queryFailure();
	}
	const values = valuesByLocation.get(location)
		|| Array.from({ length: info.width }, () => 0);
	return Object.freeze({
		kind: info.queryKind,
		success: true,
		values: Object.freeze([...values])
	});
}

/** Resolves one canonical uniform name into its linked GLSL query metadata. */
function declarationInfo(program, canonical, objects, thread) {
	const baseName = String(canonical).replace(/\[\d+\]$/, "");
	const declarations = collectNativeGlesUniformDeclarations(
		program,
		objects,
		thread
	);
	const declaration = declarations.get(baseName);
	return declaration
		? nativeGlesGlslTypeInfo(declaration.type)
		: null;
}

/** Returns one stable failed-query shape without guest-memory side effects. */
function queryFailure() {
	return Object.freeze({
		kind: "float",
		success: false,
		values: Object.freeze([])
	});
}
