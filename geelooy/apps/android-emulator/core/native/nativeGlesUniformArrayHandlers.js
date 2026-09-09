//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesUniformValues } from "./nativeGlesUniformMemory.js";

const SPECS = Object.freeze([
	...arraySpecs("f", "f32"),
	...arraySpecs("i", "i32"),
	...arraySpecs("ui", "u32")
]);

/** Registers pointer-based uniform vector arrays with exact guest-memory decoding. */
export function registerNativeGlesUniformArrayHandlers(registry, state) {
	for (const spec of SPECS) registry.register(spec.name, context => handleArray(context, state, spec));
}

/** Reads location/count/pointer, bounds the lane count, and traces one typed vector upload. */
function handleArray(context, state, spec) {
	const location = signed32(readNativeGlesArgument(context, 0, 32));
	const count = signed32(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const values = count < 0 ? null : readNativeGlesUniformValues(context.memory, address, count * spec.components, spec.kind);
	let success = false;
	if (values) success = state.set(location, spec.method, values, { array: true, kind: spec.kind }, nativeGlesThreadValue(context));
	else state.domain.invalidValue(nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ count, location, operation: spec.name, success });
}

/** Builds glUniform1..4*v array specifications without duplicating ABI handlers. */
function arraySpecs(suffix, kind) {
	return Array.from({ length: 4 }, (_, offset) => {
		const components = offset + 1;
		return Object.freeze({
			components,
			kind,
			method: `uniform${components}${suffix}v`,
			name: `glUniform${components}${suffix}v`
		});
	});
}

/** Interprets one GLint/GLsizei lane using two's-complement 32-bit semantics. */
function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
