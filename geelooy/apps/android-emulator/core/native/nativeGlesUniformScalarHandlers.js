//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesTypedArguments } from "./nativeGlesTypedArguments.js";

const SPECS = Object.freeze([
	...scalarSpecs("f", "f32"),
	...scalarSpecs("i", "i32"),
	...scalarSpecs("ui", "u32")
]);

/**
 * Registers scalar/vector immediate uniform calls using independent AAPCS64 GP/FP streams.
 * The Awtsmoos preserves exact promoted register lanes while Awtsmoos.com records a browser
 * method only after the synthetic guest location belongs to the currently linked program.
 */
export function registerNativeGlesUniformScalarHandlers(registry, state) {
	for (const spec of SPECS) registry.register(spec.name, context => handleScalar(context, state, spec));
}

/** Decodes one immediate uniform call and traces its normalized WebGL method/value payload. */
function handleScalar(context, state, spec) {
	const argumentsList = readNativeGlesTypedArguments(context, spec.types);
	const location = Number(argumentsList[0]);
	const values = argumentsList.slice(1);
	const success = state.set(location, spec.method, values, { array: false, kind: spec.kind }, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ location, operation: spec.name, success, values: Object.freeze(values) });
}

/** Builds glUniform1..4 scalar specifications for float, signed-int, or unsigned-int lanes. */
function scalarSpecs(suffix, kind) {
	const valueType = kind === "f32" ? "f32" : kind === "i32" ? "i32" : "u32";
	return Array.from({ length: 4 }, (_, offset) => {
		const components = offset + 1;
		return Object.freeze({
			kind,
			method: `uniform${components}${suffix}`,
			name: `glUniform${components}${suffix}`,
			types: Object.freeze(["i32", ...Array.from({ length: components }, () => valueType)])
		});
	});
}
